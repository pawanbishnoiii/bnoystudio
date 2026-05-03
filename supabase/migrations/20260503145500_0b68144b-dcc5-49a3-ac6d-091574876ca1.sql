
-- Replace hardcoded-email policies with role-based ones for project-assets
DROP POLICY IF EXISTS "Admin upload project assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload source code" ON storage.objects;

CREATE POLICY "Admins upload project assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'project-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update project assets"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'project-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete project assets"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'project-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins upload source code"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'source-code' AND public.has_role(auth.uid(), 'admin'));

-- App-assets: ensure admins can also delete
CREATE POLICY "Admin delete app assets"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'app-assets' AND public.has_role(auth.uid(), 'admin'));
