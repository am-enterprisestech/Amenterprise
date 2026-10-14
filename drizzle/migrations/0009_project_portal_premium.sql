-- =============================================================================
-- Migration 0009 — Premium Project Portal: Updates, Timeline, Approvals,
--                  Change Requests + missing milestone columns
--
-- Run in Supabase SQL Editor — safe to re-run (IF NOT EXISTS throughout)
-- =============================================================================

-- ─── 1. Extra columns on existing tables ─────────────────────────────────────

-- projects: long description + health status + current phase label
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS description     text,
  ADD COLUMN IF NOT EXISTS current_phase   text,
  ADD COLUMN IF NOT EXISTS health          text NOT NULL DEFAULT 'on_track',
  ADD COLUMN IF NOT EXISTS health_note     text;
  -- health values: on_track | at_risk | delayed | completed

-- project_milestones: completed_at + progress per milestone
ALTER TABLE public.project_milestones
  ADD COLUMN IF NOT EXISTS progress      integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completed_at  timestamptz,
  ADD COLUMN IF NOT EXISTS start_date    date;

-- ─── 2. project_updates — admin-published live project updates ────────────────

CREATE TABLE IF NOT EXISTS public.project_updates (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title         text        NOT NULL,
  body          text        NOT NULL,
  kind          text        NOT NULL DEFAULT 'general',
  -- kind: general | milestone | design | qa | launch | blocker
  progress_pct  integer,    -- optional: new overall progress after this update
  published     boolean     NOT NULL DEFAULT true,
  published_by  text,       -- staff name (denormalized for display)
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_updates TO authenticated;
GRANT ALL ON public.project_updates TO service_role;

DROP POLICY IF EXISTS pu_admin   ON public.project_updates;
DROP POLICY IF EXISTS pu_client  ON public.project_updates;

CREATE POLICY pu_admin ON public.project_updates
  FOR ALL TO authenticated
  USING     (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK(public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY pu_client ON public.project_updates
  FOR SELECT TO authenticated
  USING (published = true AND public.is_client_of_project(project_id));

CREATE INDEX IF NOT EXISTS project_updates_project_idx ON public.project_updates(project_id, created_at DESC);

ALTER TABLE public.project_updates REPLICA IDENTITY FULL;
DO $$ BEGIN
  BEGIN EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.project_updates';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

DROP TRIGGER IF EXISTS project_updates_updated_at ON public.project_updates;
CREATE TRIGGER project_updates_updated_at
  BEFORE UPDATE ON public.project_updates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 3. project_timeline_events — chronological project history ───────────────

CREATE TABLE IF NOT EXISTS public.project_timeline_events (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  kind          text        NOT NULL DEFAULT 'note',
  -- kind: kickoff | milestone_done | update | file_upload | approval |
  --        change_request | status_change | launch | message | note
  title         text        NOT NULL,
  description   text,
  actor_name    text,
  actor_kind    text        NOT NULL DEFAULT 'system',
  -- actor_kind: admin | staff | client | system
  meta          jsonb       NOT NULL DEFAULT '{}',
  happened_at   timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.project_timeline_events ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON public.project_timeline_events TO authenticated;
GRANT ALL ON public.project_timeline_events TO service_role;

DROP POLICY IF EXISTS pte_admin  ON public.project_timeline_events;
DROP POLICY IF EXISTS pte_client ON public.project_timeline_events;

CREATE POLICY pte_admin ON public.project_timeline_events
  FOR ALL TO authenticated
  USING     (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK(public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY pte_client ON public.project_timeline_events
  FOR SELECT TO authenticated
  USING (public.is_client_of_project(project_id));

CREATE INDEX IF NOT EXISTS pte_project_idx ON public.project_timeline_events(project_id, happened_at DESC);

ALTER TABLE public.project_timeline_events REPLICA IDENTITY FULL;
DO $$ BEGIN
  BEGIN EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.project_timeline_events';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- ─── 4. change_requests — client-submitted change requests ───────────────────

CREATE TABLE IF NOT EXISTS public.change_requests (
  id               uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       uuid           NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id        uuid           NOT NULL REFERENCES public.portal_clients(id) ON DELETE CASCADE,
  title            text           NOT NULL,
  description      text           NOT NULL,
  priority         text           NOT NULL DEFAULT 'medium',
  attachment_url   text,
  status           text           NOT NULL DEFAULT 'pending',
  -- pending | reviewing | approved | rejected | in_progress | done
  admin_notes      text,
  estimated_hours  numeric,
  additional_cost  numeric(12,2),
  currency         text           NOT NULL DEFAULT 'USD',
  resolved_at      timestamptz,
  created_at       timestamptz    NOT NULL DEFAULT now(),
  updated_at       timestamptz    NOT NULL DEFAULT now()
);

ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.change_requests TO authenticated;
GRANT ALL ON public.change_requests TO service_role;

DROP POLICY IF EXISTS cr_admin  ON public.change_requests;
DROP POLICY IF EXISTS cr_client ON public.change_requests;

CREATE POLICY cr_admin ON public.change_requests
  FOR ALL TO authenticated
  USING     (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK(public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY cr_client ON public.change_requests
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.portal_clients c WHERE c.id = client_id AND c.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.portal_clients c WHERE c.id = client_id AND c.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS cr_project_idx ON public.change_requests(project_id);
CREATE INDEX IF NOT EXISTS cr_client_idx  ON public.change_requests(client_id);

ALTER TABLE public.change_requests REPLICA IDENTITY FULL;
DO $$ BEGIN
  BEGIN EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.change_requests';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

DROP TRIGGER IF EXISTS cr_updated_at ON public.change_requests;
CREATE TRIGGER cr_updated_at
  BEFORE UPDATE ON public.change_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 5. client_approvals — admin sends approval requests, client responds ─────

CREATE TABLE IF NOT EXISTS public.client_approvals (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       uuid        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id        uuid        NOT NULL REFERENCES public.portal_clients(id) ON DELETE CASCADE,
  title            text        NOT NULL,
  description      text,
  kind             text        NOT NULL DEFAULT 'milestone',
  -- milestone | design | document | deliverable | final
  preview_url      text,
  file_url         text,
  status           text        NOT NULL DEFAULT 'pending',
  -- pending | approved | rejected | revision_requested
  client_notes     text,
  responded_at     timestamptz,
  expires_at       timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.client_approvals ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.client_approvals TO authenticated;
GRANT ALL ON public.client_approvals TO service_role;

DROP POLICY IF EXISTS ca_admin        ON public.client_approvals;
DROP POLICY IF EXISTS ca_client_read  ON public.client_approvals;
DROP POLICY IF EXISTS ca_client_write ON public.client_approvals;

CREATE POLICY ca_admin ON public.client_approvals
  FOR ALL TO authenticated
  USING     (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK(public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY ca_client_read ON public.client_approvals
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.portal_clients c WHERE c.id = client_id AND c.user_id = auth.uid())
  );

-- Client can update status and client_notes on their own approvals
CREATE POLICY ca_client_write ON public.client_approvals
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.portal_clients c WHERE c.id = client_id AND c.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.portal_clients c WHERE c.id = client_id AND c.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS ca_project_idx ON public.client_approvals(project_id);
CREATE INDEX IF NOT EXISTS ca_client_idx  ON public.client_approvals(client_id);

ALTER TABLE public.client_approvals REPLICA IDENTITY FULL;
DO $$ BEGIN
  BEGIN EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.client_approvals';
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

DROP TRIGGER IF EXISTS ca_updated_at ON public.client_approvals;
CREATE TRIGGER ca_updated_at
  BEFORE UPDATE ON public.client_approvals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 6. project_files: add more metadata columns ─────────────────────────────
-- project_files already exists with: id, project_id, name, url, created_at
-- Add missing columns

ALTER TABLE public.project_files
  ADD COLUMN IF NOT EXISTS file_type       text,
  ADD COLUMN IF NOT EXISTS file_size       bigint,
  ADD COLUMN IF NOT EXISTS category        text NOT NULL DEFAULT 'general',
  -- general | design | document | image | report | deliverable | final
  ADD COLUMN IF NOT EXISTS uploaded_by     text,  -- staff name (display)
  ADD COLUMN IF NOT EXISTS description     text,
  ADD COLUMN IF NOT EXISTS version         text,
  ADD COLUMN IF NOT EXISTS is_final        boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS approval_status text,
  -- null | pending | approved | rejected
  ADD COLUMN IF NOT EXISTS updated_at      timestamptz NOT NULL DEFAULT now();

-- RLS on project_files (already has admin policy, add client read)
DROP POLICY IF EXISTS pf_admin  ON public.project_files;
DROP POLICY IF EXISTS pf_client ON public.project_files;
DROP POLICY IF EXISTS pf_staff  ON public.project_files;

CREATE POLICY pf_admin ON public.project_files
  FOR ALL TO authenticated
  USING     (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK(public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY pf_client ON public.project_files
  FOR SELECT TO authenticated
  USING (public.is_client_of_project(project_id));

CREATE POLICY pf_staff ON public.project_files
  FOR ALL TO authenticated
  USING (public.is_staff_on_project(project_id))
  WITH CHECK (public.is_staff_on_project(project_id));

-- =============================================================================
-- END OF MIGRATION 0009
-- =============================================================================
