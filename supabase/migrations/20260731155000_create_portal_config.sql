-- Migration: Create portal_config table
CREATE TABLE IF NOT EXISTS public.portal_config (
    config_key TEXT PRIMARY KEY,
    config_value TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portal_config ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow public read for portal_config" ON public.portal_config;
CREATE POLICY "Allow public read for portal_config" ON public.portal_config
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write for admin on portal_config" ON public.portal_config;
CREATE POLICY "Allow write for admin on portal_config" ON public.portal_config
    FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

-- Privileges
GRANT ALL ON public.portal_config TO anon, authenticated, service_role;
