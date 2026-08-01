-- ============================================================================
-- Complete Self-Contained S.S. Pharmacy Auxiliary Tables, RPCs, & RLS Setup
-- ============================================================================

-- 1. Inventory Table
CREATE TABLE IF NOT EXISTS public.inventory (
    product_id TEXT PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
    quantity_on_hand INT NOT NULL DEFAULT 250,
    quantity_reserved INT NOT NULL DEFAULT 5,
    reorder_level INT NOT NULL DEFAULT 50,
    sku TEXT,
    inventory_enabled BOOLEAN DEFAULT true,
    batch_number TEXT DEFAULT 'BATCH-2026-07',
    location TEXT DEFAULT 'Warehouse Kadapa',
    last_adjusted_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Returns & Return Items Tables
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

-- 9. Payment Transactions Table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    razorpay_order_id TEXT UNIQUE,
    razorpay_payment_id TEXT UNIQUE,
    razorpay_signature TEXT,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'CREATED',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- Order RPC Stored Procedures
-- ============================================================================

-- Function: update_order_status
CREATE OR REPLACE FUNCTION public.update_order_status(
  p_order_id TEXT,
  p_new_status TEXT,
  p_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_target_uuid UUID;
BEGIN
  SELECT id INTO v_target_uuid
  FROM public.orders
  WHERE id::text = p_order_id OR order_number = p_order_id
  LIMIT 1;

  IF v_target_uuid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  UPDATE public.orders
  SET 
    order_status = p_new_status,
    updated_at = NOW()
  WHERE id = v_target_uuid;

  INSERT INTO public.order_status_history (order_id, status, notes)
  VALUES (v_target_uuid, p_new_status, p_note)
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object('success', true, 'status', p_new_status);
END;
$$;

-- Function: cancel_order_with_refund_check
CREATE OR REPLACE FUNCTION public.cancel_order_with_refund_check(
  p_order_id TEXT,
  p_reason TEXT DEFAULT 'Cancelled by Administrator'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_target_uuid UUID;
BEGIN
  SELECT id INTO v_target_uuid
  FROM public.orders
  WHERE id::text = p_order_id OR order_number = p_order_id
  LIMIT 1;

  IF v_target_uuid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  UPDATE public.orders
  SET 
    order_status = 'cancelled',
    cancellation_reason = p_reason,
    updated_at = NOW()
  WHERE id = v_target_uuid;

  INSERT INTO public.order_status_history (order_id, status, notes)
  VALUES (v_target_uuid, 'cancelled', p_reason)
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object('success', true, 'status', 'cancelled');
END;
$$;

-- Function: mark_order_shipped
CREATE OR REPLACE FUNCTION public.mark_order_shipped(p_order_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN public.update_order_status(p_order_id, 'shipped', 'Order marked as shipped');
END;
$$;

-- Function: mark_order_out_for_delivery
CREATE OR REPLACE FUNCTION public.mark_order_out_for_delivery(p_order_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN public.update_order_status(p_order_id, 'out_for_delivery', 'Order out for delivery');
END;
$$;

-- Function: mark_order_delivered
CREATE OR REPLACE FUNCTION public.mark_order_delivered(p_order_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_res JSONB;
BEGIN
  UPDATE public.orders
  SET payment_status = 'paid', updated_at = NOW()
  WHERE (id::text = p_order_id OR order_number = p_order_id) AND payment_status != 'paid';

  v_res := public.update_order_status(p_order_id, 'delivered', 'Order delivered & payment confirmed');
  RETURN v_res;
END;
$$;

-- Function: issue_order_invoice
CREATE OR REPLACE FUNCTION public.issue_order_invoice(p_order_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_inv_no TEXT;
  v_total NUMERIC(10,2);
  v_taxable NUMERIC(10,2);
  v_gst NUMERIC(10,2);
  v_inv_id UUID;
BEGIN
  SELECT id, total_amount INTO v_order_id, v_total
  FROM public.orders
  WHERE id::text = p_order_id OR order_number = p_order_id
  LIMIT 1;

  IF v_order_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  v_inv_no := 'SSP-INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(v_order_id::text FROM 1 FOR 4);
  v_taxable := ROUND(v_total / 1.12, 2);
  v_gst := v_total - v_taxable;

  INSERT INTO public.invoices (
    order_id, invoice_number, document_type, taxable_value, cgst_amount, sgst_amount, total_amount, status
  )
  VALUES (
    v_order_id, v_inv_no, 'TAX_INVOICE', v_taxable, ROUND(v_gst/2, 2), ROUND(v_gst/2, 2), v_total, 'ISSUED'
  )
  ON CONFLICT (invoice_number) DO UPDATE SET updated_at = NOW()
  RETURNING id INTO v_inv_id;

  RETURN jsonb_build_object('success', true, 'invoice_id', v_inv_id, 'invoice_number', v_inv_no);
END;
$$;

-- Grant Execution on RPC Functions to anon, authenticated, and service_role
GRANT EXECUTE ON FUNCTION public.update_order_status(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.cancel_order_with_refund_check(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mark_order_shipped(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mark_order_out_for_delivery(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mark_order_delivered(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.issue_order_invoice(TEXT) TO anon, authenticated, service_role;

-- Enable RLS and Configure Read Access Policies
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expirations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_tax_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read for returns" ON public.returns;
CREATE POLICY "Allow public read for returns" ON public.returns FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read for return_items" ON public.return_items;
CREATE POLICY "Allow public read for return_items" ON public.return_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read for invoices" ON public.invoices;
CREATE POLICY "Allow public read for invoices" ON public.invoices FOR SELECT USING (true);

GRANT ALL ON public.inventory TO anon, authenticated, service_role;
GRANT ALL ON public.returns TO anon, authenticated, service_role;
GRANT ALL ON public.return_items TO anon, authenticated, service_role;
GRANT ALL ON public.invoices TO anon, authenticated, service_role;
GRANT ALL ON public.suppliers TO anon, authenticated, service_role;
GRANT ALL ON public.procurement_orders TO anon, authenticated, service_role;
GRANT ALL ON public.recalls TO anon, authenticated, service_role;
GRANT ALL ON public.expirations TO anon, authenticated, service_role;
GRANT ALL ON public.business_tax_settings TO anon, authenticated, service_role;
GRANT ALL ON public.payment_transactions TO anon, authenticated, service_role;

-- ============================================================================
-- RLS Security Hardening for Admin Users, Audit Logs, & Rate Limits
-- ============================================================================
ALTER TABLE IF EXISTS public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow public read on admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow public read for admin_users" ON public.admin_users;

REVOKE ALL ON public.admin_users FROM anon;
GRANT ALL ON public.admin_users TO authenticated, service_role;

DROP POLICY IF EXISTS "Admin users private access" ON public.admin_users;
CREATE POLICY "Admin users private access" ON public.admin_users
    FOR ALL
    USING (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Audit logs private access" ON public.audit_logs;
CREATE POLICY "Audit logs private access" ON public.audit_logs
    FOR ALL
    USING (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Rate limits private access" ON public.rate_limits;
CREATE POLICY "Rate limits private access" ON public.rate_limits
    FOR ALL
    USING (public.is_admin() OR auth.role() = 'service_role');

-- Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
