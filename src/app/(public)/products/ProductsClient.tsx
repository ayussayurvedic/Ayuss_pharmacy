'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { products, type Product, getDefaultProductImage } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useCurrency, type SupportedCurrency } from '@/context/CurrencyContext';
import { createClient } from '@/lib/supabase/client';
import { ShoppingBag, Search, Loader2, Globe } from 'lucide-react';

export default function ProductsClient() {
  const { handleAddToCart } = useCart();
  const { currency, setCurrency, formatPrice } = useCurrency();
  const [productList, setProductList] = useState<Product[]>(products);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
          const mapped: Product[] = data.map((dbP: any) => {
            return {
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
              image: dbP.image || getDefaultProductImage(dbP.id),
              transparentImage: dbP.transparent_image || dbP.image || getDefaultProductImage(dbP.id),
              galleryImages: (dbP.gallery_images && dbP.gallery_images.length > 0) ? dbP.gallery_images : [dbP.image || getDefaultProductImage(dbP.id)]
            };
          });
          setProductList(mapped);
        }
      } catch (err) {
        console.error('Error loading products from Supabase, loading local fallbacks:', err);
        const localProducts = products.map(p => ({
          ...p,
          image: p.image || getDefaultProductImage(p.id),
          transparentImage: p.transparentImage || getDefaultProductImage(p.id),
          galleryImages: (p.galleryImages && p.galleryImages.length > 0) ? p.galleryImages : [getDefaultProductImage(p.id)]
        }));
        setProductList(localProducts);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const categories = [
    { id: 'all', label: 'All Formulations' },
    { id: 'musculoskeletal', label: 'Pain Relief' },
    { id: 'skincare', label: 'Skin Care' },
  ];

  const filtered = productList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.composition.toLowerCase().includes(search.toLowerCase());
    
    if (selectedCategory === 'all') return matchesSearch;
    if (selectedCategory === 'musculoskeletal') {
      const isPainRelief = p.category.toLowerCase().includes('pain') || 
                           p.name.toLowerCase().includes('pain') || 
                           p.id.toLowerCase().includes('pain');
      return matchesSearch && isPainRelief;
    }
    if (selectedCategory === 'skincare') {
      const isSkinCare = p.category.toLowerCase().includes('skin') || 
                         p.name.toLowerCase().includes('skin') || 
                         p.id.toLowerCase().includes('skin');
      return matchesSearch && isSkinCare;
    }
    return matchesSearch;
  });

  return (
    <div className="bg-[#FDF8F0] text-slate-800 pt-20 md:pt-24 pb-16 min-h-[100dvh] font-sans overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 space-y-10">
        
        {/* Header Block */}
        <div className="border-b border-[#C9D5D5]/60 pb-8 space-y-4">
          <div className="flex items-center gap-2 text-[11px] text-[#2A7B7E] font-medium uppercase tracking-wider mb-2">
            <Link href="/" className="hover:text-[#1A5C5E] transition-colors">Home</Link>
            <span>•</span>
            <span className="text-slate-400">Products</span>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl space-y-2"
          >
            <span className="text-[11px] font-bold text-[#C9943E] uppercase tracking-wider block">Ayurvedic Formulations</span>
            <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-serif text-[#1A5C5E] font-semibold uppercase leading-snug">
              Ayurvedic Products
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed font-light max-w-2xl pb-2">
              Government-licensed proprietary formulations (License No. R-1970/Ayur) crafted using pure botanical extracts.
            </p>
          </motion.div>

          {/* Search Input & Category Filter Pills */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-2"
          >
            <div className="relative max-w-md w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                aria-label="Search formulations and ingredients"
                placeholder="Search formulations, ingredients..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full border border-[#C9D5D5] pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none focus:border-[#1A5C5E] focus:ring-1 focus:ring-[#1A5C5E] bg-white shadow-sm font-sans"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 w-full lg:w-auto">
              <div className="flex flex-wrap items-center gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                      selectedCategory === cat.id
                        ? 'bg-[#1A5C5E] text-white border-[#1A5C5E] shadow-sm'
                        : 'bg-white text-slate-600 border-[#C9D5D5] hover:border-[#C9943E]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Multi-Currency Switcher (Frankfurter API) */}
              <div className="flex items-center gap-1.5 bg-white border border-[#C9D5D5] p-1 rounded-xl shadow-2xs">
                <Globe className="w-3.5 h-3.5 text-[#C9943E] ml-1.5 shrink-0" />
                {(['INR', 'USD', 'EUR', 'AED'] as SupportedCurrency[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border-0 ${
                      currency === c
                        ? 'bg-[#1A5C5E] text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 bg-transparent'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Cards Grid */}
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.12 }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((p) => (
              <motion.div 
                key={p.id} 
                layout
                initial={{ opacity: 0, y: 25, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-white border border-[#C9D5D5] rounded-2xl overflow-hidden shadow-sm flex flex-col p-6 hover:shadow-md hover:border-[#C9943E] transition-all duration-300 group"
              >
                <Link href={`/products/${p.id}`} className="block relative aspect-square mb-6 bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                  <Image 
                    src={p.image || getDefaultProductImage(p.id)} 
                    alt={p.name} 
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <span className="absolute top-3 left-3 bg-[#1A5C5E]/90 text-[#FDF8F0] text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm z-10">
                    {p.packSize}
                  </span>
                </Link>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-bold text-[#C9943E] uppercase tracking-wider block">
                      {p.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[8px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      In Stock
                    </span>
                  </div>
                  <Link href={`/products/${p.id}`}>
                    <h3 className="font-serif font-bold text-lg text-[#1A5C5E] hover:text-[#134547] transition-colors uppercase">
                      {p.name}
                    </h3>
                  </Link>
                  <p className="text-slate-500 text-xs leading-relaxed font-light line-clamp-2">
                    {p.composition}
                  </p>
                </div>

                {/* Benefits list preview */}
                <div className="space-y-1 mb-6 pt-2 border-t border-slate-100">
                  {p.benefits.slice(0, 2).map((benefit, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-500 font-light">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C9943E] shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex justify-between items-center pt-4 border-t border-slate-100">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold tracking-wider">Best Price</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      {(() => {
                        const displayPrice = p.sellingPrice && p.sellingPrice > 0 ? p.sellingPrice : p.mrp;
                        const hasDiscount = Boolean(p.mrp && displayPrice && displayPrice < p.mrp);
                        const discountPct = hasDiscount ? Math.round(((p.mrp! - displayPrice!) / p.mrp!) * 100) : 0;
                        return (
                          <>
                            <span className="text-lg font-bold text-[#1A5C5E]">{formatPrice(displayPrice)}</span>
                            {hasDiscount && (
                              <>
                                <span className="line-through text-xs text-slate-400 font-normal">{formatPrice(p.mrp)}</span>
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
                  <button
                    type="button"
                    onClick={() => handleAddToCart(p, 1)}
                    className="bg-[#1A5C5E] hover:bg-[#134547] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border-0 uppercase tracking-wider shadow-sm transition-all hover:scale-105 active:scale-95"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Bag</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

