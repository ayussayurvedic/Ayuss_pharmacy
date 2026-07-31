-- ============================================================================
-- S.S. PHARMACY ADMIN PORTAL & MEDIA STORAGE CONSOLIDATED MIGRATION
-- Generated for Supabase SQL Editor execution
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. HERO CAROUSEL BANNERS TABLE (page_assets)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS page_assets (
  id TEXT PRIMARY KEY,
  section_name TEXT NOT NULL DEFAULT 'hero_carousel',
  desktop_image_url TEXT,
  mobile_image_url TEXT,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  link_url TEXT,
  display_order INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & Configure Policies for page_assets
ALTER TABLE page_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access for page_assets" ON page_assets;
CREATE POLICY "Allow public read access for page_assets" 
  ON page_assets FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Allow full write access for page_assets" ON page_assets;
CREATE POLICY "Allow full write access for page_assets" 
  ON page_assets FOR ALL 
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role' OR true);

-- ----------------------------------------------------------------------------
-- 2. PRODUCTS & FORMULATIONS CATALOG TABLE (products)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  mrp NUMERIC(10, 2),
  selling_price NUMERIC(10, 2),
  pack_size TEXT,
  is_active BOOLEAN DEFAULT true,
  composition TEXT,
  benefits TEXT[],
  usage TEXT,
  shelf_life TEXT,
  safety_note TEXT,
  image TEXT,                  -- Main / Hero Product Image URL
  transparent_image TEXT,      -- Transparent BG Zoom Image URL
  gallery_images TEXT[],       -- Array of Gallery Image URLs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & Configure Policies for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access for products" ON products;
CREATE POLICY "Allow public read access for products" 
  ON products FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Allow full write access for products" ON products;
CREATE POLICY "Allow full write access for products" 
  ON products FOR ALL 
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role' OR true);

-- ----------------------------------------------------------------------------
-- 3. BUSINESS TAX & SYSTEM CONFIGURATION TABLE (business_tax_settings)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS business_tax_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  tax_mode TEXT DEFAULT 'UNCONFIGURED',
  configuration_status TEXT DEFAULT 'UNCONFIGURED',
  legal_business_name TEXT,
  trade_name TEXT DEFAULT 'S.S. PHARMACY',
  gstin TEXT,
  registered_address_line1 TEXT,
  registered_address_line2 TEXT,
  city TEXT,
  state TEXT,
  state_code TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'India',
  invoice_prefix TEXT DEFAULT 'SSP',
  credit_note_prefix TEXT DEFAULT 'CN',
  pricing_tax_mode TEXT DEFAULT 'TAX_INCLUSIVE',
  default_hsn_code TEXT,
  default_gst_rate NUMERIC(5, 2) DEFAULT 12.00,
  delivery_gst_rate NUMERIC(5, 2) DEFAULT 18.00,
  invoice_terms TEXT,
  support_email TEXT DEFAULT 'support@sspharmacy.in',
  support_phone TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & Configure Policies for business_tax_settings
ALTER TABLE business_tax_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access for business_tax_settings" ON business_tax_settings;
CREATE POLICY "Allow public read access for business_tax_settings" 
  ON business_tax_settings FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Allow full write access for business_tax_settings" ON business_tax_settings;
CREATE POLICY "Allow full write access for business_tax_settings" 
  ON business_tax_settings FOR ALL 
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role' OR true);

-- ----------------------------------------------------------------------------
-- 4. SUPABASE STORAGE BUCKET CONFIGURATION ('products' bucket)
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Public Read Access for Products Bucket" ON storage.objects;
CREATE POLICY "Public Read Access for Products Bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Upload Access for Products Bucket" ON storage.objects;
CREATE POLICY "Upload Access for Products Bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Modify Access for Products Bucket" ON storage.objects;
CREATE POLICY "Modify Access for Products Bucket"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Delete Access for Products Bucket" ON storage.objects;
CREATE POLICY "Delete Access for Products Bucket"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'products');
