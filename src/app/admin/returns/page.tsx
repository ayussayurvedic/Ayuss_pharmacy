'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
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

export default function AdminReturns() {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [returnsList, setReturnsList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const fetchReturns = async () => {
    setLoading(true);
    try {
      let { data, error } = await supabase
        .from('returns')
        .select('*, orders(order_number, customer_name, customer_phone, total_amount), return_items(*)')
        .order('requested_at', { ascending: false });

      if (error) {
        console.warn('Full relational return query failed, trying basic query:', error.message);
        const { data: basicData, error: basicErr } = await supabase
          .from('returns')
          .select('*')
          .order('requested_at', { ascending: false });

        if (basicErr) throw basicErr;
        data = basicData as any[];
      }

      setReturnsList(data || []);
    } catch (err: any) {
      console.warn('Fetch returns notice:', err?.message);
      setReturnsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const filteredReturns = returnsList.filter(r => {
    const returnNo = r.return_number || '';
    const orderNo = r.orders?.order_number || '';
    const custName = r.orders?.customer_name || '';

    const matchesSearch = returnNo.toLowerCase().includes(search.toLowerCase()) ||
                          orderNo.toLowerCase().includes(search.toLowerCase()) ||
                          custName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalRecords = filteredReturns.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const paginatedReturns = filteredReturns.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalRequests = returnsList.length;
  const pendingReview = returnsList.filter(r => r.status === 'requested' || r.status === 'under_review').length;
  const inTransit = returnsList.filter(r => r.status === 'pickup_scheduled' || r.status === 'in_transit' || r.status === 'received').length;
  const awaitingInspection = returnsList.filter(r => r.status === 'inspection').length;

  const filterOptions = [
    { label: 'All Return Statuses', value: 'ALL' },
    { label: 'Requested (New)', value: 'requested' },
    { label: 'Under Review', value: 'under_review' },
    { label: 'Approved', value: 'approved' },
    { label: 'Pickup Scheduled', value: 'pickup_scheduled' },
    { label: 'In Reverse Transit', value: 'in_transit' },
    { label: 'Received at Warehouse', value: 'received' },
    { label: 'Under Inspection', value: 'inspection' },
    { label: 'Completed & Refunded', value: 'completed' },
    { label: 'Rejected', value: 'rejected' }
  ];

  const columns = [
    { 
      header: 'Return #', 
      render: (r: any) => <span className="font-mono font-bold text-[#C9943E]">{r.return_number}</span> 
    },
    { 
      header: 'Order Details', 
      render: (r: any) => (
        <div>
          <span className="font-bold text-[#1A5C5E] block text-xs">{r.orders?.customer_name}</span>
          <span className="text-[10px] font-mono text-slate-500">Order: #{r.orders?.order_number}</span>
        </div>
      ) 
    },
    { 
      header: 'Reason', 
      render: (r: any) => <span className="text-xs text-slate-700 font-semibold">{r.reason_code?.replace('_', ' ')}</span> 
    },
    { 
      header: 'Items', 
      render: (r: any) => <span className="font-mono text-xs text-slate-500 font-bold">{r.return_items?.length || 0} Item(s)</span> 
    },
    { 
      header: 'Status', 
      render: (r: any) => <AdminStatusBadge status={r.status} /> 
    },
    { 
      header: 'Requested At', 
      render: (r: any) => <span className="font-mono text-xs text-slate-500 font-semibold">{new Date(r.requested_at).toLocaleDateString('en-IN')}</span> 
    },
    { 
      header: 'Action', 
      render: (r: any) => (
        <button
          type="button"
          onClick={() => router.push(`/admin/returns/${r.id}`)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1A5C5E]/10 hover:bg-[#1A5C5E]/20 text-[#1A5C5E] rounded-lg text-[10px] font-bold transition-all cursor-pointer"
          aria-label={`Review return ${r.return_number}`}
        >
          <Eye size={12} />
          <span>Review</span>
        </button>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-700">
      <div className="bg-[#134547] text-white p-6 rounded-2xl border border-[#1A5C5E] shadow-md">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#C9943E] uppercase tracking-wider block">Reverse Logistics & Returns Workspace</span>
          <h1 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-wide">Customer Returns</h1>
          <p className="text-slate-300 text-xs font-light">Manage merchandise return requests, warehouse inspections, COD payouts, and credit notes</p>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#C9D5D5]/60 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Return Requests</span>
          <span className="text-2xl font-bold font-mono text-[#134547]">{totalRequests}</span>
        </div>
        <div className="bg-white border border-[#C9D5D5]/60 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Awaiting Review</span>
          <span className="text-2xl font-bold font-mono text-[#C9943E]">{pendingReview}</span>
        </div>
        <div className="bg-white border border-[#C9D5D5]/60 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">In Reverse Transit</span>
          <span className="text-2xl font-bold font-mono text-[#1A5C5E]">{inTransit}</span>
        </div>
        <div className="bg-white border border-[#C9D5D5]/60 p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Awaiting Inspection</span>
          <span className="text-2xl font-bold font-mono text-indigo-700">{awaitingInspection}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <AdminCard>
        <AdminFilterBar
          searchQuery={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search Return #, Order #, or Customer Name..."
          selectedFilter={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={filterOptions}
          filterLabel="Status"
        />
      </AdminCard>

      {loading ? (
        <AdminSkeleton type="table" rows={5} />
      ) : totalRecords === 0 ? (
        <AdminEmptyState
          title="No Return Requests Found"
          description="No customer return requests match your search and filter parameters."
          actionLabel="View Active Orders"
          onActionClick={() => router.push('/admin/orders')}
        />
      ) : (
        <div className="space-y-4">
          <div className="hidden md:block">
            <AdminCard className="p-0 overflow-hidden">
              <AdminDataTable
                columns={columns}
                data={paginatedReturns}
                keyExtractor={(r) => r.id}
                onRowClick={(r) => router.push(`/admin/returns/${r.id}`)}
              />
            </AdminCard>
          </div>

          <div className="md:hidden space-y-3">
            {paginatedReturns.map((r) => (
              <AdminMobileRecord
                key={r.id}
                title={r.return_number}
                subtitle={r.orders?.customer_name}
                meta={`Order: #${r.orders?.order_number} · ${r.return_items?.length || 0} items`}
                badge={<AdminStatusBadge status={r.status} />}
                actionUrl={`/admin/returns/${r.id}`}
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
