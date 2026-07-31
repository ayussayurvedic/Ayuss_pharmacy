'use client';

import React from 'react';
import { AdminCard, AdminSkeleton } from '@/components/admin/AdminPrimitives';
import { Save, Image as ImageIcon } from 'lucide-react';
import { AdminImageUploader } from '@/components/admin/AdminImageUploader';

interface ProductMediaTabProps {
  products: any[];
  productsLoading: boolean;
  productSavingId: string | null;
  onProductMediaChange: (id: string, field: string, value: any) => void;
  onSaveProductMedia: (productId: string) => Promise<void>;
}

export function ProductMediaTab({
  products,
  productsLoading,
  productSavingId,
  onProductMediaChange,
  onSaveProductMedia
}: ProductMediaTabProps) {
  return (
    <div className="space-y-6">
      <AdminCard className="bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
        <div className="border-b border-[#C9D5D5]/40 pb-3 mb-4">
          <h3 className="font-bold text-sm text-[#134547] m-0">Product Image Assets Manager</h3>
          <p className="text-xs text-slate-500 m-0">Quickly upload and update main images and transparent background images for all products in the catalog</p>
        </div>

        {productsLoading ? (
          <AdminSkeleton type="table" />
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No products found in catalog. Create some products first.
          </div>
        ) : (
          <div className="space-y-6">
            {products.map((product) => (
              <div 
                key={product.id}
                className="p-5 border border-[#C9D5D5]/50 bg-white rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#1A5C5E]/30 transition-all"
              >
                {/* Product Name */}
                <div className="flex items-center gap-3 md:w-1/4">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image} alt={product.name} className="w-full h-full object-contain p-0.5" />
                    ) : (
                      <ImageIcon size={18} className="text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#134547] m-0 leading-tight">{product.name}</h4>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">ID: {product.id}</span>
                  </div>
                </div>

                {/* Media Uploaders */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 pl-0 md:pl-6 border-l-0 md:border-l border-slate-100">
                  <AdminImageUploader
                    label="Main Product Card Image"
                    value={product.image || ''}
                    onChange={(url) => onProductMediaChange(product.id, 'image', url)}
                    folder={`products/${product.id}`}
                  />
                  <AdminImageUploader
                    label="Transparent BG Zoom Image"
                    value={product.transparent_image || ''}
                    onChange={(url) => onProductMediaChange(product.id, 'transparent_image', url)}
                    folder={`products/${product.id}`}
                  />
                </div>

                {/* Quick Save button per product */}
                <div className="flex items-center justify-end md:w-32 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                  <button
                    type="button"
                    disabled={productSavingId === product.id}
                    onClick={() => onSaveProductMedia(product.id)}
                    className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-3xs"
                  >
                    {productSavingId === product.id ? (
                      <span className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save size={13} />
                    )}
                    <span>Save Media</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
