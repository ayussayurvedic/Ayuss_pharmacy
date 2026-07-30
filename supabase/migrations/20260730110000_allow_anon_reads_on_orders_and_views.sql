-- Migration: Allow SELECT reads on orders, returns, invoices, and views for browser client

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT unnest(ARRAY[
            'orders', 'order_items', 'order_status_history', 
            'returns', 'return_items', 'return_status_history',
            'invoices', 'invoice_items', 'business_tax_settings',
            'suppliers', 'procurement_orders', 'inventory',
            'distributor_applications', 'page_assets'
        ])
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
            EXECUTE format('DROP POLICY IF EXISTS "Allow select for %I" ON public.%I', tbl, tbl);
            EXECUTE format('CREATE POLICY "Allow select for %I" ON public.%I FOR SELECT USING (true)', tbl, tbl);
            EXECUTE format('GRANT ALL ON public.%I TO anon, authenticated, service_role', tbl);
        END IF;
    END LOOP;
END $$;

-- Reload schema
NOTIFY pgrst, 'reload schema';
