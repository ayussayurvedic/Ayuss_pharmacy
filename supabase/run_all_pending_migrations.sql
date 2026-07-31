-- ====================================================================
-- S.S. Pharmacy Portal — Custom DB Setup & Assets Initialization
-- ====================================================================
-- This file contains setup scripts for custom storage buckets and assets.
-- The legacy PrimeTek HR/Attendance migrations have been fully deprecated and removed.
-- Safe to run this block in the Supabase SQL Editor.
-- ====================================================================

-- 1. Create Products Storage Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Ensure RLS is active on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

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

SELECT 'S.S. Pharmacy storage buckets initialized successfully!' AS result;
