-- Migration: Update page_assets table to ensure explicit mobile WebP image URLs for homepage carousel

UPDATE public.page_assets
SET mobile_image_url = '/products/hero-section/hero-moon-mobile.webp'
WHERE id = 'hero-moon-light' OR desktop_image_url LIKE '%moon%';

UPDATE public.page_assets
SET mobile_image_url = '/products/hero-section/hero-pain-cream-mobile.webp'
WHERE id = 'hero-pain-cream' OR desktop_image_url LIKE '%pain-cream%';

UPDATE public.page_assets
SET mobile_image_url = '/products/hero-section/hero-main-mobile.webp'
WHERE id = 'hero-brand-main' OR desktop_image_url LIKE '%main%';

UPDATE public.page_assets
SET mobile_image_url = '/products/hero-section/hero-pain-pills-mobile.webp'
WHERE id = 'hero-pain-pills' OR desktop_image_url LIKE '%pain-pills%';

NOTIFY pgrst, 'reload schema';
