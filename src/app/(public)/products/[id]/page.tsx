import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { products } from '@/data/products';
import { supabaseAdmin } from '@/lib/supabase-admin';
import ProductDetailClient from './ProductDetailClient';

async function fetchProduct(id: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle();

    if (!error && data) {
      const staticP = products.find(p => p.id === id);
      return {
        id: data.id,
        name: data.name || '',
        category: data.category || '',
        composition: data.composition || staticP?.composition || '',
        benefits: data.benefits || staticP?.benefits || [],
        usage: data.usage || staticP?.usage || '',
        shelfLife: data.shelf_life || staticP?.shelfLife || '3 Years',
        safetyNote: data.safety_note || staticP?.safetyNote || 'Ayurvedic formulation',
        packSize: data.pack_size || staticP?.packSize || '',
        mrp: Number(data.mrp || staticP?.mrp || 0),
        sellingPrice: Number(data.selling_price || staticP?.sellingPrice || 0),
        image: data.image || staticP?.image || '',
        transparentImage: data.transparent_image || staticP?.transparentImage || '',
        galleryImages: data.gallery_images || staticP?.galleryImages || []
      };
    }
  } catch (err) {
    console.error('Error fetching product from DB server-side, loading fallback:', err);
  }
  return products.find(p => p.id === id);
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) {
    return {
      title: 'Formulation Not Found | S.S. PHARMACY',
      description: 'The requested Ayurvedic formulation could not be found.',
    };
  }

  return {
    title: `${product.name} | S.S. PHARMACY`,
    description: `${product.category} - ${product.benefits.join(', ')}. Manufactured under AYUSH License R-1970/Ayur.`,
    keywords: [
      product.name,
      product.category,
      'S.S. PHARMACY',
      'Ayurvedic medicine',
      'R-1970/Ayur'
    ],
    openGraph: {
      title: `${product.name} | S.S. PHARMACY`,
      description: `${product.category} - ${product.benefits.join(', ')}.`,
      url: `https://sspharmacy.com/products/${product.id}`,
      siteName: 'S.S. PHARMACY',
      images: product.image ? [{ url: product.image, alt: product.name }] : [],
    },
  };
}

export default async function ProductDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) {
    return (
      <div className="pt-28 text-center min-h-screen text-slate-600 text-xs bg-[#FDF8F0]">
        <p>Formulation not found.</p>
      </div>
    );
  }

  return <ProductDetailClient product={product} />;
}
