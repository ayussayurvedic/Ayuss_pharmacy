'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { 
  AdminCard, 
  AdminStatusBadge, 
  AdminInput, 
  AdminTextarea,
  AdminFilterBar, 
  AdminDataTable, 
  AdminMobileRecord,
  AdminEmptyState,
  AdminSkeleton 
} from '@/components/admin/AdminPrimitives';
import { RefreshCw, ArrowRight } from 'lucide-react';

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
  const [adjustDelta, setAdjustDelta] = useState<number>(0);
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
    setAdjustDelta(0);
    setAdjustReason('');
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (adjustDelta === 0) {
      toast.error('Quantity delta must be non-zero.');
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
        p_quantity_delta: adjustDelta,
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
      header: 'Product Name',
      render: (item: any) => (
        <div>
          <span className="font-bold text-[#1A5C5E] block text-xs">{item.products?.name || item.product_id}</span>
          <span className="text-[10px] text-slate-500 font-medium">{item.products?.category}</span>
        </div>
      )
    },
    {
      header: 'SKU',
      render: (item: any) => <span className="font-mono text-xs font-bold text-[#C9943E]">{item.sku || 'N/A'}</span>
    },
    {
      header: 'On Hand',
      render: (item: any) => <span className="font-mono font-semibold text-slate-700">{item.quantity_on_hand}</span>,
      className: 'text-right'
    },
    {
      header: 'Reserved',
      render: (item: any) => <span className="font-mono text-slate-400">{item.quantity_reserved}</span>,
      className: 'text-right'
    },
    {
      header: 'Available',
      render: (item: any) => {
        const available = item.quantity_on_hand - item.quantity_reserved;
        return <span className="font-mono font-bold text-[#1A5C5E]">{available}</span>;
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
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => handleOpenAdjustModal(item)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#C9943E] hover:bg-[#b78332] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw size={12} />
            <span>Adjust</span>
          </button>
          <button
            type="button"
            onClick={() => router.push(`/admin/inventory/${item.product_id}`)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#1A5C5E] rounded-lg text-xs font-bold transition-all cursor-pointer"
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
    <div className="space-y-6 pb-12 font-sans">
      <div className="bg-[#134547] text-white p-6 rounded-2xl border border-[#1A5C5E] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#C9943E] uppercase tracking-wider block">Inventory Management Workspace</span>
          <h1 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-wide">Stock Levels</h1>
          <p className="text-slate-300 text-xs font-light">Server-authoritative stock levels, reservations, and adjustment ledger</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-[#C9D5D5]/60 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Tracked SKUs</span>
          <span className="text-xl font-bold font-mono text-[#1A5C5E]">{totalSKUs}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#C9D5D5]/60 shadow-xs">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Low Stock Warnings</span>
          <span className="text-xl font-bold font-mono text-[#C9943E]">{lowStockCount}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs">
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Out of Stock Alert</span>
          <span className="text-xl font-bold font-mono text-rose-600">{outOfStockCount}</span>
        </div>
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
        <AdminEmptyState
          title="No Inventory Records Found"
          description="No inventory items match your search and filter criteria."
        />
      ) : (
        <div className="space-y-4">
          <div className="hidden md:block">
            <AdminCard className="p-0 overflow-hidden">
              <AdminDataTable
                columns={columns}
                data={filteredInventory}
                keyExtractor={(item: any) => item.product_id}
                onRowClick={(item: any) => router.push(`/admin/inventory/${item.product_id}`)}
              />
            </AdminCard>
          </div>

          <div className="md:hidden space-y-3">
            {filteredInventory.map((item) => {
              const available = item.quantity_on_hand - item.quantity_reserved;
              let status = 'in_stock';
              if (!item.inventory_enabled) status = 'disabled';
              else if (available <= 0) status = 'out_of_stock';
              else if (available <= item.reorder_level) status = 'low_stock';

              return (
                <AdminMobileRecord
                  key={item.product_id}
                  title={item.products?.name || item.product_id}
                  subtitle={`SKU: ${item.sku || 'N/A'}`}
                  meta={`Avail: ${available} · On Hand: ${item.quantity_on_hand} · Res: ${item.quantity_reserved}`}
                  badge={<AdminStatusBadge status={status} />}
                  actionUrl={`/admin/inventory/${item.product_id}`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {isAdjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#1e293b] rounded-xl max-w-md w-full p-5 border border-slate-800 space-y-3.5 shadow-xl text-xs text-slate-200">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="font-semibold text-sm text-slate-100">
                Adjust Stock: {selectedProduct.products?.name || selectedProduct.product_id}
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">Current Stock: {selectedProduct.quantity_on_hand}</span>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-3 text-xs">
              <AdminInput
                label="Quantity Delta (+ / -)"
                type="number"
                required
                placeholder="e.g. +10 or -5"
                value={adjustDelta}
                onChange={(e) => setAdjustDelta(Number(e.target.value))}
                className="font-mono text-slate-200 focus:outline-none"
                helperText="Use positive numbers to add stock, negative to reduce."
              />

              <AdminTextarea
                label="Adjustment Reason (Mandatory)"
                rows={2}
                required
                placeholder="State reason for stock adjustment..."
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="text-slate-200 focus:outline-none"
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="admin-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="admin-btn-primary"
                >
                  {isSubmitting ? 'Updating...' : 'Save Stock Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
