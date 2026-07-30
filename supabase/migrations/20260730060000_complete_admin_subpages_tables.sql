-- Create Subpage Detail Tables for Orders, Inventory, Returns, Shipments, Refunds, and GST Reporting

-- 1. Inventory Movements Table
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL DEFAULT 'ADJUSTMENT', -- RECEIPT, DISPATCH, ADJUSTMENT, RETURN
    quantity_changed INT NOT NULL DEFAULT 0,
    previous_quantity INT NOT NULL DEFAULT 0,
    new_quantity INT NOT NULL DEFAULT 0,
    reason TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Inventory Reservations Table
CREATE TABLE IF NOT EXISTS public.inventory_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    reserved_quantity INT NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, FULFILLED, CANCELLED
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Shipments Table
CREATE TABLE IF NOT EXISTS public.shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    tracking_number TEXT UNIQUE,
    courier_partner TEXT DEFAULT 'Delhivery',
    shipping_status TEXT DEFAULT 'MANIFESTED', -- MANIFESTED, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED
    dispatch_date TIMESTAMPTZ DEFAULT now(),
    estimated_delivery DATE,
    shipping_label_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Refunds Table
CREATE TABLE IF NOT EXISTS public.refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    return_id UUID REFERENCES public.returns(id) ON DELETE SET NULL,
    refund_number TEXT UNIQUE NOT NULL,
    amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    payment_method TEXT DEFAULT 'ONLINE',
    status TEXT DEFAULT 'COMPLETED', -- INITIATED, PROCESSING, COMPLETED, FAILED
    transaction_reference TEXT,
    processed_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Customer Notifications Log Table
CREATE TABLE IF NOT EXISTS public.customer_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    channel TEXT DEFAULT 'WHATSAPP', -- WHATSAPP, EMAIL, SMS
    recipient TEXT NOT NULL,
    message_title TEXT,
    message_body TEXT,
    status TEXT DEFAULT 'SENT', -- SENT, DELIVERED, FAILED
    sent_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Return Status History Table
CREATE TABLE IF NOT EXISTS public.return_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id UUID REFERENCES public.returns(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. COD Payouts Table
CREATE TABLE IF NOT EXISTS public.cod_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id UUID REFERENCES public.returns(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    beneficiary_name TEXT,
    account_number TEXT,
    ifsc_code TEXT,
    amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    payout_status TEXT DEFAULT 'INITIATED', -- INITIATED, COMPLETED, FAILED
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all subpage detail tables
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cod_payouts ENABLE ROW LEVEL SECURITY;

-- Grant RLS Policies for Admins and Service Role
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN UNNEST(ARRAY[
        'inventory_movements', 'inventory_reservations', 'shipments', 
        'refunds', 'customer_notifications', 'return_status_history', 'cod_payouts'
    ]) LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Admins full access on %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Admins full access on %I" ON public.%I FOR ALL USING (public.is_admin() OR auth.role() = ''service_role'')', tbl, tbl);
        EXECUTE format('GRANT ALL ON public.%I TO anon, authenticated, service_role', tbl);
    END LOOP;
END $$;

-- Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
