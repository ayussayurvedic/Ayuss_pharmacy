-- Create Admin Auxiliary Tables for Inventory, Returns, Invoices, Suppliers, Procurement, Recalls, Expirations, and Business Tax Settings

-- 1. Inventory Table
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    stock_quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    reorder_level INT DEFAULT 50,
    batch_number TEXT,
    location TEXT DEFAULT 'Warehouse A',
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Returns & Return Items
CREATE TABLE IF NOT EXISTS public.returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    return_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'REQUESTED', -- REQUESTED, APPROVED, REJECTED, REFUNDED
    reason TEXT,
    refund_amount NUMERIC(10,2) DEFAULT 0.00,
    requested_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.return_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id UUID REFERENCES public.returns(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INT NOT NULL DEFAULT 1,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Commercial Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    document_type TEXT DEFAULT 'TAX_INVOICE',
    gstin TEXT,
    taxable_value NUMERIC(10,2) DEFAULT 0.00,
    cgst_amount NUMERIC(10,2) DEFAULT 0.00,
    sgst_amount NUMERIC(10,2) DEFAULT 0.00,
    igst_amount NUMERIC(10,2) DEFAULT 0.00,
    total_amount NUMERIC(10,2) DEFAULT 0.00,
    status TEXT DEFAULT 'ISSUED',
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- GST R1 Prep Report View
CREATE OR REPLACE VIEW public.vw_gst_r1_prep_report AS
SELECT 
    to_char(created_at, 'YYYY-MM') as report_month,
    COUNT(id) as total_invoices,
    COALESCE(SUM(taxable_value), 0) as total_taxable,
    COALESCE(SUM(cgst_amount + sgst_amount + igst_amount), 0) as total_gst
FROM public.invoices
GROUP BY to_char(created_at, 'YYYY-MM');

-- Fix: Set view to SECURITY INVOKER to enforce querying user's RLS policies
ALTER VIEW public.vw_gst_r1_prep_report SET (security_invoker = on);

-- 4. Suppliers Table
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT DEFAULT 'Botanicals',
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    gstin TEXT,
    license_no TEXT,
    status TEXT DEFAULT 'Active',
    rating NUMERIC(3,1) DEFAULT 4.5,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Procurement Orders Table
CREATE TABLE IF NOT EXISTS public.procurement_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number TEXT UNIQUE NOT NULL,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    supplier_name TEXT,
    total_cost NUMERIC(10,2) DEFAULT 0.00,
    status TEXT DEFAULT 'PENDING',
    expected_delivery DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Recalls Table
CREATE TABLE IF NOT EXISTS public.recalls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recall_number TEXT UNIQUE NOT NULL,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    product_name TEXT,
    batch_number TEXT NOT NULL,
    reason TEXT,
    severity TEXT DEFAULT 'MEDIUM',
    status TEXT DEFAULT 'ACTIVE',
    affected_units INT DEFAULT 0,
    recalled_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Expirations Table
CREATE TABLE IF NOT EXISTS public.expirations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    batch_number TEXT NOT NULL,
    expiry_date DATE NOT NULL,
    quantity INT DEFAULT 0,
    status TEXT DEFAULT 'MONITORING',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Business Tax Settings Table
CREATE TABLE IF NOT EXISTS public.business_tax_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_mode TEXT DEFAULT 'GST_REGISTERED',
    configuration_status TEXT DEFAULT 'VERIFIED',
    legal_business_name TEXT DEFAULT 'S.S. PHARMACY Ayurvedic Pvt Ltd',
    trade_name TEXT DEFAULT 'S.S. PHARMACY',
    gstin TEXT DEFAULT '37AAAAA0000A1Z5',
    registered_address_line1 TEXT DEFAULT 'Main Road, Kadapa',
    registered_address_line2 TEXT DEFAULT 'Near Market Complex',
    city TEXT DEFAULT 'Kadapa',
    state TEXT DEFAULT 'Andhra Pradesh',
    state_code TEXT DEFAULT '37',
    postal_code TEXT DEFAULT '516001',
    country TEXT DEFAULT 'India',
    invoice_prefix TEXT DEFAULT 'SSP',
    credit_note_prefix TEXT DEFAULT 'CN',
    pricing_tax_mode TEXT DEFAULT 'TAX_INCLUSIVE',
    default_hsn_code TEXT DEFAULT '30049011',
    default_gst_rate NUMERIC(5,2) DEFAULT 12.00,
    delivery_gst_rate NUMERIC(5,2) DEFAULT 18.00,
    invoice_terms TEXT DEFAULT 'Goods once sold are subject to S.S. PHARMACY terms.',
    support_email TEXT DEFAULT 'support@sspharmacy.in',
    support_phone TEXT DEFAULT '+91 98480 12345',
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all auxiliary tables
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expirations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_tax_settings ENABLE ROW LEVEL SECURITY;

-- Grant RLS Policies for Admins and Service Role
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'inventory', 'returns', 'return_items', 'invoices', 'suppliers', 
        'procurement_orders', 'recalls', 'expirations', 'business_tax_settings'
    ]) LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Admins full access on %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Admins full access on %I" ON public.%I FOR ALL USING (public.is_admin() OR auth.role() = ''service_role'')', tbl, tbl);
        EXECUTE format('GRANT ALL ON public.%I TO anon, authenticated, service_role', tbl);
    END LOOP;
END $$;

-- Seed default Business Tax Settings row if none exists
INSERT INTO public.business_tax_settings (id, tax_mode, configuration_status, legal_business_name, gstin)
VALUES ('00000000-0000-0000-0000-000000000001', 'GST_REGISTERED', 'VERIFIED', 'S.S. PHARMACY Ayurvedic Pvt Ltd', '37AAAAA0000A1Z5')
ON CONFLICT (id) DO NOTHING;

-- Seed inventory for existing products
INSERT INTO public.inventory (product_id, stock_quantity, reserved_quantity, reorder_level, batch_number, location)
SELECT id, 250, 5, 50, 'BATCH-2026-07', 'Warehouse Kadapa'
FROM public.products
ON CONFLICT DO NOTHING;

-- Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
