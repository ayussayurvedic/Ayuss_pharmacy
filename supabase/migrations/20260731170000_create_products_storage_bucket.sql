-- Migration: Create products storage bucket and configure security policies for admins

-- 1. Insert the products bucket into storage.buckets table
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Configure SELECT policy to allow anyone to read images from the public bucket
DROP POLICY IF EXISTS "Public read products bucket" ON storage.objects;
CREATE POLICY "Public read products bucket" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'products');

-- 3. Configure ALL access policy (Insert/Update/Delete) for authenticated admin users
DROP POLICY IF EXISTS "Admin write products bucket" ON storage.objects;
CREATE POLICY "Admin write products bucket" ON storage.objects
    FOR ALL
    TO authenticated
    USING (bucket_id = 'products' AND (public.is_admin() OR auth.role() = 'service_role'))
    WITH CHECK (bucket_id = 'products' AND (public.is_admin() OR auth.role() = 'service_role'));
