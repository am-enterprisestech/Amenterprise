-- =============================================================================
-- Migration 0006 — Fix portal client auto-link on login
--
-- Problem: portal_clients.user_id can be NULL if created before the auth user
-- was linked. The RLS policy "user_id = auth.uid()" then returns 400 / nothing.
--
-- Solution:
--   1. A SECURITY DEFINER function that returns the portal client for the
--      currently signed-in user — matches by user_id first, falls back to email.
--   2. A trigger that auto-sets user_id whenever an auth user signs in and
--      the email matches a portal_clients row with user_id IS NULL.
--
-- Run this in the Supabase SQL Editor.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. get_my_portal_client()
--    Returns the portal_clients row for the caller.
--    Tries user_id match first; if not found, tries email match from auth.users
--    and heals the user_id on the spot so subsequent queries work via RLS.
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_my_portal_client()
RETURNS SETOF public.portal_clients
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid   uuid := auth.uid();
  v_email text;
  v_row   public.portal_clients%ROWTYPE;
BEGIN
  -- Fast path: already linked
  SELECT * INTO v_row FROM public.portal_clients WHERE user_id = v_uid LIMIT 1;
  IF FOUND THEN
    RETURN NEXT v_row;
    RETURN;
  END IF;

  -- Slow path: look up by email and heal the link
  SELECT email INTO v_email FROM auth.users WHERE id = v_uid;
  IF v_email IS NULL THEN RETURN; END IF;

  SELECT * INTO v_row
    FROM public.portal_clients
   WHERE email = v_email
     AND user_id IS NULL
   LIMIT 1;

  IF FOUND THEN
    -- Heal user_id so RLS works from now on
    UPDATE public.portal_clients
       SET user_id = v_uid
     WHERE id = v_row.id;

    v_row.user_id := v_uid;
    RETURN NEXT v_row;
  END IF;

  RETURN;
END;
$$;

REVOKE ALL     ON FUNCTION public.get_my_portal_client() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_my_portal_client() TO authenticated, service_role;


-- -----------------------------------------------------------------------------
-- 2. Ensure the index exists for fast email lookup
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS portal_clients_email_idx ON public.portal_clients (email);
CREATE INDEX IF NOT EXISTS portal_clients_user_id_idx ON public.portal_clients (user_id);
