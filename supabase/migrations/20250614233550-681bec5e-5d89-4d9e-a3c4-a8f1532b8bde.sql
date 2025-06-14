
-- Create policies for public access to view uploaded files (bucket already exists)
CREATE POLICY "Public can view admin uploads" ON storage.objects
FOR SELECT USING (bucket_id = 'admin-uploads');
