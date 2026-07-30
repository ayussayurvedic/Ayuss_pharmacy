-- Create order_status_history table and policies

CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by order_id
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);

-- Enable RLS
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins have full access to order_status_history" ON public.order_status_history;
DROP POLICY IF EXISTS "Public can view order_status_history" ON public.order_status_history;

-- Create Policies
CREATE POLICY "Admins have full access to order_status_history" 
    ON public.order_status_history FOR ALL 
    USING (public.is_admin() OR auth.role() = 'service_role');

CREATE POLICY "Public can view order_status_history" 
    ON public.order_status_history FOR SELECT 
    USING (true);

-- Grant Permissions
GRANT ALL ON public.order_status_history TO anon, authenticated, service_role;

-- Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
