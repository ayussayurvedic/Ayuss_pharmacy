-- ============================================================================
-- Order RPC Functions, Auxiliary Tables RLS Grants, and GST Views
-- ============================================================================

-- 1. Function: update_order_status
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

-- 2. Function: cancel_order_with_refund_check
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

-- 3. Function: mark_order_shipped
CREATE OR REPLACE FUNCTION public.mark_order_shipped(p_order_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN public.update_order_status(p_order_id, 'shipped', 'Order marked as shipped');
END;
$$;

-- 4. Function: mark_order_out_for_delivery
CREATE OR REPLACE FUNCTION public.mark_order_out_for_delivery(p_order_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN public.update_order_status(p_order_id, 'out_for_delivery', 'Order out for delivery');
END;
$$;

-- 5. Function: mark_order_delivered
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

-- 6. Function: issue_order_invoice
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

-- 7. Grant Execution on RPC Functions to anon, authenticated, and service_role
GRANT EXECUTE ON FUNCTION public.update_order_status(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.cancel_order_with_refund_check(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mark_order_shipped(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mark_order_out_for_delivery(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.mark_order_delivered(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.issue_order_invoice(TEXT) TO anon, authenticated, service_role;

-- 8. Enable Public/Anon/Authenticated READ Access on returns, invoices, and views
ALTER TABLE IF EXISTS public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read for returns" ON public.returns;
CREATE POLICY "Allow public read for returns" ON public.returns FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read for return_items" ON public.return_items;
CREATE POLICY "Allow public read for return_items" ON public.return_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read for invoices" ON public.invoices;
CREATE POLICY "Allow public read for invoices" ON public.invoices FOR SELECT USING (true);

GRANT ALL ON public.returns TO anon, authenticated, service_role;
GRANT ALL ON public.return_items TO anon, authenticated, service_role;
GRANT ALL ON public.invoices TO anon, authenticated, service_role;
