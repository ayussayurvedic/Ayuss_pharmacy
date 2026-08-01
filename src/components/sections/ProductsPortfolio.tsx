'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Leaf, ShieldCheck, Star, ShoppingBag, CheckCircle2, ArrowRight } from 'lucide-react';
import { products, type Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase/client';

// Clean helper to extract herbal names with guaranteed spacing
function getCleanIngredients(composition: string): string[] {
  if (!composition) return [];
  const rawParts = composition
    .split(/[,/]/)
    .map((item) =>
      item
        .replace(/\(.*\)/g, '')
        .replace(/per \d+.*/gi, '')
        .replace(/as shown on label.*/gi, '')
        .replace(/Shuddha/gi, '')
        .replace(/Purified/gi, '')
        .replace(/Swarasa/gi, '')
        .replace(/Churna/gi, '')
        .replace(/Puvvu/gi, '')
        .trim()
    )
    .filter((item) => item.length > 1 && item.length < 24);

  return Array.from(new Set(rawParts)).slice(0, 3);
}

export default function ProductsPortfolio() {
  const router = useRouter();
  const { handleAddToCart } = useCart();
  const [productList, setProductList] = useState<Product[]>(products);

  useEffect(() => {
    async function loadProducts() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped: Product[] = data.map((dbP: any) => ({
            id: dbP.id,
            name: dbP.name || '',
            category: dbP.category || '',
            composition: dbP.composition || '',
            benefits: dbP.benefits || [],
            usage: dbP.usage || '',
            shelfLife: dbP.shelf_life || '3 Years',
            safetyNote: dbP.safety_note || 'Ayurvedic formulation',
            packSize: dbP.pack_size || '',
            mrp: Number(dbP.mrp || 0),
            sellingPrice: Number(dbP.selling_price || 0),
            image: dbP.image || '',
            transparentImage: dbP.transparent_image || '',
            galleryImages: dbP.gallery_images || []
          }));
          setProductList(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch homepage portfolio products from Supabase:', err);
      }
    }
    loadProducts();
  }, []);

  const handleBuyNow = (product: Product) => {
    handleAddToCart(product, 1);
    router.push('/checkout');
  };

  return (
    <section className="max-w-[1280px] mx-auto px-6 py-16 font-sans">
      {/* Section Header */}
      <div className="text-center space-y-3 mb-12">
        <div className="inline-flex items-center gap-2 bg-[#EDF5F5] border border-[#1A5C5E]/12 px-3.5 py-1 rounded-full text-[10px] font-bold text-[#1A5C5E] uppercase tracking-[0.14em]">
          <Leaf className="w-3.5 h-3.5 text-[#C9943E]" />
          <span>OUR PORTFOLIO</span>
          <Leaf className="w-3.5 h-3.5 text-[#C9943E]" />
        </div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#1A5C5E] font-bold leading-tight uppercase">Premium Ayurvedic Products</h2>
        <div className="flex items-center justify-center gap-2" aria-hidden="true">
          <span className="w-12 h-[1px] bg-[#C9943E] opacity-50" />
          <Leaf className="w-3.5 h-3.5 text-[#C9943E]" />
          <span className="w-12 h-[1px] bg-[#C9943E] opacity-50" />
        </div>
      </div>

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {productList.map((product) => {
          const actives = getCleanIngredients(product.composition);

          return (
            <div 
              key={product.id}
              className="bg-white border border-[#E8E5DE] hover:border-[#C9943E]/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_12px_32px_rgba(29,58,40,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col group relative"
            >
              {/* Product Page Navigation Link */}
              <Link href={`/products/${product.id}`} className="block focus:outline-none">
                {/* 1. Image Media Container */}
                <div className="relative h-[220px] w-full bg-white flex items-center justify-center pt-5 px-4 pb-4 overflow-hidden border-b border-[#E8E5DE]">
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between z-20 pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 bg-[#FDF8F0] border border-[#C9943E]/40 rounded-full px-2.5 py-0.5 text-[9px] font-bold text-[#1A5C5E] uppercase shadow-sm">
                      <ShieldCheck className="w-3 h-3 text-[#C9943E]" />
                      <span>Govt. Licensed</span>
                    </span>
                    <span className="inline-flex items-center gap-1 bg-[#1A5C5E]/92 rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      <Star className="w-2.5 h-2.5 fill-[#C9943E] text-[#C9943E]" />
                      <span>4.9</span>
                    </span>
                  </div>

                  {/* Product Image */}
                  <div className="relative w-full h-[175px] transition-transform duration-500 group-hover:scale-[1.08]">
                    <Image 
                      src={product.transparentImage || product.image || "data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' viewBox%3D'0 0 1 1'%2F%3E"} 
                      alt={product.name}
                      fill
                      className="object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.08)]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                </div>

                {/* 2. Content Info Body */}
                <div className="p-5 flex flex-col gap-3.5">
                  {/* Category & Pack Size */}
                  <div className="flex justify-between items-center">
                    <span className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-[#8A6B29]">{product.category}</span>
                    {product.packSize && (
                      <span className="bg-[#1A5C5E] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">{product.packSize}</span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-[17px] font-serif font-bold text-[#1A5C5E] leading-tight mb-0.5">{product.name}</h3>

                  {/* Key Active Herbs */}
                  {actives.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[9.5px] font-bold text-slate-400 block uppercase tracking-wider">Key Actives &amp; Herbs</span>
                      <div className="flex flex-wrap gap-1.5">
                        {actives.map((herb, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 bg-emerald-50/50 border border-emerald-100 rounded-full px-2 py-0.5 text-[10px] text-emerald-800 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C9943E]" />
                            {herb}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Benefits Bullet List */}
                  {product.benefits && product.benefits.length > 0 && (
                    <ul className="space-y-1.5">
                      {product.benefits.slice(0, 2).map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-500">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#C9943E] shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Price Row */}
                  <div className="flex justify-between items-end border-t pt-3.5">
                    <div>
                      <span className="text-[9.5px] font-bold text-slate-400 block uppercase tracking-wider">Best Price</span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        {(() => {
                          const displayPrice = product.sellingPrice && product.sellingPrice > 0 ? product.sellingPrice : product.mrp;
                          const hasDiscount = Boolean(product.mrp && displayPrice && displayPrice < product.mrp);
                          const discountPct = hasDiscount ? Math.round(((product.mrp! - displayPrice!) / product.mrp!) * 100) : 0;
                          return (
                            <>
                              <span className="text-lg font-bold text-[#1A5C5E]">₹{displayPrice?.toLocaleString('en-IN')}</span>
                              {hasDiscount && (
                                <>
                                  <span className="line-through text-xs text-slate-400 font-normal">₹{product.mrp?.toLocaleString('en-IN')}</span>
                                  <span className="text-[9px] text-[#C9943E] bg-[#C9943E]/5 px-1.5 py-0.5 rounded font-bold">
                                    {discountPct}% OFF
                                  </span>
                                </>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <span className="text-[#2D5016] text-[10.5px] font-bold uppercase tracking-wider bg-[#EDF5F5] px-2 py-0.5 rounded">In Stock</span>
                  </div>
                </div>
              </Link>

              {/* 3. Action Buttons Wrapper */}
              <div className="px-5 pb-5 mt-auto flex gap-3 z-20">
                <button
                  type="button"
                  onClick={() => handleAddToCart(product, 1)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#FDF8F0] hover:bg-[#F2F7F7] text-[#1A5C5E] border border-[#C9D5D5] py-2 rounded-full text-xs font-bold transition-all cursor-pointer min-h-[38px]"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBuyNow(product)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#1A5C5E] hover:bg-[#134547] text-white py-2 rounded-full text-xs font-bold transition-all cursor-pointer min-h-[38px] border border-[#1A5C5E]"
                >
                  <span>Buy Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Catalog View All Button */}
      <div className="text-center mt-12">
        <Link 
          href="/products"
          className="inline-flex items-center justify-center border border-[#C9D5D5] hover:border-[#C9943E] text-[#1A5C5E] hover:bg-[#F2F7F7] px-6 py-2.5 rounded-full text-xs font-bold tracking-wide uppercase transition-all shadow-sm"
        >
          View All Products &rarr;
        </Link>
      </div>
    </section>
  );
}
