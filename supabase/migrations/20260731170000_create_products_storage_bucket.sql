-- Migration: Create products storage bucket and configure security policies for admins

-- 1. Insert the products bucket into storage.buckets table
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Configure SELECT policy to allow anyone to read images from the public bucket
CREATE POLICY "Public read products bucket" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'products');

-- 4. Configure ALL access policy (Insert/Update/Delete) for authenticated admin users
CREATE POLICY "Admin write products bucket" ON storage.objects
    FOR ALL
    TO authenticated
    USING (bucket_id = 'products' AND (public.is_admin() OR auth.role() = 'service_role'))
    WITH CHECK (bucket_id = 'products' AND (public.is_admin() OR auth.role() = 'service_role'));
