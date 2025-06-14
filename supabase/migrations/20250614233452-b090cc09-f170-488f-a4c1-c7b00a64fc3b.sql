
-- First, let's see what's in the user_roles table and handle the enum update properly
-- We'll add the correct value to the enum first, then update any incorrect values

-- Add 'helpadmin' to the enum if it doesn't exist
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'helpadmin';

-- Now update any records that might have incorrect values (this will only update if they exist)
UPDATE user_roles SET role = 'helpadmin' WHERE role::text = 'helladmin';

-- Update storage policies to use correct role name
DROP POLICY IF EXISTS "Admins can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete files" ON storage.objects;

-- Recreate policies with correct role name
CREATE POLICY "Admins can upload files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'admin-uploads' AND
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'helpadmin'
  )
);

CREATE POLICY "Admins can update files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'admin-uploads' AND
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'helpadmin'
  )
);

CREATE POLICY "Admins can delete files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'admin-uploads' AND
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'helpadmin'
  )
);
