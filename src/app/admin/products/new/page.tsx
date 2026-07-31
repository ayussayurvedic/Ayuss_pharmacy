'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { AdminCard, AdminInput, AdminTextarea } from '@/components/admin/AdminPrimitives';
import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog';
import { ChevronLeft, Save } from 'lucide-react';
import { AdminImageUploader } from '@/components/admin/AdminImageUploader';

export default function NewProductForm() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  
  const [isDirty, setIsDirty] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: '',
    composition: '',
    benefits: '',
    usage: '',
    packSize: '',
    mrp: '',
    sellingPrice: '',
    shelfLife: '3 Years',
    safetyNote: '',
    image1: '',
    image2: '',
    image3: '',
    image4: '',
    image5: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);

    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    if (!formData.id.trim()) tempErrors.id = 'Product Slug ID is required.';
    if (!formData.name.trim()) tempErrors.name = 'Formulation Title is required.';
    if (!formData.category.trim()) tempErrors.category = 'Category is required.';
    if (!formData.packSize.trim()) tempErrors.packSize = 'Pack size is required.';
    
    const mrpNum = Number(formData.mrp);
    const sellingPriceNum = Number(formData.sellingPrice);

    if (!formData.mrp.trim() || isNaN(mrpNum) || mrpNum <= 0) {
      tempErrors.mrp = 'MRP must be a positive number.';
    }
    if (!formData.sellingPrice.trim() || isNaN(sellingPriceNum) || sellingPriceNum <= 0) {
      tempErrors.sellingPrice = 'Selling Price must be a positive number.';
    } else if (sellingPriceNum > mrpNum) {
      tempErrors.sellingPrice = 'Selling Price cannot exceed MRP.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleCancelClick = () => {
    if (isDirty) {
      setIsCancelDialogOpen(true);
    } else {
      router.push('/admin/products');
    }
  };

  const handleSubmitAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct form validation errors.');
      return;
    }
    setIsSubmitDialogOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitDialogOpen(false);
    setIsMutating(true);
    
    const gallery_images = [
      formData.image1.trim(),
      formData.image2.trim(),
      formData.image3.trim(),
      formData.image4.trim(),
      formData.image5.trim()
    ].filter(url => url !== '');

    const payload = {
      id: formData.id.trim().toLowerCase(),
      name: formData.name.trim(),
      category: formData.category.trim(),
      mrp: Number(formData.mrp),
      selling_price: Number(formData.sellingPrice),
      pack_size: formData.packSize.trim(),
      is_active: true,
      composition: formData.composition.trim(),
      benefits: formData.benefits.split(',').map(s => s.trim()).filter(s => s.length > 0),
      usage: formData.usage.trim(),
      shelf_life: formData.shelfLife.trim(),
      safety_note: formData.safetyNote.trim(),
      image: formData.image1.trim() || null,
      transparent_image: formData.image2.trim() || null,
      gallery_images
    };

    try {
      const { error: insertErr } = await supabase
        .from('products')
        .insert(payload);

      if (insertErr) throw insertErr;
      toast.success(`Successfully published product "${formData.name}".`);

      setIsDirty(false);
      router.push('/admin/products');
    } catch (err: any) {
      console.error('Failed to save product formulation:', err);
      toast.error(err.message || 'Failed to save product changes.');
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="flex items-center justify-between border-b border-[#C9D5D5]/60 pb-4">
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={handleCancelClick}
            className="inline-flex items-center justify-center w-9 h-9 bg-white border border-[#C9D5D5] hover:bg-slate-50 text-[#1A5C5E] rounded-xl transition-all cursor-pointer shadow-xs"
            aria-label="Back to formulations list"
          >
            <ChevronLeft size={16} />
          </button>
          <h1 className="text-xl font-bold text-[#134547]">Add Formulation</h1>
        </div>
      </div>

      <form onSubmit={handleSubmitAttempt} className="space-y-6">
        <AdminCard className="space-y-5 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A5C5E]">1. Product Identity</h3>
          <AdminInput
            label="Formulation Slug / ID * (e.g. dr-lion-pain-cream)"
            name="id"
            value={formData.id}
            onChange={handleInputChange}
            error={errors.id}
            required
          />
          <AdminInput
            label="Formulation Title *"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            required
          />
          <AdminInput
            label="Category *"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            error={errors.category}
            required
          />
        </AdminCard>

        <AdminCard className="space-y-5 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A5C5E]">2. Commercial Details</h3>
          <AdminInput
            label="Pack Size *"
            name="packSize"
            value={formData.packSize}
            onChange={handleInputChange}
            error={errors.packSize}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <AdminInput
              label="MRP (₹) *"
              name="mrp"
              value={formData.mrp}
              onChange={handleInputChange}
              error={errors.mrp}
              required
            />
            <AdminInput
              label="Selling Price (₹) *"
              name="sellingPrice"
              value={formData.sellingPrice}
              onChange={handleInputChange}
              error={errors.sellingPrice}
              required
            />
          </div>
        </AdminCard>

        <AdminCard className="space-y-5 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A5C5E]">3. Formulation Details</h3>
          <AdminTextarea
            label="Composition"
            name="composition"
            value={formData.composition}
            onChange={handleInputChange}
            rows={3}
            placeholder="e.g. Sarsapa Thila (30 ml), Thymol (10 ml)..."
          />
          <AdminInput
            label="Benefits (comma-separated)"
            name="benefits"
            value={formData.benefits}
            onChange={handleInputChange}
            placeholder="e.g. Supports joint comfort, Helps soothe muscle discomfort"
          />
          <AdminTextarea
            label="Usage Instructions"
            name="usage"
            value={formData.usage}
            onChange={handleInputChange}
            rows={3}
            placeholder="e.g. Apply an adequate amount to the affected area..."
          />
          <div className="grid grid-cols-2 gap-4">
            <AdminInput
              label="Shelf Life"
              name="shelfLife"
              value={formData.shelfLife}
              onChange={handleInputChange}
              placeholder="e.g. 3 Years"
            />
            <AdminInput
              label="Safety Note"
              name="safetyNote"
              value={formData.safetyNote}
              onChange={handleInputChange}
              placeholder="e.g. Ayurvedic cream for external use only"
            />
          </div>
        </AdminCard>

        <AdminCard className="space-y-5 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
          <div className="flex justify-between items-center border-b border-[#C9D5D5]/40 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A5C5E]">4. Product Images & Visual Assets</h3>
            <span className="text-[10px] text-slate-400 font-semibold font-mono">WebP / DataURL / File Upload</span>
          </div>



          {/* Live Image Thumbnail Previews */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { key: 'image1', label: 'Main / Hero' },
              { key: 'image2', label: 'Transparent' },
              { key: 'image3', label: 'Gallery 1' },
              { key: 'image4', label: 'Gallery 2' },
              { key: 'image5', label: 'Gallery 3' }
            ].map(({ key, label }) => {
              const url = (formData as any)[key];
              return (
                <div key={key} className="space-y-1.5">
                  <div className="w-full h-24 rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden group">
                    {url ? (
                      <>
                        <Image src={url} alt={label} width={96} height={96} className="w-full h-full object-contain p-1" />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, [key]: '' }))}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold">No Image</span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 block text-center uppercase tracking-wider">{label}</span>
                </div>
              );
            })}
          </div>

          <div className="space-y-4 pt-2">
            <AdminImageUploader
              label="Image 1 (Main / Hero View) *"
              value={formData.image1}
              onChange={(url) => {
                setFormData(prev => ({ ...prev, image1: url }));
                setIsDirty(true);
              }}
              folder={`products/${formData.id || 'new'}`}
            />

            <AdminImageUploader
              label="Image 2 (Transparent View) *"
              value={formData.image2}
              onChange={(url) => {
                setFormData(prev => ({ ...prev, image2: url }));
                setIsDirty(true);
              }}
              folder={`products/${formData.id || 'new'}`}
            />

            <AdminImageUploader
              label="Image 3 (Gallery View 1)"
              value={formData.image3}
              onChange={(url) => {
                setFormData(prev => ({ ...prev, image3: url }));
                setIsDirty(true);
              }}
              folder={`products/${formData.id || 'new'}/gallery`}
            />

            <AdminImageUploader
              label="Image 4 (Gallery View 2)"
              value={formData.image4}
              onChange={(url) => {
                setFormData(prev => ({ ...prev, image4: url }));
                setIsDirty(true);
              }}
              folder={`products/${formData.id || 'new'}/gallery`}
            />

            <AdminImageUploader
              label="Image 5 (Gallery View 3)"
              value={formData.image5}
              onChange={(url) => {
                setFormData(prev => ({ ...prev, image5: url }));
                setIsDirty(true);
              }}
              folder={`products/${formData.id || 'new'}/gallery`}
            />
          </div>
        </AdminCard>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button 
            type="button" 
            onClick={handleCancelClick}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1A5C5E] hover:bg-[#134547] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            disabled={isMutating}
          >
            <Save size={14} />
            <span>Save Formulation</span>
          </button>
        </div>
      </form>

      <AdminConfirmDialog
        isOpen={isCancelDialogOpen}
        title="Discard Changes?"
        message="You have unsaved changes. Are you sure you want to discard them?"
        confirmLabel="Discard"
        isDestructive
        onConfirm={() => {
          setIsCancelDialogOpen(false);
          router.push('/admin/products');
        }}
        onCancel={() => setIsCancelDialogOpen(false)}
      />

      <AdminConfirmDialog
        isOpen={isSubmitDialogOpen}
        title="Confirm Publish"
        message="Are you sure you want to publish this formulation?"
        confirmLabel="Save"
        onConfirm={handleConfirmSubmit}
        onCancel={() => setIsSubmitDialogOpen(false)}
      />
    </div>
  );
}
