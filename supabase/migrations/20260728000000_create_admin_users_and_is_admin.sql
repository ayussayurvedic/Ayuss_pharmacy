-- Migration: Create admin_users table and public.is_admin() helper function
-- This migration runs first to satisfy dependency requirements in subsequent migrations.

-- 1. Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    mfa_enabled BOOLEAN DEFAULT false,
    role TEXT DEFAULT 'SUPER_ADMIN',
    notification_preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create is_admin() function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql;

-- 3. Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for admin_users
DROP POLICY IF EXISTS "Admin users private access" ON public.admin_users;
CREATE POLICY "Admin users private access" ON public.admin_users
    FOR ALL
    USING (public.is_admin() OR auth.role() = 'service_role');
