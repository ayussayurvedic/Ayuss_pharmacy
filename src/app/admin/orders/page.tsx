'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { 
  AdminCard, 
  AdminStatusBadge, 
  AdminDataTable, 
  AdminMobileRecord, 
  AdminFilterBar, 
  AdminPagination, 
  AdminSkeleton, 
  AdminEmptyState 
} from '@/components/admin/AdminPrimitives';
import { Eye } from 'lucide-react';

export default function AdminOrders() {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;
      setOrders(data || []);
    } catch (err: any) {
      console.error('Error loading orders:', err);
      setError('Unable to retrieve purchase orders.');
      toast.error('Error syncing orders list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter logic with debounced search query
  const filteredOrders = orders.filter((o) => {
    const orderNo = o.order_number || '';
    const custName = o.customer_name || '';
    const custPhone = o.customer_phone || '';
    
    const matchesSearch = 
      orderNo.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      custName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      custPhone.includes(debouncedSearch);

    const matchesStatus = statusFilter === 'all' || o.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalRecords = filteredOrders.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const filterOptions = [
    { label: 'All Statuses', value: 'all' },
    { label: 'New', value: 'new' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Processing', value: 'processing' },
    { label: 'Packed', value: 'packed' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Out for Delivery', value: 'out_for_delivery' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  // Quick category summary counts
  const counts = {
    all: orders.length,
    new: orders.filter(o => o.order_status === 'new').length,
    confirmed: orders.filter(o => o.order_status === 'confirmed').length,
    processing: orders.filter(o => o.order_status === 'processing').length,
    shipped: orders.filter(o => o.order_status === 'shipped').length,
    delivered: orders.filter(o => o.order_status === 'delivered').length,
    cancelled: orders.filter(o => o.order_status === 'cancelled').length
  };

  const columns = [
    { 
      header: 'Order #', 
      sortable: true,
      sortKey: 'order_number' as keyof any,
      render: (o: any) => <span className="font-mono font-bold text-[#C9943E]">{o.order_number}</span> 
    },
    { 
      header: 'Customer', 
      sortable: true,
      sortKey: 'customer_name' as keyof any,
      render: (o: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-[#1A5C5E]">{o.customer_name}</span>
          <span className="text-[10px] text-slate-500 font-mono">{o.customer_phone}</span>
        </div>
      ) 
    },
    { 
      header: 'Date', 
      sortable: true,
      sortKey: 'created_at' as keyof any,
      render: (o: any) => (
        <span className="text-xs text-slate-500 font-medium">
          {new Date(o.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ) 
    },
    { 
      header: 'Payment', 
      sortable: true,
      sortKey: 'payment_status' as keyof any,
      render: (o: any) => (
        <div className="flex flex-col items-start gap-1">
          <span className="uppercase text-[10px] font-bold text-slate-400">
            {(o.payment_method || 'cod').replace('online_razorpay', 'razorpay')}
          </span>
          <AdminStatusBadge status={o.payment_status} />
        </div>
      ) 
    },
    { 
      header: 'Fulfillment Status', 
      sortable: true,
      sortKey: 'order_status' as keyof any,
      render: (o: any) => <AdminStatusBadge status={o.order_status} /> 
    },
    { 
      header: 'Total', 
      sortable: true,
      sortKey: ((o: any) => Number(o.total_amount) || 0),
      render: (o: any) => <span className="font-mono font-bold text-[#1A5C5E]">₹{o.total_amount?.toLocaleString('en-IN')}</span> 
    },
    { 
      header: 'Action', 
      render: (o: any) => (
        <button 
          type="button" 
          onClick={() => router.push(`/admin/orders/${o.id}`)}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1A5C5E] hover:bg-[#134547] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
          aria-label={`View details for order ${o.order_number}`}
        >
          <Eye size={14} />
          <span>View</span>
        </button>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-[#134547] text-white p-6 rounded-2xl border border-[#1A5C5E] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#C9943E] uppercase tracking-wider block">Order Management Workspace</span>
            <h1 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-wide">Customer Orders</h1>
            <p className="text-slate-300 text-xs font-light">Review, process, and update customer order lifecycles</p>
          </div>
          
          <button
            type="button"
            onClick={() => window.open('/api/admin/orders/export', '_blank')}
            className="self-start md:self-auto px-4 py-2 bg-[#C9943E] hover:bg-[#b08130] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer uppercase tracking-wider"
          >
            Export Orders CSV
          </button>
        </div>

        {/* Category Summary Count Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'all' 
                ? 'bg-[#C9943E] text-white shadow-xs' 
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('new')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'new' 
                ? 'bg-[#C9943E] text-white shadow-xs' 
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            New ({counts.new})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('confirmed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'confirmed' 
                ? 'bg-[#C9943E] text-white shadow-xs' 
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            Confirmed ({counts.confirmed})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('shipped')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'shipped' 
                ? 'bg-[#C9943E] text-white shadow-xs' 
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            Shipped ({counts.shipped})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('delivered')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'delivered' 
                ? 'bg-[#C9943E] text-white shadow-xs' 
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            Delivered ({counts.delivered})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'cancelled' 
                ? 'bg-[#C9943E] text-white shadow-xs' 
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            Cancelled ({counts.cancelled})
          </button>
        </div>
      </div>

      <AdminCard>
        <AdminFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search Order #, Customer Name, or Phone..."
          selectedFilter={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={filterOptions}
          filterLabel="Status"
        />
      </AdminCard>

      {loading ? (
        <AdminSkeleton type="table" rows={5} />
      ) : error ? (
        <div className="text-red-500 text-xs py-4">{error}</div>
      ) : paginatedOrders.length === 0 ? (
        <AdminEmptyState
          title="No Purchase Orders Found"
          description="No customer purchase orders match your search and filter criteria."
        />
      ) : (
        <div className="space-y-4">
          <div className="hidden md:block">
            <AdminCard className="p-0 overflow-hidden">
              <AdminDataTable
                columns={columns}
                data={paginatedOrders}
                keyExtractor={(o) => o.id}
                onRowClick={(o) => router.push(`/admin/orders/${o.id}`)}
              />
            </AdminCard>
          </div>

          <div className="md:hidden space-y-3">
            {paginatedOrders.map((o) => (
              <AdminMobileRecord
                key={o.id}
                title={o.order_number}
                subtitle={o.customer_name}
                meta={`Amt: ₹${o.total_amount?.toLocaleString('en-IN')} · Pay: ${o.payment_status.toUpperCase()}`}
                badge={<AdminStatusBadge status={o.order_status} />}
                actionUrl={`/admin/orders/${o.id}`}
              />
            ))}
          </div>

          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalRecords}
            recordsPerPage={recordsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
