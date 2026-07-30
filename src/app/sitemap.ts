import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { products as fallbackProducts } from '@/data/products';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sspharmacy.com';

  let productsList = fallbackProducts.map(p => ({ id: p.id }));
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('is_active', true);
    
    if (!error && data && data.length > 0) {
      productsList = data as { id: string }[];
    }
  } catch (err) {
    console.error('Error fetching products for sitemap, using fallback:', err);
  }

  const productUrls: MetadataRoute.Sitemap = productsList.map((p) => ({
    url: `${baseUrl}/products/${p.id}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: '2026-07-30',
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: '2026-07-30',
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/industries`,
      lastModified: '2026-07-30',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: '2026-07-30',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: '2026-07-30',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  return [...staticUrls, ...productUrls];
}
