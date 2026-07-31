'use client';

import React, { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface AdminImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}

export function AdminImageUploader({
  value,
  onChange,
  folder = 'products',
  label = 'Upload Image'
}: AdminImageUploaderProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB.');
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      
      // Clean filename
      const cleanFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${folder}/${cleanFileName}`;

      const { data, error } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success('Image uploaded successfully.');
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2 font-sans">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">{label}</label>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[10px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <X size={10} />
            <span>Remove</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative w-20 h-20 rounded-xl border border-slate-200 bg-white overflow-hidden flex items-center justify-center shadow-2xs group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-contain p-1"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
            <ImageIcon size={20} className="stroke-[1.5]" />
            <span className="text-[9px] font-bold mt-1 uppercase tracking-wider text-slate-400">Empty</span>
          </div>
        )}

        <div className="flex-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            id={`uploader-${label.toLowerCase().replace(/\s+/g, '-')}`}
          />
          
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 disabled:opacity-75 disabled:hover:bg-white text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-all shadow-3xs cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader2 size={13} className="animate-spin text-[#1A5C5E]" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={13} className="text-slate-500" />
                <span>Choose File</span>
              </>
            )}
          </button>
          
          <p className="text-[9px] text-slate-400 mt-1 font-bold uppercase tracking-wider">
            {value ? 'Upload another file to replace current image' : 'Support WebP, PNG, JPG under 5MB'}
          </p>
        </div>
      </div>
    </div>
  );
}
