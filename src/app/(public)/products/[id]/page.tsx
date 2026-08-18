import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { products, getDefaultProductImage, getDefaultProductPrice } from '@/data/products';
import { supabaseAdmin } from '@/lib/supabase-admin';
import ProductDetailClient from './ProductDetailClient';
import SchemaMarkup from '@/components/layout/SchemaMarkup';
import { generateBreadcrumbSchema, generateProductSchema } from '@/lib/seo';

async function fetchProduct(id: string) {
  const defaultImg = getDefaultProductImage(id);
  const fallbackPrice = getDefaultProductPrice(id);
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle();

    if (!error && data) {
      const primaryImg = data.image || defaultImg;
      const gallery = (data.gallery_images && data.gallery_images.length > 0)
        ? data.gallery_images
        : [primaryImg];

      const mrp = Number(data.mrp) > 0 ? Number(data.mrp) : fallbackPrice.mrp;
      const sellingPrice = Number(data.selling_price) > 0 ? Number(data.selling_price) : fallbackPrice.sellingPrice;

      return {
        id: data.id,
        name: data.name || '',
        category: data.category || '',
        composition: data.composition || '',
        benefits: data.benefits || [],
        usage: data.usage || '',
        shelfLife: data.shelf_life || '3 Years',
        safetyNote: data.safety_note || 'Ayurvedic formulation',
        packSize: data.pack_size || '',
        mrp,
        sellingPrice,
        image: primaryImg,
        transparentImage: data.transparent_image || primaryImg,
        galleryImages: gallery
      };
    }
  } catch (err) {
    console.error('Error fetching product from DB server-side, loading fallback:', err);
  }
  const fallback = products.find(p => p.id === id);
  if (!fallback) return undefined;
  return {
    ...fallback,
    image: fallback.image || defaultImg,
    transparentImage: fallback.transparentImage || defaultImg,
    galleryImages: (fallback.galleryImages && fallback.galleryImages.length > 0) ? fallback.galleryImages : [defaultImg]
  };
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
      title: 'Formulation Not Found | S.S. Pharmacy',
      description: 'The requested Ayurvedic formulation could not be found.',
    };
  }

  return {
    title: product.name,
    description: `${product.category} - ${product.benefits.join(', ')}. Manufactured under AYUSH License R-1970/Ayur.`,
    alternates: {
      canonical: `/products/${product.id}`,
    },
    keywords: [
      product.name,
      product.category,
      'S.S. Pharmacy',
      'Ayurvedic medicine',
      'R-1970/Ayur'
    ],
    openGraph: {
      title: product.name,
      description: `${product.category} - ${product.benefits.join(', ')}.`,
      url: `https://sspharmacy.com/products/${product.id}`,
      siteName: 'S.S. Pharmacy',
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

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: product.name, path: `/products/${product.id}` },
  ];

  const productSchema = generateProductSchema({
    id: product.id,
    name: product.name,
    category: product.category,
    composition: product.composition,
    image: product.image,
    mrp: product.mrp,
    sellingPrice: product.sellingPrice,
    packSize: product.packSize,
  });

  return (
    <>
      <SchemaMarkup schema={productSchema} />
      <SchemaMarkup schema={generateBreadcrumbSchema(breadcrumbs)} />
      <ProductDetailClient product={product} />
    </>
  );
}
