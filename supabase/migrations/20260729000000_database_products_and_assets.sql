-- ============================================================
-- S.S. Pharmacy Product Catalog Expansion & Banners Migration
-- ============================================================

-- 0. Create base products table if not exists
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    mrp NUMERIC,
    selling_price NUMERIC,
    pack_size TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Public can view products'
    ) THEN
        CREATE POLICY "Public can view products" ON public.products 
            FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Admins have full access to products'
    ) THEN
        CREATE POLICY "Admins have full access to products" ON public.products 
            FOR ALL USING (public.is_admin());
    END IF;
END $$;

-- 1. Extend products table with content and media fields
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS composition TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS benefits TEXT[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS usage TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS shelf_life TEXT NOT NULL DEFAULT '3 Years',
ADD COLUMN IF NOT EXISTS safety_note TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS transparent_image TEXT,
ADD COLUMN IF NOT EXISTS gallery_images TEXT[] NOT NULL DEFAULT '{}';

-- 2. Create page_assets table for home hero carousels and banners
CREATE TABLE IF NOT EXISTS public.page_assets (
    id TEXT PRIMARY KEY,
    section_name TEXT NOT NULL,
    desktop_image_url TEXT NOT NULL,
    mobile_image_url TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    description TEXT,
    link_url TEXT,
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Configure Row Level Security (RLS) on page_assets
ALTER TABLE public.page_assets ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'page_assets' AND policyname = 'Public can view page_assets'
    ) THEN
        CREATE POLICY "Public can view page_assets" ON public.page_assets 
            FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'page_assets' AND policyname = 'Admins have full access to page_assets'
    ) THEN
        CREATE POLICY "Admins have full access to page_assets" ON public.page_assets 
            FOR ALL USING (public.is_admin());
    END IF;
END $$;

-- 4. Seed product catalog data
INSERT INTO public.products (
  id, name, category, composition, benefits, usage, shelf_life, safety_note, mrp, selling_price, pack_size, is_active, image, transparent_image, gallery_images
) VALUES 
-- Dr. Lion Pain Cream
(
  'dr-lion-pain-cream', 
  'Dr. Lion Pain Cream', 
  'Ayurvedic External Pain Relief Cream', 
  'Sarsapa Thila (30 ml), Thymol (10 ml), Menthol (10 ml), Camphor (10 ml), Bees Wax (40 g) per 100 gms as shown on label',
  ARRAY['Supports joint comfort', 'Helps soothe muscle discomfort', 'Cooling herbal formulation', 'Easy external application'],
  'Apply an adequate amount to the affected area and gently massage until absorbed. Use as directed on label or by a qualified healthcare professional.',
  '3 Years',
  'Ayurvedic cream for external use only',
  249, 199, '100g Jar', true,
  '/products/Dr lion pain cream/Pain cream front view.webp',
  '/products/Dr lion pain cream/Pain cream front view.webp',
  ARRAY['/products/Dr lion pain cream/Pain cream front view.webp', '/products/Dr lion pain cream/Pain cream transparent image.webp', '/products/Hero%20section/hero-pain-cream-mobile.webp']
),
-- Dr. Lion Pain Pills
(
  'dr-lion-pain-pills', 
  'Dr. Lion Pain Pills', 
  'Ayurvedic Proprietary Medicine', 
  'Hingula Shuddha/Purified, Triphala Churna, Amalaki, Haritaki, Vibhitaki, Krishna Jeeraka, Kuberakshi, Sonti, Akarakarabha, Jambeera Swarasa (as shown on label)',
  ARRAY['Supports joint comfort', 'Supports musculoskeletal wellness', 'Traditionally used for Vata-related discomfort', 'Supports skeletal muscle wellness'],
  '1–2 pills daily or as directed by a qualified healthcare professional.',
  '2 Years',
  'Use only as directed. Consult a qualified healthcare professional for individual conditions.',
  299, 249, '60 Pills Container', true,
  '/products/Dr lion Pain pills/Pain_pills.webp',
  '/products/Dr lion Pain pills/Pain_pills.webp',
  ARRAY['/products/Dr lion Pain pills/Pain_pills.webp', '/products/Dr lion Pain pills/pain pills transparent.webp', '/products/Hero%20section/hero-pain-pills-mobile.webp']
),
-- Moon Light Cream
(
  'moon-light-cream', 
  'Moon Light Cream', 
  'Ayurvedic Skin Care Cream', 
  'Manjishta Churna (1 gm), Chandana Churna (1 gm), Bahlika Flower / Kumkuma Puvvu (1 gm), Japhal Churna (1 gm), Chandana Oil (2 ml), Bees Wax (4 gms) per 10 gms as shown on label',
  ARRAY['Supports healthy-looking skin', 'Supports even-looking tone', 'May help improve appearance of dark spots with regular skincare use', 'Suitable for daily skincare'],
  'Clean the skin and apply a small amount evenly. Use regularly as directed.',
  '3 Years',
  'Ayurvedic cream for external use only',
  349, 299, '100g Jar', true,
  '/products/Moon-light/Moon cream front view.webp',
  '/products/Moon-light/Moon cream front view.webp',
  ARRAY['/products/Moon-light/Moon cream front view.webp', '/products/Moon-light/Moon cream Hero_section.webp', '/products/Moon-light/Moon cream transparent.webp', '/products/Hero%20section/hero-moon-mobile.webp']
)
ON CONFLICT (id) DO UPDATE SET
  composition = EXCLUDED.composition,
  benefits = EXCLUDED.benefits,
  usage = EXCLUDED.usage,
  shelf_life = EXCLUDED.shelf_life,
  safety_note = EXCLUDED.safety_note,
  image = EXCLUDED.image,
  transparent_image = EXCLUDED.transparent_image,
  gallery_images = EXCLUDED.gallery_images,
  mrp = EXCLUDED.mrp,
  selling_price = EXCLUDED.selling_price,
  pack_size = EXCLUDED.pack_size;

-- 5. Seed Homepage Hero Banners data
INSERT INTO public.page_assets (
  id, section_name, desktop_image_url, mobile_image_url, title, subtitle, description, link_url, display_order, is_active
) VALUES
-- Slide 1: Moon Light Cream
(
  'hero-moon-light',
  'hero_carousel',
  '/products/Hero%20section/hero-moon-desktop.webp',
  '/products/Hero%20section/hero-moon-mobile.webp',
  'Moon Light',
  'Cream',
  'Pure Ayurvedic herbal skincare remedy formulated with Manjishta, Chandana, and Kumkuma for pimples, dark spots, tan removal, and natural glow.',
  '/products/moon-light-cream',
  1, true
),
-- Slide 2: Dr. Lion Pain Cream
(
  'hero-pain-cream',
  'hero_carousel',
  '/products/Hero%20section/hero-pain-cream-desktop.webp',
  '/products/Hero%20section/hero-pain-cream-mobile.webp',
  'Dr. Lion',
  'Pain Cream',
  'An Ayurvedic pain relief cream formulated with powerful natural ingredients that help relieve joint pain, muscle pain, back pain, headache and body discomfort.',
  '/products/dr-lion-pain-cream',
  2, true
),
-- Slide 3: Brand Main Info
(
  'hero-brand-main',
  'hero_carousel',
  '/products/Hero%20section/hero-main-desktop.webp',
  '/products/Hero%20section/hero-main-mobile.webp',
  'Ayurvedic Solutions for',
  'Modern Wellness',
  'S.S. Pharmacy manufactures licensed, quality-focused Ayurvedic medicines and herbal healthcare formulations designed to support musculoskeletal comfort and healthy-looking skin.',
  '/products',
  3, true
),
-- Slide 4: Dr. Lion Pain Pills
(
  'hero-pain-pills',
  'hero_carousel',
  '/products/Hero%20section/hero-pain-pills-desktop.webp',
  '/products/Hero%20section/hero-pain-pills-mobile.webp',
  'Dr. Lion',
  'Pain Pills',
  'Traditional Ayurvedic proprietary medicine formulated with purified herbal extracts for deep joint mobility, muscular comfort, and natural strength.',
  '/products/dr-lion-pain-pills',
  4, true
)
ON CONFLICT (id) DO UPDATE SET
  desktop_image_url = EXCLUDED.desktop_image_url,
  mobile_image_url = EXCLUDED.mobile_image_url,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  link_url = EXCLUDED.link_url,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;
