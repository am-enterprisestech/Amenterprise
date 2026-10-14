-- =========================================================
-- AM ENTERPRISE: departments, AM IDs, assignments, chat
-- =========================================================

-- ---------- AM IDs ----------
CREATE SEQUENCE IF NOT EXISTS public.am_staff_seq START 1001;
CREATE SEQUENCE IF NOT EXISTS public.am_client_seq START 1001;

ALTER TABLE public.staff_members  ADD COLUMN IF NOT EXISTS am_id text;
ALTER TABLE public.staff_members  ADD COLUMN IF NOT EXISTS department_slug text;
ALTER TABLE public.portal_clients ADD COLUMN IF NOT EXISTS am_id text;

CREATE OR REPLACE FUNCTION public.set_staff_am_id()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.am_id IS NULL OR NEW.am_id = '' THEN
    NEW.am_id := 'AM-STF-' || lpad(nextval('public.am_staff_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.set_client_am_id()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.am_id IS NULL OR NEW.am_id = '' THEN
    NEW.am_id := 'AM-CLT-' || lpad(nextval('public.am_client_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_staff_am_id ON public.staff_members;
CREATE TRIGGER trg_staff_am_id BEFORE INSERT ON public.staff_members
  FOR EACH ROW EXECUTE FUNCTION public.set_staff_am_id();

DROP TRIGGER IF EXISTS trg_client_am_id ON public.portal_clients;
CREATE TRIGGER trg_client_am_id BEFORE INSERT ON public.portal_clients
  FOR EACH ROW EXECUTE FUNCTION public.set_client_am_id();

UPDATE public.staff_members
   SET am_id = 'AM-STF-' || lpad(nextval('public.am_staff_seq')::text, 5, '0')
 WHERE am_id IS NULL;

UPDATE public.portal_clients
   SET am_id = 'AM-CLT-' || lpad(nextval('public.am_client_seq')::text, 5, '0')
 WHERE am_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS staff_members_am_id_key  ON public.staff_members(am_id);
CREATE UNIQUE INDEX IF NOT EXISTS portal_clients_am_id_key ON public.portal_clients(am_id);

-- ---------- Project extras ----------
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS repo_url text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS staging_url text;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS live_url text;

-- ---------- helpers ----------
CREATE OR REPLACE FUNCTION public.my_staff_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.staff_members WHERE user_id = auth.uid() AND active LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.my_staff_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_staff_id() TO authenticated, service_role;

-- ---------- project assignments ----------
CREATE TABLE IF NOT EXISTS public.project_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  department_slug text,
  role_on_project text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, staff_id)
);
CREATE INDEX IF NOT EXISTS project_assignments_project_idx ON public.project_assignments(project_id);
CREATE INDEX IF NOT EXISTS project_assignments_staff_idx   ON public.project_assignments(staff_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_assignments TO authenticated;
GRANT ALL ON public.project_assignments TO service_role;
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pa_admin ON public.project_assignments;
CREATE POLICY pa_admin ON public.project_assignments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS pa_read ON public.project_assignments;
CREATE POLICY pa_read ON public.project_assignments FOR SELECT TO authenticated
  USING (
    public.my_staff_id() IS NOT NULL
    OR EXISTS (SELECT 1 FROM public.projects p
               JOIN public.portal_clients c ON c.id = p.client_id
               WHERE p.id = project_id AND c.user_id = auth.uid())
  );

CREATE OR REPLACE FUNCTION public.is_staff_on_project(_project uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_assignments pa
    JOIN public.staff_members s ON s.id = pa.staff_id
    WHERE pa.project_id = _project AND s.user_id = auth.uid() AND s.active
  );
$$;
REVOKE ALL ON FUNCTION public.is_staff_on_project(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_staff_on_project(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_client_of_project(_project uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.portal_clients c ON c.id = p.client_id
    WHERE p.id = _project AND c.user_id = auth.uid()
  );
$$;
REVOKE ALL ON FUNCTION public.is_client_of_project(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_client_of_project(uuid) TO authenticated, service_role;

-- ---------- department work tables ----------
CREATE TABLE IF NOT EXISTS public.dev_bugs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  staff_id uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.seo_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  staff_id uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  keyword text NOT NULL,
  target_url text,
  current_rank integer,
  previous_rank integer,
  search_volume integer,
  difficulty integer,
  status text NOT NULL DEFAULT 'tracking',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.design_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  staff_id uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  title text NOT NULL,
  brief text,
  kind text NOT NULL DEFAULT 'graphic',
  status text NOT NULL DEFAULT 'requested',
  figma_url text,
  preview_url text,
  file_url text,
  revision_notes text,
  client_approved boolean NOT NULL DEFAULT false,
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.smm_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  staff_id uuid REFERENCES public.staff_members(id) ON DELETE SET NULL,
  name text NOT NULL,
  platform text NOT NULL DEFAULT 'instagram',
  status text NOT NULL DEFAULT 'planning',
  start_date date,
  end_date date,
  budget_usd numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.smm_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.smm_campaigns(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  caption text,
  platform text NOT NULL DEFAULT 'instagram',
  media_url text,
  scheduled_at timestamptz,
  status text NOT NULL DEFAULT 'draft',
  approval_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dev_bugs_project_idx       ON public.dev_bugs(project_id);
CREATE INDEX IF NOT EXISTS seo_keywords_project_idx   ON public.seo_keywords(project_id);
CREATE INDEX IF NOT EXISTS design_requests_project_idx ON public.design_requests(project_id);
CREATE INDEX IF NOT EXISTS smm_campaigns_project_idx  ON public.smm_campaigns(project_id);
CREATE INDEX IF NOT EXISTS smm_posts_campaign_idx     ON public.smm_posts(campaign_id);

DROP TRIGGER IF EXISTS trg_dev_bugs_updated ON public.dev_bugs;
CREATE TRIGGER trg_dev_bugs_updated BEFORE UPDATE ON public.dev_bugs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_seo_keywords_updated ON public.seo_keywords;
CREATE TRIGGER trg_seo_keywords_updated BEFORE UPDATE ON public.seo_keywords FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_design_requests_updated ON public.design_requests;
CREATE TRIGGER trg_design_requests_updated BEFORE UPDATE ON public.design_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_smm_campaigns_updated ON public.smm_campaigns;
CREATE TRIGGER trg_smm_campaigns_updated BEFORE UPDATE ON public.smm_campaigns FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_smm_posts_updated ON public.smm_posts;
CREATE TRIGGER trg_smm_posts_updated BEFORE UPDATE ON public.smm_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['dev_bugs','seo_keywords','design_requests','smm_campaigns','smm_posts'] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_admin', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''))', t || '_admin', t);
  END LOOP;
END $$;

-- staff on project may manage their department rows; clients may read theirs
DROP POLICY IF EXISTS dev_bugs_staff ON public.dev_bugs;
CREATE POLICY dev_bugs_staff ON public.dev_bugs FOR ALL TO authenticated
  USING (public.is_staff_on_project(project_id)) WITH CHECK (public.is_staff_on_project(project_id));
DROP POLICY IF EXISTS dev_bugs_client ON public.dev_bugs;
CREATE POLICY dev_bugs_client ON public.dev_bugs FOR SELECT TO authenticated
  USING (public.is_client_of_project(project_id));

DROP POLICY IF EXISTS seo_keywords_staff ON public.seo_keywords;
CREATE POLICY seo_keywords_staff ON public.seo_keywords FOR ALL TO authenticated
  USING (public.is_staff_on_project(project_id)) WITH CHECK (public.is_staff_on_project(project_id));
DROP POLICY IF EXISTS seo_keywords_client ON public.seo_keywords;
CREATE POLICY seo_keywords_client ON public.seo_keywords FOR SELECT TO authenticated
  USING (public.is_client_of_project(project_id));

DROP POLICY IF EXISTS design_requests_staff ON public.design_requests;
CREATE POLICY design_requests_staff ON public.design_requests FOR ALL TO authenticated
  USING (public.is_staff_on_project(project_id)) WITH CHECK (public.is_staff_on_project(project_id));
DROP POLICY IF EXISTS design_requests_client ON public.design_requests;
CREATE POLICY design_requests_client ON public.design_requests FOR SELECT TO authenticated
  USING (public.is_client_of_project(project_id));
DROP POLICY IF EXISTS design_requests_client_approve ON public.design_requests;
CREATE POLICY design_requests_client_approve ON public.design_requests FOR UPDATE TO authenticated
  USING (public.is_client_of_project(project_id)) WITH CHECK (public.is_client_of_project(project_id));

DROP POLICY IF EXISTS smm_campaigns_staff ON public.smm_campaigns;
CREATE POLICY smm_campaigns_staff ON public.smm_campaigns FOR ALL TO authenticated
  USING (public.is_staff_on_project(project_id)) WITH CHECK (public.is_staff_on_project(project_id));
DROP POLICY IF EXISTS smm_campaigns_client ON public.smm_campaigns;
CREATE POLICY smm_campaigns_client ON public.smm_campaigns FOR SELECT TO authenticated
  USING (public.is_client_of_project(project_id));

DROP POLICY IF EXISTS smm_posts_staff ON public.smm_posts;
CREATE POLICY smm_posts_staff ON public.smm_posts FOR ALL TO authenticated
  USING (public.is_staff_on_project(project_id)) WITH CHECK (public.is_staff_on_project(project_id));
DROP POLICY IF EXISTS smm_posts_client ON public.smm_posts;
CREATE POLICY smm_posts_client ON public.smm_posts FOR SELECT TO authenticated
  USING (public.is_client_of_project(project_id));

-- ---------- chat ----------
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'direct',
  title text,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  created_by uuid,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  display_name text,
  kind text NOT NULL DEFAULT 'staff',
  last_read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_name text,
  body text NOT NULL,
  attachment_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS conv_participants_user_idx ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS chat_messages_conv_idx ON public.chat_messages(conversation_id, created_at);

CREATE OR REPLACE FUNCTION public.is_conversation_member(_conv uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = _conv AND user_id = auth.uid()
  );
$$;
REVOKE ALL ON FUNCTION public.is_conversation_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_conversation_member(uuid) TO authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_participants TO authenticated;
GRANT SELECT, INSERT ON public.chat_messages TO authenticated;
GRANT ALL ON public.conversations, public.conversation_participants, public.chat_messages TO service_role;

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conv_admin ON public.conversations;
CREATE POLICY conv_admin ON public.conversations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS conv_member_read ON public.conversations;
CREATE POLICY conv_member_read ON public.conversations FOR SELECT TO authenticated
  USING (public.is_conversation_member(id));
DROP POLICY IF EXISTS conv_create ON public.conversations;
CREATE POLICY conv_create ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
DROP POLICY IF EXISTS conv_member_update ON public.conversations;
CREATE POLICY conv_member_update ON public.conversations FOR UPDATE TO authenticated
  USING (public.is_conversation_member(id)) WITH CHECK (public.is_conversation_member(id));

DROP POLICY IF EXISTS cp_admin ON public.conversation_participants;
CREATE POLICY cp_admin ON public.conversation_participants FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS cp_read ON public.conversation_participants;
CREATE POLICY cp_read ON public.conversation_participants FOR SELECT TO authenticated
  USING (public.is_conversation_member(conversation_id) OR user_id = auth.uid());
DROP POLICY IF EXISTS cp_self_update ON public.conversation_participants;
CREATE POLICY cp_self_update ON public.conversation_participants FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS cp_add ON public.conversation_participants;
CREATE POLICY cp_add ON public.conversation_participants FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.created_by = auth.uid())
  );

DROP POLICY IF EXISTS msg_read ON public.chat_messages;
CREATE POLICY msg_read ON public.chat_messages FOR SELECT TO authenticated
  USING (public.is_conversation_member(conversation_id) OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS msg_send ON public.chat_messages;
CREATE POLICY msg_send ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND public.is_conversation_member(conversation_id) AND length(body) BETWEEN 1 AND 8000);

CREATE OR REPLACE FUNCTION public.bump_conversation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.conversations SET last_message_at = NEW.created_at, updated_at = now() WHERE id = NEW.conversation_id;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_bump_conversation ON public.chat_messages;
CREATE TRIGGER trg_bump_conversation AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.bump_conversation();

-- ---------- directory (search real users) ----------
CREATE OR REPLACE FUNCTION public.search_directory(_q text)
RETURNS TABLE (user_id uuid, name text, email text, am_id text, kind text, department text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.user_id, s.name, s.email, s.am_id, 'staff'::text, coalesce(s.department_slug, s.department)
    FROM public.staff_members s
   WHERE s.user_id IS NOT NULL AND s.active
     AND (_q = '' OR s.name ILIKE '%'||_q||'%' OR s.email ILIKE '%'||_q||'%' OR coalesce(s.am_id,'') ILIKE '%'||_q||'%')
  UNION ALL
  SELECT c.user_id, c.name, c.email, c.am_id, 'client'::text, NULL
    FROM public.portal_clients c
   WHERE c.user_id IS NOT NULL AND c.active
     AND (_q = '' OR c.name ILIKE '%'||_q||'%' OR c.email ILIKE '%'||_q||'%' OR coalesce(c.am_id,'') ILIKE '%'||_q||'%')
   LIMIT 40;
$$;
REVOKE ALL ON FUNCTION public.search_directory(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.search_directory(text) TO authenticated, service_role;

-- ---------- realtime ----------
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
DO $$
BEGIN
  BEGIN EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages'; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations'; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
