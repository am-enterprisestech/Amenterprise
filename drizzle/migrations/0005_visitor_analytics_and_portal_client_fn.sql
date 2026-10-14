CREATE INDEX IF NOT EXISTS analytics_events_created_idx ON public.analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_event_idx ON public.analytics_events (event, created_at DESC);

CREATE OR REPLACE FUNCTION public.get_my_portal_client()
RETURNS SETOF public.portal_clients LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_email text; v_row public.portal_clients%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN RETURN; END IF;
  SELECT * INTO v_row FROM public.portal_clients WHERE user_id = v_uid LIMIT 1;
  IF FOUND THEN RETURN NEXT v_row; RETURN; END IF;
  SELECT email INTO v_email FROM auth.users WHERE id = v_uid;
  IF v_email IS NULL THEN RETURN; END IF;
  SELECT * INTO v_row FROM public.portal_clients WHERE lower(email) = lower(v_email) AND user_id IS NULL LIMIT 1;
  IF FOUND THEN
    UPDATE public.portal_clients SET user_id = v_uid WHERE id = v_row.id;
    v_row.user_id := v_uid;
    RETURN NEXT v_row;
  END IF;
END; $$;
REVOKE ALL ON FUNCTION public.get_my_portal_client() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_portal_client() TO authenticated, service_role;