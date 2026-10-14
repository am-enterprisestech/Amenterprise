-- 1. Trigger-only function must not be callable through the API
REVOKE ALL ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;

-- 2. Media storage: no blanket public read; downloads use signed URLs, admins can list
DROP POLICY IF EXISTS "public read media" ON storage.objects;
CREATE POLICY "admins read media" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'media' AND has_role(auth.uid(), 'admin'::app_role));

-- 3. page_sections: only enabled sections are publicly readable
DROP POLICY IF EXISTS "Public reads sections" ON public.page_sections;
CREATE POLICY "Public reads enabled sections" ON public.page_sections
  FOR SELECT TO anon, authenticated
  USING (enabled = true);

-- 4. team_members: hide personal contact columns from anonymous visitors
REVOKE SELECT ON public.team_members FROM anon;
GRANT SELECT (
  id, name, slug, role_title, bio, long_bio, photo_url, location, experience,
  expertise, achievements, linkedin_url, twitter_url, sort_order, published,
  created_at, updated_at
) ON public.team_members TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;