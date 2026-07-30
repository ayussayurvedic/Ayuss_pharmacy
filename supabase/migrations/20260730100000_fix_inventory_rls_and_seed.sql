-- Migration: Ensure full access & seed rows for public.inventory

-- 1. Ensure inventory table structure exists with TEXT primary key
CREATE TABLE IF NOT EXISTS public.inventory (
    product_id TEXT PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
    quantity_on_hand INT NOT NULL DEFAULT 250,
    quantity_reserved INT NOT NULL DEFAULT 5,
    reorder_level INT NOT NULL DEFAULT 50,
    sku TEXT,
    inventory_enabled BOOLEAN DEFAULT true,
    location TEXT DEFAULT 'Warehouse Kadapa',
    last_adjusted_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Seed inventory data directly
INSERT INTO public.inventory (product_id, quantity_on_hand, quantity_reserved, reorder_level, sku)
VALUES 
    ('dr-lion-pain-cream', 350, 8, 40, 'SKU-PAIN-CREAM-01'),
    ('dr-lion-pain-pills', 420, 12, 50, 'SKU-PAIN-PILLS-01'),
    ('moon-light-cream', 180, 4, 30, 'SKU-MOON-CREAM-01')
ON CONFLICT (product_id) DO UPDATE SET
    quantity_on_hand = EXCLUDED.quantity_on_hand,
    updated_at = now();

-- 3. Configure RLS Policies
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select for inventory" ON public.inventory;
DROP POLICY IF EXISTS "Allow write for admins on inventory" ON public.inventory;
DROP POLICY IF EXISTS "Full access to inventory" ON public.inventory;

-- Allow SELECT, INSERT, UPDATE for client & admin users
CREATE POLICY "Full access to inventory" ON public.inventory FOR ALL USING (true) WITH CHECK (true);

-- Grant privileges
GRANT ALL ON public.inventory TO anon, authenticated, service_role;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
