-- Create Orders and Order Items Tables for S.S. Pharmacy

-- 1. Create public.orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    shipping_address TEXT NOT NULL,
    city TEXT,
    state TEXT,
    pincode TEXT NOT NULL,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    delivery_charge NUMERIC NOT NULL DEFAULT 0,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL DEFAULT 'cod',
    payment_status TEXT NOT NULL DEFAULT 'pending',
    order_status TEXT NOT NULL DEFAULT 'new',
    checkout_attempt_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create public.order_items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL DEFAULT 0,
    total_price NUMERIC NOT NULL DEFAULT 0,
    mrp_snapshot NUMERIC DEFAULT 0,
    pack_size_snapshot TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast query lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_checkout_attempt ON public.orders(checkout_attempt_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public insert to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public select orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public update orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public insert to order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public select order_items" ON public.order_items;

-- 4. Create RLS Policies for Anon & Authenticated Users
CREATE POLICY "Allow public insert to orders" 
    ON public.orders FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow public select orders" 
    ON public.orders FOR SELECT 
    USING (true);

CREATE POLICY "Allow public update orders" 
    ON public.orders FOR UPDATE 
    USING (true);

CREATE POLICY "Allow public insert to order_items" 
    ON public.order_items FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow public select order_items" 
    ON public.order_items FOR SELECT 
    USING (true);

-- 5. Grant Permissions to anon, authenticated, and service_role
GRANT ALL ON public.orders TO anon, authenticated, service_role;
GRANT ALL ON public.order_items TO anon, authenticated, service_role;

-- 6. Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
