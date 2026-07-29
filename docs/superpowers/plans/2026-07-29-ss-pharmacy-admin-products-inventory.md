# S.S. Pharmacy Admin Products & Inventory (Wave 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild S.S. Pharmacy admin products list, add/edit product formulations form, inventory control dashboard, and history logs ledger inside Next.js, reusing the S.S. Pharmacy visual templates.

**Architecture:** Create server/client page boundaries under `/admin/products` and `/admin/inventory` using dynamic rendering (`force-dynamic`). Connect to the `products`, `inventory`, `inventory_movements`, and `inventory_reservations` Supabase tables, and use the existing `adjust_inventory` database RPC.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Supabase SSR, Lucide Icons, Vitest.

## Global Constraints
* Re-use the existing visual design layouts and components from S.S. Pharmacy (Next.js).
* Keep all file edits localized, focused, and type-safe.
* Do NOT stage, commit, or push any changes to Git or GitHub per user instruction.
* Dynamic rendering is required (`export const dynamic = 'force-dynamic'`) on pages querying Supabase database status.

---

### Task 1: Rebuild Admin Products List Page

**Files:**
* Create: `src/app/admin/products/page.tsx`
* Create: `src/__tests__/pure/products-filtering.test.ts`

**Interfaces:**
* Consumes: `src/data/products.ts` static records, Supabase `products` table rows.
* Produces: Filtered and paginated lists of formulations with edit/duplicate/archive actions.

- [ ] **Step 1: Write formulation filter unit test**
  Create `src/__tests__/pure/products-filtering.test.ts`:
  ```typescript
  import { describe, it, expect } from 'vitest';

  interface LocalProduct {
    name: string;
    category: string;
  }

  function filterList(list: LocalProduct[], search: string, category: string): LocalProduct[] {
    return list.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.category.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'all' || p.category === category;
      return matchSearch && matchCat;
    });
  }

  describe('Formulation Filtering Logic', () => {
    const list: LocalProduct[] = [
      { name: 'Dr. Lion Pain Cream', category: 'Cream' },
      { name: 'Dr. Lion Pain Pills', category: 'Pills' },
      { name: 'Moon Light Cream', category: 'Cream' }
    ];

    it('should filter by search query', () => {
      const res = filterList(list, 'Pills', 'all');
      expect(res.length).toBe(1);
      expect(res[0].name).toBe('Dr. Lion Pain Pills');
    });

    it('should filter by category', () => {
      const res = filterList(list, '', 'Cream');
      expect(res.length).toBe(2);
    });
  });
  ```

- [ ] **Step 2: Run test to verify it passes**
  Run: `npx vitest run src/__tests__/pure/products-filtering.test.ts`
  Expected: PASS

- [ ] **Step 3: Create src/app/admin/products/page.tsx**
  Write a dynamic admin products component under `src/app/admin/products/page.tsx`:
  ```tsx
  'use client';

  import { useState, useEffect } from 'react';
  import Link from 'next/link';
  import { useRouter } from 'next/navigation';
  import { products as initialProducts, type Product } from '@/data/products';
  import { createClient } from '@/lib/supabase/client';
  import { useToast } from '@/components/ui/Toast';
  import { 
    AdminCard, 
    AdminStatusBadge, 
    AdminDataTable, 
    AdminFilterBar, 
    AdminPagination, 
    AdminSkeleton 
  } from '@/components/admin/AdminPrimitives';
  import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog';
  import { Plus, Eye, Copy, Trash } from 'lucide-react';

  export default function AdminProducts() {
    const { toast } = useToast();
    const router = useRouter();
    const supabase = createClient();
    const [productList, setProductList] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ type: 'archive' | 'duplicate'; productId: string } | null>(null);
    const [isMutating, setIsMutating] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: dbErr } = await supabase
          .from('products')
          .select('*')
          .order('name', { ascending: true });
        
        if (dbErr) throw dbErr;

        const mapped: Product[] = (data || []).map((dbP: any) => {
          const staticP = initialProducts.find(p => p.id === dbP.id);
          return {
            id: dbP.id,
            name: dbP.name || '',
            category: dbP.category || '',
            mrp: Number(dbP.mrp),
            sellingPrice: Number(dbP.selling_price),
            packSize: dbP.pack_size || '',
            isActive: dbP.is_active,
            composition: staticP?.composition || '',
            benefits: staticP?.benefits || [],
            usage: staticP?.usage || '',
            shelfLife: staticP?.shelfLife || '3 Years',
            safetyNote: staticP?.safetyNote || 'Ayurvedic formulation',
            image: staticP?.image || undefined,
            transparentImage: staticP?.transparentImage || undefined,
            galleryImages: staticP?.galleryImages || []
          };
        });

        setProductList(mapped);
      } catch (err: any) {
        console.error('Failed to load products:', err);
        setError(err.message || 'Failed to fetch products from database.');
        toast.error('Error fetching products from database.');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchProducts();
    }, []);

    const categories = ['all', ...Array.from(new Set(productList.map((p) => p.category)))];

    const filteredProducts = productList.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });

    const totalRecords = filteredProducts.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const paginatedProducts = filteredProducts.slice(
      (currentPage - 1) * recordsPerPage,
      currentPage * recordsPerPage
    );

    useEffect(() => {
      setCurrentPage(1);
    }, [searchQuery, categoryFilter]);

    const handleActionClick = (type: 'archive' | 'duplicate', productId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setPendingAction({ type, productId });
      setIsConfirmOpen(true);
    };

    const handleConfirmAction = async () => {
      if (!pendingAction) return;
      setIsConfirmOpen(false);
      setIsMutating(true);
      const { type, productId } = pendingAction;
      const target = productList.find(p => p.id === productId);
      
      if (!target) {
        setIsMutating(false);
        setPendingAction(null);
        return;
      }

      try {
        if (type === 'duplicate') {
          const uniqueId = `${target.id}-copy-${Math.floor(100 + Math.random() * 900)}`;
          const newName = `${target.name} (Copy)`;
          
          const { error: insertErr } = await supabase
            .from('products')
            .insert({
              id: uniqueId,
              name: newName,
              category: target.category,
              mrp: target.mrp || 249,
              selling_price: target.sellingPrice || 199,
              pack_size: target.packSize || '100g Jar',
              is_active: true
            });

          if (insertErr) throw insertErr;

          toast.success(`Duplicated "${target.name}" successfully.`);
          await fetchProducts();
        } else if (type === 'archive') {
          const { error: updateErr } = await supabase
            .from('products')
            .update({ is_active: false })
            .eq('id', productId);

          if (updateErr) throw updateErr;

          toast.success(`Archived "${target.name}" successfully.`);
          await fetchProducts();
        }
      } catch (err: any) {
        console.error(`Failed to execute ${type} action:`, err);
        toast.error(err.message || `Failed to execute ${type} action.`);
      } finally {
        setIsMutating(false);
        setPendingAction(null);
      }
    };

    const filterOptions = categories.map(cat => ({
      label: cat === 'all' ? 'All Categories' : cat,
      value: cat
    }));

    const columns = [
      { 
        header: 'Formulation Product', 
        render: (p: Product) => (
          <div className="flex items-center gap-3">
            <img 
              src={p.image || `/products/logo/logo.webp`}
              alt={p.name} 
              className="w-10 h-10 object-cover rounded-lg shrink-0 border border-slate-800"
            />
            <div>
              <span className="font-semibold block text-xs text-slate-200">{p.name}</span>
              <span className="text-[10px] text-slate-500 font-mono">ID: {p.id}</span>
            </div>
          </div>
        )
      },
      { header: 'Category', render: (p: Product) => <span className="text-xs text-slate-400">{p.category}</span> },
      { header: 'Pack Size', render: (p: Product) => <span className="font-mono text-xs text-slate-200">{p.packSize || '100g Jar'}</span> },
      { header: 'MRP Price', render: (p: Product) => <span className="font-mono font-semibold text-slate-200">{p.mrp ? `₹${p.mrp.toLocaleString('en-IN')}` : '₹249'}</span> },
      { header: 'Status', render: (p: Product) => <AdminStatusBadge status={p.isActive ? 'active' : 'archived'} /> },
      { 
        header: 'Actions', 
        render: (p: Product) => (
          <div className="flex items-center justify-end gap-1.5">
            <button 
              type="button" 
              onClick={() => router.push(`/admin/products/${p.id}`)}
              disabled={isMutating}
              className="admin-btn-outline !min-h-[36px] !min-w-[36px] !p-0 flex items-center justify-center text-xs"
              title="Edit product formulation"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button 
              type="button" 
              onClick={(e) => handleActionClick('duplicate', p.id, e)}
              disabled={isMutating}
              className="admin-btn-icon !min-h-[36px] !min-w-[36px] !p-0 flex items-center justify-center"
              title="Duplicate product"
            >
              <Copy className="w-4 h-4" />
            </button>
            {p.isActive && (
              <button 
                type="button" 
                onClick={(e) => handleActionClick('archive', p.id, e)}
                disabled={isMutating}
                className="admin-btn-icon !min-h-[36px] !min-w-[36px] !p-0 flex items-center justify-center !border-red-950 !text-red-500 hover:!bg-red-950/20"
                title="Archive product"
              >
                <Trash className="w-4 h-4" />
              </button>
            )}
          </div>
        ),
        className: 'text-right'
      }
    ];

    return (
      <div className="space-y-5 text-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Catalog Workspace</span>
            </div>
            <h1 className="text-xl font-bold text-slate-100">Ayurvedic Catalogue</h1>
            <p className="text-xs text-slate-500 margin-0">Manage licensed Ayurvedic formulations, packshots, and prices</p>
          </div>

          <Link href="/admin/products/new" className="admin-btn-primary self-start sm:self-auto flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Add Formulation</span>
          </Link>
        </div>

        <AdminCard>
          <AdminFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search product name..."
            selectedFilter={categoryFilter}
            onFilterChange={setCategoryFilter}
            filterOptions={filterOptions}
            filterLabel="Category"
          />
        </AdminCard>

        {loading ? (
          <AdminSkeleton type="table" rows={4} />
        ) : error ? (
          <div className="text-red-500 text-xs py-4">{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-slate-500 text-center py-10">No formulations found.</div>
        ) : (
          <>
            <AdminDataTable
              columns={columns}
              data={paginatedProducts}
              keyExtractor={(p) => p.id}
            />
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={totalRecords}
              recordsPerPage={recordsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}

        <AdminConfirmDialog
          isOpen={isConfirmOpen}
          title={pendingAction?.type === 'archive' ? 'Archive Product' : 'Duplicate Product'}
          message={
            pendingAction?.type === 'archive'
              ? 'Are you sure you want to archive this product formulation? It will be deactivated.'
              : 'Are you sure you want to clone this product formulation?'
          }
          confirmLabel={pendingAction?.type === 'archive' ? 'Archive' : 'Duplicate'}
          isDestructive={pendingAction?.type === 'archive'}
          onConfirm={handleConfirmAction}
          onCancel={() => setIsConfirmOpen(false)}
        />
      </div>
    );
  }
  ```

- [ ] **Step 4: Run production build check to verify compile success**
  Run: `npm run build`
  Expected: Compiled successfully with 0 errors.

---

### Task 2: Rebuild Product Editor & Creator Form Pages

**Files:**
* Create: `src/app/admin/products/[id]/page.tsx` (edit form route)
* Create: `src/app/admin/products/new/page.tsx` (new form route)

**Interfaces:**
* Consumes: Mapped Supabase client, static assets.
* Produces: Forms enabling admins to edit MRPs, titles, pack sizes, and publish catalog items.

- [ ] **Step 1: Create src/app/admin/products/[id]/page.tsx**
  Rebuild the edit form using client components:
  ```tsx
  'use client';

  import { useState, useEffect, use } from 'react';
  import { useRouter } from 'next/navigation';
  import { products as initialProducts } from '@/data/products';
  import { useToast } from '@/components/ui/Toast';
  import { createClient } from '@/lib/supabase/client';
  import { AdminCard, AdminInput, AdminTextarea } from '@/components/admin/AdminPrimitives';
  import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog';
  import { ChevronLeft, Save } from 'lucide-react';

  export default function EditProductForm({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { toast } = useToast();
    const supabase = createClient();
    
    const [isDirty, setIsDirty] = useState(false);
    const [loading, setLoading] = useState(true);
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
      isActive: true,
      shelfLife: '',
      safetyNote: '',
      image: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
      const fetchProductDetails = async () => {
        setLoading(true);
        try {
          const { data, error: dbErr } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

          if (dbErr) throw dbErr;

          if (data) {
            const staticP = initialProducts.find((p) => p.id === id);
            setFormData({
              id: data.id,
              name: data.name || '',
              category: data.category || '',
              composition: staticP?.composition || '',
              benefits: staticP?.benefits.join(', ') || '',
              usage: staticP?.usage || '',
              packSize: data.pack_size || '',
              mrp: String(data.mrp || 0),
              sellingPrice: String(data.selling_price || 0),
              isActive: data.is_active ?? true,
              shelfLife: staticP?.shelfLife || '',
              safetyNote: staticP?.safetyNote || '',
              image: staticP?.image || ''
            });
          }
        } catch (err: any) {
          console.error('Failed to load product details:', err);
          toast.error('Failed to load product details from database.');
          router.push('/admin/products');
        } finally {
          setLoading(false);
        }
      };

      fetchProductDetails();
    }, [id]);

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
      
      const payload = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        mrp: Number(formData.mrp),
        selling_price: Number(formData.sellingPrice),
        pack_size: formData.packSize.trim(),
        is_active: formData.isActive
      };

      try {
        const { error: updateErr } = await supabase
          .from('products')
          .update(payload)
          .eq('id', id);

        if (updateErr) throw updateErr;
        toast.success(`Successfully updated product "${formData.name}".`);

        setIsDirty(false);
        router.push('/admin/products');
      } catch (err: any) {
        console.error('Failed to save product changes:', err);
        toast.error(err.message || 'Failed to save product changes.');
      } finally {
        setIsMutating(false);
      }
    };

    if (loading) {
      return <div className="text-slate-500 py-10 text-center">Loading product form details...</div>;
    }

    return (
      <div className="space-y-5 pb-12 text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={handleCancelClick}
              className="admin-btn-icon !min-h-[36px] !min-w-[36px] !p-0 flex items-center justify-center"
              aria-label="Back to formulations list"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-bold text-slate-100">Edit Formulation</h1>
          </div>
        </div>

        <form onSubmit={handleSubmitAttempt} className="space-y-5">
          <AdminCard className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">1. Product Identity</h3>
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

          <AdminCard className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">2. Commercial Details</h3>
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

          <div className="flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={handleCancelClick}
              className="admin-btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="admin-btn-primary flex items-center gap-1.5"
              disabled={isMutating}
            >
              <Save className="w-4 h-4" />
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
          message="Are you sure you want to publish these changes to the formulation?"
          confirmLabel="Save"
          onConfirm={handleConfirmSubmit}
          onCancel={() => setIsSubmitDialogOpen(false)}
        />
      </div>
    );
  }
  ```

- [ ] **Step 2: Create src/app/admin/products/new/page.tsx**
  Implement product creation page. Same form as edit mode but with insert payload and enabled ID field.
  ```tsx
  'use client';

  import { useState } from 'react';
  import { useRouter } from 'next/navigation';
  import { useToast } from '@/components/ui/Toast';
  import { createClient } from '@/lib/supabase/client';
  import { AdminCard, AdminInput } from '@/components/admin/AdminPrimitives';
  import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog';
  import { ChevronLeft, Save } from 'lucide-react';

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
      packSize: '',
      mrp: '',
      sellingPrice: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      const payload = {
        id: formData.id.trim().toLowerCase(),
        name: formData.name.trim(),
        category: formData.category.trim(),
        mrp: Number(formData.mrp),
        selling_price: Number(formData.sellingPrice),
        pack_size: formData.packSize.trim(),
        is_active: true
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
      <div className="space-y-5 pb-12 text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={handleCancelClick}
              className="admin-btn-icon !min-h-[36px] !min-w-[36px] !p-0 flex items-center justify-center"
              aria-label="Back to formulations list"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-bold text-slate-100">Add Formulation</h1>
          </div>
        </div>

        <form onSubmit={handleSubmitAttempt} className="space-y-5">
          <AdminCard className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">1. Product Identity</h3>
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

          <AdminCard className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">2. Commercial Details</h3>
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

          <div className="flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={handleCancelClick}
              className="admin-btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="admin-btn-primary flex items-center gap-1.5"
              disabled={isMutating}
            >
              <Save className="w-4 h-4" />
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
  ```

- [ ] **Step 3: Run production build check to verify compile success**
  Run: `npm run build`
  Expected: Compiled successfully with 0 errors.

---

### Task 3: Rebuild Admin Inventory Control Page

**Files:**
* Create: `src/app/admin/inventory/page.tsx`
* Create: `src/__tests__/pure/inventory-math.test.ts`

**Interfaces:**
* Consumes: Supabase `inventory` table join on `products`.
* Produces: Adjust inventory quantities using `adjust_inventory` RPC.

- [ ] **Step 1: Write inventory calculation unit test**
  Create `src/__tests__/pure/inventory-math.test.ts`:
  ```typescript
  import { describe, it, expect } from 'vitest';

  function getAvailableStock(onHand: number, reserved: number): number {
    return onHand - reserved;
  }

  function getStockStatus(available: number, reorderLevel: number, enabled: boolean): 'in_stock' | 'low_stock' | 'out_of_stock' | 'disabled' {
    if (!enabled) return 'disabled';
    if (available <= 0) return 'out_of_stock';
    if (available <= reorderLevel) return 'low_stock';
    return 'in_stock';
  }

  describe('Inventory Math & Status Check', () => {
    it('should compute available quantity correctly', () => {
      expect(getAvailableStock(100, 10)).toBe(90);
    });

    it('should determine stock condition types correctly', () => {
      expect(getStockStatus(90, 10, true)).toBe('in_stock');
      expect(getStockStatus(5, 10, true)).toBe('low_stock');
      expect(getStockStatus(0, 10, true)).toBe('out_of_stock');
      expect(getStockStatus(90, 10, false)).toBe('disabled');
    });
  });
  ```

- [ ] **Step 2: Run tests to verify they pass**
  Run: `npx vitest run src/__tests__/pure/inventory-math.test.ts`
  Expected: PASS

- [ ] **Step 3: Create src/app/admin/inventory/page.tsx**
  Write the Next.js inventory workspace component under `src/app/admin/inventory/page.tsx`:
  ```tsx
  'use client';

  import { useState, useEffect } from 'react';
  import { useRouter } from 'next/navigation';
  import { createClient } from '@/lib/supabase/client';
  import { useToast } from '@/components/ui/Toast';
  import { 
    AdminCard, 
    AdminStatusBadge, 
    AdminInput, 
    AdminFilterBar, 
    AdminDataTable, 
    AdminSkeleton 
  } from '@/components/admin/AdminPrimitives';
  import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog';
  import { RefreshCw } from 'lucide-react';

  export default function AdminInventory() {
    const { toast } = useToast();
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [inventoryList, setInventoryList] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Adjustment Modal State
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [adjustDelta, setAdjustDelta] = useState<string>('0');
    const [adjustReason, setAdjustReason] = useState<string>('');

    const fetchInventory = async () => {
      setLoading(true);
      try {
        const { data: invData, error: invErr } = await supabase
          .from('inventory')
          .select('*, products(name, mrp, category)');

        if (invErr) throw invErr;
        setInventoryList(invData || []);
      } catch (err: any) {
        console.error('Fetch inventory error:', err);
        toast.error('Failed to load inventory from Supabase.');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchInventory();
    }, []);

    const handleOpenAdjustModal = (item: any) => {
      setSelectedProduct(item);
      setAdjustDelta('0');
      setAdjustReason('');
      setIsAdjustModalOpen(true);
    };

    const handleAdjustSubmit = async () => {
      if (!selectedProduct) return;
      const deltaVal = Number(adjustDelta);
      if (isNaN(deltaVal) || deltaVal === 0) {
        toast.error('Quantity delta must be a non-zero integer.');
        return;
      }
      if (!adjustReason.trim()) {
        toast.error('Adjustment reason is mandatory.');
        return;
      }

      setIsSubmitting(true);
      try {
        const { data, error: rpcErr } = await supabase.rpc('adjust_inventory', {
          p_product_id: selectedProduct.product_id,
          p_quantity_delta: deltaVal,
          p_reason: adjustReason.trim()
        });

        if (rpcErr || !data?.success) {
          throw new Error(rpcErr?.message || 'Inventory adjustment failed');
        }

        toast.success(`Stock updated for ${selectedProduct.products?.name || selectedProduct.product_id}.`);
        setIsAdjustModalOpen(false);
        await fetchInventory();
      } catch (err: any) {
        console.error('Adjust inventory error:', err);
        toast.error(err.message || 'Failed to adjust stock.');
      } finally {
        setIsSubmitting(false);
      }
    };

    const filteredInventory = inventoryList.filter(item => {
      const prodName = item.products?.name || item.product_id;
      const matchesSearch = prodName.toLowerCase().includes(search.toLowerCase()) ||
                            (item.sku && item.sku.toLowerCase().includes(search.toLowerCase()));
      
      const available = item.quantity_on_hand - item.quantity_reserved;
      let status = 'IN_STOCK';
      if (!item.inventory_enabled) status = 'DISABLED';
      else if (available <= 0) status = 'OUT_OF_STOCK';
      else if (available <= item.reorder_level) status = 'LOW_STOCK';

      const matchesStatus = statusFilter === 'ALL' || status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const totalSKUs = inventoryList.length;
    const lowStockCount = inventoryList.filter(i => (i.quantity_on_hand - i.quantity_reserved) > 0 && (i.quantity_on_hand - i.quantity_reserved) <= i.reorder_level).length;
    const outOfStockCount = inventoryList.filter(i => (i.quantity_on_hand - i.quantity_reserved) <= 0).length;

    const filterOptions = [
      { label: 'All Stock Statuses', value: 'ALL' },
      { label: 'In Stock', value: 'IN_STOCK' },
      { label: 'Low Stock', value: 'LOW_STOCK' },
      { label: 'Out of Stock', value: 'OUT_OF_STOCK' },
      { label: 'Disabled', value: 'DISABLED' }
    ];

    const columns = [
      {
        header: 'Product Description',
        render: (item: any) => (
          <div>
            <span className="font-semibold text-slate-200 block text-xs">{item.products?.name || item.product_id}</span>
            <span className="text-[10px] text-slate-500">{item.products?.category}</span>
          </div>
        )
      },
      {
        header: 'SKU',
        render: (item: any) => <span className="font-mono text-xs text-slate-400">{item.sku || 'N/A'}</span>
      },
      {
        header: 'On Hand',
        render: (item: any) => <span className="font-mono font-semibold text-slate-200">{item.quantity_on_hand}</span>,
        className: 'text-right'
      },
      {
        header: 'Reserved',
        render: (item: any) => <span className="font-mono text-slate-500">{item.quantity_reserved}</span>,
        className: 'text-right'
      },
      {
        header: 'Available',
        render: (item: any) => {
          const available = item.quantity_on_hand - item.quantity_reserved;
          return <span className="font-mono font-semibold text-slate-200">{available}</span>;
        },
        className: 'text-right'
      },
      {
        header: 'Reorder Level',
        render: (item: any) => <span className="font-mono text-xs text-slate-500">{item.reorder_level}</span>,
        className: 'text-center'
      },
      {
        header: 'Stock Condition',
        render: (item: any) => {
          const available = item.quantity_on_hand - item.quantity_reserved;
          let status = 'in_stock';
          if (!item.inventory_enabled) status = 'disabled';
          else if (available <= 0) status = 'out_of_stock';
          else if (available <= item.reorder_level) status = 'low_stock';

          return <AdminStatusBadge status={status} />;
        }
      },
      {
        header: 'Actions',
        render: (item: any) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenAdjustModal(item);
              }}
              className="admin-btn-outline !min-h-[30px] !py-1 !px-2 text-[10px] flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Adjust</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/inventory/${item.product_id}`);
              }}
              className="admin-btn-icon !min-h-[30px] !py-1 !px-2 text-[10px]"
              title="Ledger History"
            >
              <span>Ledger</span>
            </button>
          </div>
        ),
        className: 'text-right'
      }
    ];

    return (
      <div className="space-y-5 pb-12 text-slate-200">
        <div className="pb-3 border-b border-slate-800">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Inventory Management Workspace</span>
          <h1 className="text-xl font-bold text-slate-100">Stock Levels</h1>
          <p className="text-xs text-slate-500 margin-0">Server-authoritative stock levels, reservations, and adjustment ledger</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <AdminCard>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Total Tracked SKUs</span>
            <span className="text-xl font-bold font-mono text-slate-200">{totalSKUs}</span>
          </AdminCard>
          <AdminCard>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Low Stock Warnings</span>
            <span className="text-xl font-bold font-mono text-orange-400">{lowStockCount}</span>
          </AdminCard>
          <AdminCard className="!border-red-950">
            <span className="text-[10px] font-semibold text-red-500 uppercase tracking-wider block">Out of Stock Alert</span>
            <span className="text-xl font-bold font-mono text-red-500">{outOfStockCount}</span>
          </AdminCard>
        </div>

        <AdminCard>
          <AdminFilterBar
            searchQuery={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search SKU or name..."
            selectedFilter={statusFilter}
            onFilterChange={setStatusFilter}
            filterOptions={filterOptions}
            filterLabel="Stock Status"
          />
        </AdminCard>

        {loading ? (
          <AdminSkeleton type="table" rows={4} />
        ) : filteredInventory.length === 0 ? (
          <div className="text-slate-500 text-center py-10">No items in inventory matching filters.</div>
        ) : (
          <AdminDataTable
            columns={columns}
            data={filteredInventory}
            keyExtractor={(i) => i.product_id}
          />
        )}

        <AdminConfirmDialog
          isOpen={isAdjustModalOpen}
          title={`Adjust Stock: ${selectedProduct?.products?.name || selectedProduct?.product_id}`}
          message={`Adjust quantity on hand for this product. Use a positive number to add stock, and a negative number to subtract.`}
          confirmLabel={isSubmitting ? 'Adjusting...' : 'Adjust Stock'}
          onConfirm={handleAdjustSubmit}
          onCancel={() => setIsAdjustModalOpen(false)}
        >
          <div className="space-y-4 pt-3 text-xs text-slate-300">
            <AdminInput
              label="Quantity Delta *"
              type="number"
              value={adjustDelta}
              onChange={(e) => setAdjustDelta(e.target.value)}
              required
            />
            <AdminInput
              label="Reason for Adjustment *"
              type="text"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="e.g. Damaged inventory / Stock update"
              required
            />
          </div>
        </AdminConfirmDialog>
      </div>
    );
  }
  ```

- [ ] **Step 4: Run production build check to verify compile success**
  Run: `npm run build`
  Expected: Compiled successfully with 0 errors.

---

### Task 4: Rebuild Admin Inventory Ledger Page

**Files:**
* Create: `src/app/admin/inventory/[productId]/page.tsx`

**Interfaces:**
* Consumes: Mapped Supabase client, productId path params.
* Produces: Table listing movements history and reservations ledger.

- [ ] **Step 1: Create src/app/admin/inventory/[productId]/page.tsx**
  Implement inventory ledger detail view:
  ```tsx
  'use client';

  import { useState, useEffect, use } from 'react';
  import Link from 'next/link';
  import { createClient } from '@/lib/supabase/client';
  import { useToast } from '@/components/ui/Toast';
  import { AdminCard, AdminSkeleton, AdminStatusBadge } from '@/components/admin/AdminPrimitives';
  import { ChevronLeft, Clock, History } from 'lucide-react';

  export default function AdminInventoryDetail({ params }: { params: Promise<{ productId: string }> }) {
    const { productId } = use(params);
    const { toast } = useToast();
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [inventory, setInventory] = useState<any | null>(null);
    const [movements, setMovements] = useState<any[]>([]);
    const [reservations, setReservations] = useState<any[]>([]);

    const fetchDetail = async () => {
      if (!productId) return;
      setLoading(true);
      try {
        // 1. Fetch Inventory Record
        const { data: invData, error: invErr } = await supabase
          .from('inventory')
          .select('*, products(name, mrp, category)')
          .eq('product_id', productId)
          .maybeSingle();

        if (invErr) throw invErr;
        setInventory(invData);

        // 2. Fetch Movements Ledger
        const { data: movData, error: movErr } = await supabase
          .from('inventory_movements')
          .select('*')
          .eq('product_id', productId)
          .order('created_at', { ascending: false });

        if (movErr) throw movErr;
        setMovements(movData || []);

        // 3. Fetch Reservations
        const { data: resData, error: resErr } = await supabase
          .from('inventory_reservations')
          .select('*')
          .eq('product_id', productId)
          .eq('status', 'active');

        if (resErr) throw resErr;
        setReservations(resData || []);

      } catch (err: any) {
        console.error('Fetch inventory detail error:', err);
        toast.error('Failed to load inventory movement details.');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchDetail();
    }, [productId]);

    if (loading) {
      return (
        <div className="space-y-5 py-6">
          <AdminSkeleton type="card" />
          <AdminSkeleton type="table" rows={4} />
        </div>
      );
    }

    const available = inventory ? (inventory.quantity_on_hand - inventory.quantity_reserved) : 0;

    return (
      <div className="space-y-5 pb-12 text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <Link href="/admin/inventory" className="admin-btn-icon !min-h-[36px] !min-w-[36px] !p-0 flex items-center justify-center" aria-label="Back to inventory">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Inventory Detail & Ledger</span>
              <h2 className="text-base font-bold text-slate-100">{inventory?.products?.name || productId}</h2>
            </div>
          </div>
          <span className="font-mono text-xs text-slate-400">SKU: {inventory?.sku || 'N/A'}</span>
        </div>

        <AdminCard>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/50 pb-3 mb-3">
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Stock Level Summary</span>
              <h3 className="font-bold text-sm text-slate-200 m-0">{inventory?.products?.name || productId}</h3>
              <p className="text-xs text-slate-500 m-0">{inventory?.products?.category}</p>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="text-center px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block font-semibold uppercase">On Hand</span>
                <span className="font-semibold text-sm text-slate-200">{inventory?.quantity_on_hand || 0}</span>
              </div>
              <div className="text-center px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block font-semibold uppercase">Reserved</span>
                <span className="font-semibold text-sm text-slate-200">{inventory?.quantity_reserved || 0}</span>
              </div>
              <div className="text-center px-3 py-1.5 bg-teal-950/20 rounded-lg border border-teal-900/50 text-teal-400">
                <span className="text-[10px] block font-semibold uppercase">Available</span>
                <span className="font-semibold text-sm">{available}</span>
              </div>
            </div>
          </div>
        </AdminCard>

        {reservations.length > 0 && (
          <AdminCard>
            <div className="flex items-center gap-2 border-b border-slate-800/50 pb-2 mb-3">
              <Clock className="w-4 h-4 text-slate-400" />
              <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-300 m-0">Active Order Reservations ({reservations.length})</h3>
            </div>
            <div className="space-y-2 text-xs">
              {reservations.map(r => (
                <div key={r.id} className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                  <div>
                    <span className="font-semibold text-slate-200">Order #{r.order_id}</span>
                    <span className="text-slate-400 ml-2 font-mono text-xs">Qty: {r.quantity}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Expires: {new Date(r.expires_at).toLocaleTimeString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        )}

        <AdminCard className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800/50 pb-2">
            <History className="w-4 h-4 text-slate-400" />
            <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-300 m-0">Movement Ledger History</h3>
          </div>

          {movements.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">No inventory movements recorded yet.</p>
          ) : (
            <div className="admin-table-container overflow-x-auto">
              <table className="admin-data-table min-w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-2 text-slate-400">Movement Type</th>
                    <th className="text-right py-2 text-slate-400">Change</th>
                    <th className="text-right py-2 text-slate-400">Before</th>
                    <th className="text-right py-2 text-slate-400">After</th>
                    <th className="text-left py-2 text-slate-400">Reason / Reference</th>
                    <th className="text-left py-2 text-slate-400">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id} className="border-b border-slate-800/30 hover:bg-slate-900/10">
                      <td className="font-semibold text-slate-200 py-3">
                        <AdminStatusBadge status={m.movement_type.toLowerCase()} />
                      </td>
                      <td className={`text-right font-mono font-semibold py-3 ${m.quantity_change > 0 ? 'text-teal-400' : m.quantity_change < 0 ? 'text-red-500' : 'text-slate-200'}`}>
                        {m.quantity_change > 0 ? `+${m.quantity_change}` : m.quantity_change}
                      </td>
                      <td className="text-right font-mono text-slate-500 py-3">{m.quantity_before}</td>
                      <td className="text-right font-mono font-semibold text-slate-200 py-3">{m.quantity_after}</td>
                      <td className="text-slate-300 py-3">{m.reason}</td>
                      <td className="font-mono text-[10px] text-slate-500 py-3">
                        {new Date(m.created_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>
      </div>
    );
  }
  ```

- [ ] **Step 2: Run production build check to verify compile success**
  Run: `npm run build`
  Expected: Compiled successfully with 0 errors.
