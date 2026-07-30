-- Migration: Grant SELECT access on Admin Management Tables to allow browser client data fetching

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT unnest(ARRAY[
            'inventory', 'returns', 'return_items', 'invoices', 'suppliers', 
            'procurement_orders', 'recalls', 'expirations', 'business_tax_settings',
            'shipments', 'refunds', 'customer_notifications', 'return_status_history',
            'cod_payouts', 'inventory_movements', 'inventory_reservations'
        ])
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            -- Drop existing blanket policies if any
            EXECUTE format('DROP POLICY IF EXISTS "Admins full access on %I" ON public.%I', tbl, tbl);
            EXECUTE format('DROP POLICY IF EXISTS "Allow select for %I" ON public.%I', tbl, tbl);
            EXECUTE format('DROP POLICY IF EXISTS "Allow write for admins on %I" ON public.%I', tbl, tbl);

            -- Create PERMISSIVE SELECT policy for browser client reads
            EXECUTE format('CREATE POLICY "Allow select for %I" ON public.%I FOR SELECT USING (true)', tbl, tbl);
            
            -- Create WRITE policy (INSERT, UPDATE, DELETE) for Admins & Service Role
            EXECUTE format('CREATE POLICY "Allow write for admins on %I" ON public.%I FOR ALL USING (public.is_admin() OR auth.role() = ''service_role'')', tbl, tbl);

            -- Grant table access
            EXECUTE format('GRANT ALL ON public.%I TO anon, authenticated, service_role', tbl);
        END IF;
    END LOOP;
END $$;

-- Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
