-- Staff / team member portal accounts
CREATE TABLE public.staff_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  team_member_id uuid REFERENCES public.team_members(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  job_title text,
  role text NOT NULL DEFAULT 'developer',
  department text,
  phone text,
  avatar_url text,
  modules text[] NOT NULL DEFAULT ARRAY['dashboard','tasks','projects','messages','notifications','documents','profile'],
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_members TO authenticated;
GRANT ALL ON public.staff_members TO service_role;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_my_staff(_staff_id uuid)
RETURNS boolean LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.staff_members s WHERE s.id = _staff_id AND s.user_id = auth.uid())
$$;

CREATE POLICY "staff read own" ON public.staff_members FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "staff update own contact" ON public.staff_members FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "admins manage staff" ON public.staff_members FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER staff_members_updated BEFORE UPDATE ON public.staff_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Tasks assigned to a staff member
CREATE TABLE public.staff_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'medium',
  progress integer NOT NULL DEFAULT 0,
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_tasks TO authenticated;
GRANT ALL ON public.staff_tasks TO service_role;
ALTER TABLE public.staff_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read own tasks" ON public.staff_tasks FOR SELECT TO authenticated USING (public.is_my_staff(staff_id));
CREATE POLICY "staff update own tasks" ON public.staff_tasks FOR UPDATE TO authenticated USING (public.is_my_staff(staff_id)) WITH CHECK (public.is_my_staff(staff_id));
CREATE POLICY "admins manage staff tasks" ON public.staff_tasks FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER staff_tasks_updated BEFORE UPDATE ON public.staff_tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Internal messages to a staff member
CREATE TABLE public.staff_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  subject text NOT NULL,
  body text NOT NULL,
  sender text NOT NULL DEFAULT 'admin',
  important boolean NOT NULL DEFAULT false,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_messages TO authenticated;
GRANT ALL ON public.staff_messages TO service_role;
ALTER TABLE public.staff_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read own messages" ON public.staff_messages FOR SELECT TO authenticated USING (public.is_my_staff(staff_id));
CREATE POLICY "staff mark own messages" ON public.staff_messages FOR UPDATE TO authenticated USING (public.is_my_staff(staff_id)) WITH CHECK (public.is_my_staff(staff_id));
CREATE POLICY "staff reply own messages" ON public.staff_messages FOR INSERT TO authenticated WITH CHECK (public.is_my_staff(staff_id) AND sender = 'staff');
CREATE POLICY "admins manage staff messages" ON public.staff_messages FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER staff_messages_updated BEFORE UPDATE ON public.staff_messages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Notifications
CREATE TABLE public.staff_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  kind text NOT NULL DEFAULT 'info',
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_notifications TO authenticated;
GRANT ALL ON public.staff_notifications TO service_role;
ALTER TABLE public.staff_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read own notifications" ON public.staff_notifications FOR SELECT TO authenticated USING (public.is_my_staff(staff_id));
CREATE POLICY "staff mark own notifications" ON public.staff_notifications FOR UPDATE TO authenticated USING (public.is_my_staff(staff_id)) WITH CHECK (public.is_my_staff(staff_id));
CREATE POLICY "admins manage staff notifications" ON public.staff_notifications FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER staff_notifications_updated BEFORE UPDATE ON public.staff_notifications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Shared documents / resources
CREATE TABLE public.staff_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  file_type text,
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_documents TO authenticated;
GRANT ALL ON public.staff_documents TO service_role;
ALTER TABLE public.staff_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read own documents" ON public.staff_documents FOR SELECT TO authenticated USING (public.is_my_staff(staff_id));
CREATE POLICY "admins manage staff documents" ON public.staff_documents FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER staff_documents_updated BEFORE UPDATE ON public.staff_documents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Activity log
CREATE TABLE public.staff_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  action text NOT NULL,
  description text,
  actor text NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.staff_activities TO authenticated;
GRANT ALL ON public.staff_activities TO service_role;
ALTER TABLE public.staff_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read own activity" ON public.staff_activities FOR SELECT TO authenticated USING (public.is_my_staff(staff_id));
CREATE POLICY "admins manage staff activity" ON public.staff_activities FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Staff can see the projects they are assigned tasks on
CREATE POLICY "staff read assigned projects" ON public.projects FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.staff_tasks t
    JOIN public.staff_members s ON s.id = t.staff_id
    WHERE t.project_id = projects.id AND s.user_id = auth.uid()
  )
);

CREATE INDEX staff_tasks_staff_idx ON public.staff_tasks(staff_id);
CREATE INDEX staff_messages_staff_idx ON public.staff_messages(staff_id);
CREATE INDEX staff_notifications_staff_idx ON public.staff_notifications(staff_id);
CREATE INDEX staff_documents_staff_idx ON public.staff_documents(staff_id);
CREATE INDEX staff_members_user_idx ON public.staff_members(user_id);
