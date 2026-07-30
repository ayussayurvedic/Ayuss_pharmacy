-- Migration: Recreate public.inventory table with TEXT product_id matching public.products(id) schema

DROP TABLE IF EXISTS public.inventory CASCADE;

CREATE TABLE public.inventory (
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

-- Seed Inventory for existing products
INSERT INTO public.inventory (product_id, quantity_on_hand, quantity_reserved, reorder_level, sku, batch_number)
VALUES 
    ('dr-lion-pain-cream', 350, 8, 40, 'SKU-PAIN-CREAM-01', 'BATCH-2026-07-PC'),
    ('dr-lion-pain-pills', 420, 12, 50, 'SKU-PAIN-PILLS-01', 'BATCH-2026-07-PP'),
    ('moon-light-cream', 180, 4, 30, 'SKU-MOON-CREAM-01', 'BATCH-2026-07-MC')
ON CONFLICT (product_id) DO UPDATE SET
    quantity_on_hand = EXCLUDED.quantity_on_hand,
    updated_at = now();

-- Enable RLS
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- Drop previous policies if any
DROP POLICY IF EXISTS "Allow select for inventory" ON public.inventory;
DROP POLICY IF EXISTS "Allow write for admins on inventory" ON public.inventory;

-- Create permissive SELECT policy for browser reads
CREATE POLICY "Allow select for inventory" ON public.inventory FOR SELECT USING (true);

-- Create WRITE policy for Admins & Service Role
CREATE POLICY "Allow write for admins on inventory" ON public.inventory FOR ALL USING (public.is_admin() OR auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON public.inventory TO anon, authenticated, service_role;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
