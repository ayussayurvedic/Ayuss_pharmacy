-- Create payment transactions log table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_method TEXT NOT NULL,
    transaction_id TEXT UNIQUE,
    gateway_order_id TEXT,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL,
    raw_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Drop previous policy if any
DROP POLICY IF EXISTS "Admins full access on payment_transactions" ON public.payment_transactions;

-- Create policy for Admin/Service Role only
CREATE POLICY "Admins full access on payment_transactions" 
    ON public.payment_transactions FOR ALL 
    USING (public.is_admin() OR auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON public.payment_transactions TO anon, authenticated, service_role;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
