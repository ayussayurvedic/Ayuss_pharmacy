'use client';

import React from 'react';
import { 
  AdminCard, 
  AdminInput, 
  AdminSelect, 
  AdminTextarea, 
  AdminSkeleton 
} from '@/components/admin/AdminPrimitives';
import { 
  Sparkles, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Save, 
  Image as ImageIcon 
} from 'lucide-react';
import { AdminImageUploader } from '@/components/admin/AdminImageUploader';

interface CarouselBannersTabProps {
  banners: any[];
  bannersLoading: boolean;
  isSubmitting: boolean;
  onAddBanner: () => void;
  onRemoveBanner: (id: string) => void;
  onBannerChange: (id: string, field: string, value: any) => void;
  onMoveBanner: (index: number, direction: 'up' | 'down') => void;
  onSaveBanners: () => Promise<void>;
}

export function CarouselBannersTab({
  banners,
  bannersLoading,
  isSubmitting,
  onAddBanner,
  onRemoveBanner,
  onBannerChange,
  onMoveBanner,
  onSaveBanners
}: CarouselBannersTabProps) {
  return (
    <div className="space-y-6">
      <AdminCard className="bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C9D5D5]/40 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#C9943E]" />
            <div>
              <h3 className="font-bold text-sm text-[#134547] m-0">Homepage Carousel Banners</h3>
              <p className="text-xs text-slate-500 m-0">Configure title text, slide actions, and view-specific images for the main hero slider</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onAddBanner}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1A5C5E] hover:bg-[#134547] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Banner Slide</span>
          </button>
        </div>

        {bannersLoading ? (
          <AdminSkeleton type="table" />
        ) : banners.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-[#C9D5D5]/60 rounded-2xl bg-slate-50/50">
            <ImageIcon size={32} className="mx-auto text-slate-400 stroke-[1.2]" />
            <p className="text-xs font-bold text-slate-500 mt-2">No Banners Configured</p>
            <p className="text-[10px] text-slate-400">Click the button above to add your first slide</p>
          </div>
        ) : (
          <div className="space-y-6">
            {banners.map((banner, index) => (
              <div 
                key={banner.id} 
                className="p-5 border border-[#C9D5D5]/50 bg-[#FDFBF7]/40 rounded-2xl relative space-y-4 hover:border-[#1A5C5E]/30 transition-colors"
              >
                {/* Header bar of slide block */}
                <div className="flex items-center justify-between border-b border-[#C9D5D5]/30 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-md">
                      SLIDE #{index + 1}
                    </span>
                    <span className="text-xs font-bold text-[#134547]">
                      {banner.title || 'Untitled Banner'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => onMoveBanner(index, 'up')}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-40 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={index === banners.length - 1}
                      onClick={() => onMoveBanner(index, 'down')}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-40 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveBanner(banner.id)}
                      className="p-1 hover:bg-red-50 hover:text-red-600 rounded text-slate-400 cursor-pointer transition-colors"
                      title="Delete Slide"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Form fields layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Left: Titles & Copy */}
                  <div className="space-y-3">
                    <AdminInput
                      label="Main Title Text *"
                      value={banner.title || ''}
                      onChange={(e) => onBannerChange(banner.id, 'title', e.target.value)}
                      placeholder="e.g. Moon Light"
                    />
                    <AdminInput
                      label="Subtitle / Second Line Text"
                      value={banner.subtitle || ''}
                      onChange={(e) => onBannerChange(banner.id, 'subtitle', e.target.value)}
                      placeholder="e.g. Cream"
                    />
                    <AdminInput
                      label="Action Button Link (Product ID or Category)"
                      value={banner.link_url || ''}
                      onChange={(e) => onBannerChange(banner.id, 'link_url', e.target.value)}
                      placeholder="e.g. moon-light-cream"
                    />
                  </div>

                  {/* Middle: Description copy & Display Switch */}
                  <div className="space-y-3">
                    <AdminTextarea
                      label="Description Copy"
                      value={banner.description || ''}
                      onChange={(e) => onBannerChange(banner.id, 'description', e.target.value)}
                      placeholder="Short tagline context..."
                      rows={3.5}
                    />
                    <AdminSelect
                      label="Slide Status"
                      value={banner.is_active ? 'active' : 'inactive'}
                      onChange={(e: any) => onBannerChange(banner.id, 'is_active', e.target.value === 'active')}
                      options={[
                        { value: 'active', label: 'Active (Visible on homepage)' },
                        { value: 'inactive', label: 'Inactive (Hidden)' }
                      ]}
                    />
                  </div>

                  {/* Right: Responsive Image Uploaders */}
                  <div className="space-y-3 border-l border-slate-100 pl-0 md:pl-4">
                    <AdminImageUploader
                      label="Desktop Banner Image (1600x680px) *"
                      value={banner.desktop_image_url || ''}
                      onChange={(url) => onBannerChange(banner.id, 'desktop_image_url', url)}
                      folder="hero-section"
                    />
                    <div className="border-t border-slate-100 pt-3" />
                    <AdminImageUploader
                      label="Mobile Banner Image (800x620px) *"
                      value={banner.mobile_image_url || ''}
                      onChange={(url) => onBannerChange(banner.id, 'mobile_image_url', url)}
                      folder="hero-section"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      {/* Action Footer for Banners */}
      <div className="flex justify-end gap-3 pt-3 border-t border-[#C9D5D5]/40">
        <button
          type="button"
          disabled={isSubmitting || bannersLoading}
          onClick={onSaveBanners}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1A5C5E] hover:bg-[#134547] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Save size={14} />
          <span>Save Carousel Config</span>
        </button>
      </div>
    </div>
  );
}
