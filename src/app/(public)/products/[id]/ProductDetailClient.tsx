'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { 
  ShoppingBag, 
  ShieldCheck, 
  Award, 
  FlaskConical, 
  Clock, 
  Package, 
  AlertTriangle, 
  Leaf,
  FileCheck
} from 'lucide-react';

export default function ProductDetailClient({ product }: { product: Product }) {
  const { handleAddToCart } = useCart();
  const router = useRouter();
  const [selectedImg, setSelectedImg] = useState(product.image || '');
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'specifications' | 'directions'>('description');

  const gallery = product.galleryImages || [product.image || ''];

  const ingredients = product.composition
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const tabs = [
    { key: 'description' as const, label: 'Description' },
    { key: 'ingredients' as const, label: 'Key Ingredients' },
    { key: 'specifications' as const, label: 'Specifications' },
    { key: 'directions' as const, label: 'Directions' },
  ];

  const handleBuyNow = () => {
    handleAddToCart(product, 1);
    router.push('/checkout');
  };

  return (
    <div className="bg-[#FDF8F0] text-slate-800 pt-24 pb-16 min-h-screen font-sans">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] text-[#2A7B7E] font-medium mb-8 uppercase tracking-wider">
          <Link href="/" className="hover:text-[#1A5C5E] transition-colors">Home</Link>
          <span>•</span>
          <Link href="/products" className="hover:text-[#1A5C5E] transition-colors">Products</Link>
          <span>•</span>
          <span className="text-slate-400">{product.name}</span>
        </div>

        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          {/* Gallery */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-[#C9D5D5] rounded-2xl p-6 flex items-center justify-center aspect-square shadow-sm">
              <img src={selectedImg} alt={product.name} className="max-h-full max-w-full object-contain" />
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImg(img)}
                  className={`w-16 h-16 border-2 p-1.5 rounded-xl bg-white cursor-pointer shrink-0 transition-all ${
                    selectedImg === img 
                      ? 'border-[#1A5C5E] shadow-sm' 
                      : 'border-slate-200 hover:border-[#C9943E]'
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Category badge */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-[#C9943E] bg-[#C9943E]/10 px-2.5 py-1 rounded-full uppercase tracking-wider border border-[#C9943E]/20">
                {product.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-[#1A5C5E] uppercase leading-tight">
              {product.name}
            </h1>

            {/* Short description */}
            <p className="text-sm text-slate-600 leading-relaxed font-light max-w-lg">
              A premium Ayurvedic formulation crafted with traditional herbal ingredients under government-licensed manufacturing standards (R-1970/Ayur).
            </p>

            {/* Key Benefits Pills */}
            <div className="flex flex-wrap gap-2">
              {product.benefits.map((b, i) => (
                <span 
                  key={i} 
                  className="inline-flex items-center gap-1 text-[10px] font-medium text-[#1A5C5E] bg-[#1A5C5E]/5 px-2.5 py-1 rounded-full border border-[#1A5C5E]/10"
                >
                  <Leaf className="w-3 h-3 text-[#C9943E]" />
                  {b}
                </span>
              ))}
            </div>

            {/* Pricing & Add to Cart */}
            <div className="bg-white p-5 rounded-2xl border border-[#C9D5D5] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-1">Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[#1A5C5E]">₹{product.sellingPrice || product.mrp}</span>
                    {product.sellingPrice && product.mrp && product.sellingPrice < product.mrp && (
                      <span className="text-sm text-slate-400 line-through">₹{product.mrp}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{product.packSize} • Inclusive of all taxes</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product, 1)}
                    className="border border-[#1A5C5E] text-[#1A5C5E] hover:bg-[#1A5C5E]/5 px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer uppercase tracking-wider transition-all"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="bg-[#1A5C5E] hover:bg-[#134547] text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer border-0 uppercase tracking-wider shadow-sm transition-all"
                  >
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 border border-[#C9D5D5]/50 rounded-xl bg-white flex items-center gap-3 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-[#C9943E]" />
                <div>
                  <span className="font-bold block text-[10px] text-[#1A5C5E] uppercase tracking-wide">Licensed Formulation</span>
                  <span className="text-[9px] text-slate-400">Mfg. Lic. R-1970/Ayur</span>
                </div>
              </div>
              <div className="p-3.5 border border-[#C9D5D5]/50 rounded-xl bg-white flex items-center gap-3 shadow-sm">
                <Award className="w-5 h-5 text-[#C9943E]" />
                <div>
                  <span className="font-bold block text-[10px] text-[#1A5C5E] uppercase tracking-wide">GMP Audited</span>
                  <span className="text-[9px] text-slate-400">Schedule T Standards</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Content Section */}
        <div className="border-t border-[#C9D5D5] pt-10">
          {/* Tab Navigation */}
          <div className="flex gap-1 border-b border-[#C9D5D5] mb-8 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-3 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer bg-transparent whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-[#1A5C5E] text-[#1A5C5E]'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-w-3xl">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-serif text-xl text-[#1A5C5E] font-semibold uppercase">Product Overview</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-light">
                    {product.name} is an {product.category.toLowerCase()} formulated with traditional Ayurvedic ingredients. 
                    Manufactured at our government-licensed facility in Yerraguntla, Kadapa District, Andhra Pradesh 
                    under strict GMP and Schedule T compliance standards.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-serif text-base text-[#1A5C5E] font-semibold uppercase">Key Benefits</h4>
                  <ul className="space-y-2.5">
                    {product.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 font-light">
                        <span className="w-5 h-5 rounded-full bg-[#1A5C5E]/5 text-[#C9943E] flex items-center justify-center shrink-0 mt-0.5 border border-[#C9943E]/20">
                          <Leaf className="w-3 h-3" />
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#1A5C5E]/5 border border-[#1A5C5E]/10 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-[#C9943E] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong className="text-[#1A5C5E]">Safety Note:</strong> {product.safetyNote}. 
                    This product is not intended to diagnose, treat, cure, or prevent any disease. 
                    Consult a qualified healthcare professional before use.
                  </p>
                </div>
              </div>
            )}

            {/* Ingredients Tab */}
            {activeTab === 'ingredients' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-serif text-xl text-[#1A5C5E] font-semibold uppercase">Composition</h3>
                  <p className="text-xs text-slate-500 font-light">
                    Each formulation is prepared using carefully sourced botanical ingredients following classical Ayurvedic ratios.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ingredients.map((ingredient, i) => (
                    <div 
                      key={i} 
                      className="bg-white p-4 rounded-xl border border-[#C9D5D5]/50 flex items-center gap-3 shadow-sm"
                    >
                      <span className="w-8 h-8 rounded-lg bg-[#1A5C5E]/5 text-[#C9943E] flex items-center justify-center shrink-0 border border-[#C9943E]/15 text-[10px] font-bold">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-xs font-medium text-slate-700">{ingredient}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#C9D5D5]/50 flex items-start gap-3 shadow-sm">
                  <FlaskConical className="w-5 h-5 text-[#C9943E] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[10px] text-[#1A5C5E] uppercase tracking-wider block">Full Composition Statement</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-mono">{product.composition}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specifications' && (
              <div className="space-y-6">
                <h3 className="font-serif text-xl text-[#1A5C5E] font-semibold uppercase">Product Specifications</h3>

                <div className="bg-white border border-[#C9D5D5] rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs">
                    <tbody>
                      {[
                        { label: 'Product Name', value: product.name, icon: Package },
                        { label: 'Category', value: product.category, icon: FileCheck },
                        { label: 'Pack Size / Net Content', value: product.packSize || 'N/A', icon: Package },
                        { label: 'MRP', value: `₹${product.mrp}/-`, icon: Package },
                        { label: 'Shelf Life', value: product.shelfLife, icon: Clock },
                        { label: 'Manufacturing License', value: 'R-1970/Ayur', icon: ShieldCheck },
                        { label: 'Licensing Authority', value: 'AYUSH Dept., Govt. of Andhra Pradesh', icon: Award },
                        { label: 'Manufacturing Location', value: 'Yerraguntla, YSR Kadapa Dist., AP - 516309', icon: Award },
                      ].map((row, i) => {
                        const Icon = row.icon;
                        return (
                          <tr key={i} className={i % 2 === 0 ? 'bg-[#FDF8F0]/50' : 'bg-white'}>
                            <td className="px-5 py-3.5 border-b border-[#C9D5D5]/30 w-[40%]">
                              <div className="flex items-center gap-2">
                                <Icon className="w-3.5 h-3.5 text-[#C9943E]" />
                                <span className="font-bold text-[10px] text-slate-600 uppercase tracking-wider">{row.label}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 border-b border-[#C9D5D5]/30 text-slate-700 font-medium">
                              {row.value}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Directions Tab */}
            {activeTab === 'directions' && (
              <div className="space-y-6">
                <h3 className="font-serif text-xl text-[#1A5C5E] font-semibold uppercase">Directions for Use</h3>

                <div className="bg-white p-6 rounded-2xl border border-[#C9D5D5] shadow-sm space-y-5">
                  <div className="flex items-start gap-4">
                    <span className="w-10 h-10 rounded-xl bg-[#1A5C5E] text-white flex items-center justify-center shrink-0 text-xs font-bold border border-[#C9943E]/20">
                      01
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-[#1A5C5E] uppercase tracking-wide">Application Method</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-light mt-1">{product.usage}</p>
                    </div>
                  </div>

                  <div className="border-t border-[#C9D5D5]/30 pt-5 flex items-start gap-4">
                    <span className="w-10 h-10 rounded-xl bg-[#1A5C5E] text-white flex items-center justify-center shrink-0 text-xs font-bold border border-[#C9943E]/20">
                      02
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-[#1A5C5E] uppercase tracking-wide">Storage Instructions</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-light mt-1">
                        Store in a cool, dry place away from direct sunlight. Keep the container tightly closed after use. 
                        Best before {product.shelfLife} from the date of manufacture.
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[#C9D5D5]/30 pt-5 flex items-start gap-4">
                    <span className="w-10 h-10 rounded-xl bg-[#1A5C5E] text-white flex items-center justify-center shrink-0 text-xs font-bold border border-[#C9943E]/20">
                      03
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-[#1A5C5E] uppercase tracking-wide">Safety & Precautions</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-light mt-1">
                        {product.safetyNote}. Keep out of reach of children. 
                        This product is not intended to diagnose, treat, cure, or prevent any disease. 
                        Consult a qualified healthcare professional for individual conditions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
