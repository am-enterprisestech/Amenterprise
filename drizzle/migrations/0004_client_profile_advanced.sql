ALTER TABLE public.portal_clients ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.portal_clients ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.portal_clients ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE public.portal_clients ADD COLUMN IF NOT EXISTS admin_notes text;
DROP FUNCTION IF EXISTS public.project_client(uuid);
CREATE FUNCTION public.project_client(_project uuid)
RETURNS TABLE(name text, company text, am_id text, avatar_url text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT c.name, c.company, c.am_id, c.avatar_url FROM public.projects p JOIN public.portal_clients c ON c.id = p.client_id
  WHERE p.id = _project AND (public.is_staff_on_project(_project) OR public.has_role(auth.uid(), 'admin'));
$$;
DROP FUNCTION IF EXISTS public.project_team(uuid);
CREATE FUNCTION public.project_team(_project uuid)
RETURNS TABLE(name text, am_id text, department text, role_on_project text, job_title text, avatar_url text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.name, s.am_id, coalesce(pa.department_slug, s.department_slug, s.department), pa.role_on_project, s.job_title, s.avatar_url
  FROM public.project_assignments pa JOIN public.staff_members s ON s.id = pa.staff_id
  WHERE pa.project_id = _project AND s.active
    AND (public.is_client_of_project(_project) OR public.is_staff_on_project(_project) OR public.has_role(auth.uid(), 'admin'));
$$;
REVOKE EXECUTE ON FUNCTION public.project_team(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.project_client(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.project_team(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.project_client(uuid) TO authenticated;