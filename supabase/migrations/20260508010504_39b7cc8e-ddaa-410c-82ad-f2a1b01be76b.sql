
-- Remove broad SELECT policies that allow listing files in public buckets.
-- Files remain accessible via their public URLs (public buckets bypass RLS for object reads via the CDN).
DROP POLICY IF EXISTS "Allow public access to banner images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read banner images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view banner images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view banner images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for banner images" ON storage.objects;

DROP POLICY IF EXISTS "Anyone can view files in admin-uploads 1qzl8no_0" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read admin uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public can view admin uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for admin uploads" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can read avatar files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view avatars" ON storage.objects;
