'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
          mrp: Number(dbP.mrp || staticP?.mrp || 0),
          sellingPrice: Number(dbP.selling_price || staticP?.sellingPrice || 0),
          packSize: dbP.pack_size || staticP?.packSize || '',
          isActive: dbP.is_active,
          composition: dbP.composition || staticP?.composition || '',
          benefits: dbP.benefits || staticP?.benefits || [],
          usage: dbP.usage || staticP?.usage || '',
          shelfLife: dbP.shelf_life || staticP?.shelfLife || '3 Years',
          safetyNote: dbP.safety_note || staticP?.safetyNote || 'Ayurvedic formulation',
          image: dbP.image || staticP?.image || '',
          transparentImage: dbP.transparent_image || staticP?.transparentImage || '',
          galleryImages: dbP.gallery_images || staticP?.galleryImages || []
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
          <Image 
            src={p.image || `/products/logo/logo.webp`}
            alt={p.name} 
            width={40}
            height={40}
            className="w-10 h-10 object-cover rounded-lg shrink-0 border border-[#C9D5D5]/60"
          />
          <div>
            <span className="font-bold block text-xs text-[#1A5C5E]">{p.name}</span>
            <span className="text-[10px] text-slate-500 font-mono">ID: {p.id}</span>
          </div>
        </div>
      )
    },
    { header: 'Category', render: (p: Product) => <span className="text-xs text-slate-700 font-medium">{p.category}</span> },
    { header: 'Pack Size', render: (p: Product) => <span className="font-mono text-xs text-slate-500 font-semibold">{p.packSize || '100g Jar'}</span> },
    { header: 'MRP Price', render: (p: Product) => <span className="font-mono font-bold text-[#1A5C5E]">{p.mrp ? `₹${p.mrp.toLocaleString('en-IN')}` : '₹249'}</span> },
    { header: 'Status', render: (p: Product) => <AdminStatusBadge status={p.isActive ? 'active' : 'archived'} /> },
    { 
      header: 'Actions', 
      render: (p: Product) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            type="button" 
            onClick={() => router.push(`/admin/products/${p.id}`)}
            disabled={isMutating}
            className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 hover:bg-slate-200 text-[#1A5C5E] rounded-lg transition-all cursor-pointer"
            title="Edit product formulation"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button 
            type="button" 
            onClick={(e) => handleActionClick('duplicate', p.id, e)}
            disabled={isMutating}
            className="inline-flex items-center justify-center w-8 h-8 bg-[#C9943E]/10 hover:bg-[#C9943E]/20 text-[#C9943E] rounded-lg transition-all cursor-pointer"
            title="Duplicate product"
          >
            <Copy className="w-4 h-4" />
          </button>
          {p.isActive && (
            <button 
              type="button" 
              onClick={(e) => handleActionClick('archive', p.id, e)}
              disabled={isMutating}
              className="inline-flex items-center justify-center w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all cursor-pointer"
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
    <div className="space-y-6 pb-12 font-sans">
      <div className="bg-[#134547] text-white p-6 rounded-2xl border border-[#1A5C5E] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#C9943E] uppercase tracking-wider block">Catalog Workspace</span>
          <h1 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-wide">Ayurvedic Catalogue</h1>
          <p className="text-slate-300 text-xs font-light">Manage licensed Ayurvedic formulations, packshots, and prices</p>
        </div>

        <Link href="/admin/products/new" className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C9943E] hover:bg-[#b78332] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer">
          <Plus size={16} />
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
        <div className="text-slate-500 text-center py-10 bg-white border border-[#C9D5D5]/60 rounded-2xl shadow-xs">No formulations found.</div>
      ) : (
        <div className="space-y-4">
          <AdminCard className="p-0 overflow-hidden">
            <AdminDataTable
              columns={columns}
              data={paginatedProducts}
              keyExtractor={(p) => p.id}
            />
          </AdminCard>
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            recordsPerPage={recordsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
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
