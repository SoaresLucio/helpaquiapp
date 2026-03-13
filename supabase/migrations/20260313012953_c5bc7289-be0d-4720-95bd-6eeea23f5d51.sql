
-- Add helpadmin role for the admin user (luciomrb_pba@hoail.com)
-- We need to find the user by email in auth.users and insert into user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'helpadmin'::user_role
FROM auth.users
WHERE email = 'luciomrb_pba@hoail.com'
ON CONFLICT (user_id, role) DO NOTHING;
