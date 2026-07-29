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

export default function AdminDistributors() {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('distributor_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;

      // Filter out inquiries from wholesale partner applications
      const list = (data || []).filter(item => 
        !item.company_name.startsWith('Enquiry:') && item.company_name !== 'General Contact Enquiry'
      );
      setLeads(list);
    } catch (err: any) {
      console.error('Failed to fetch B2B applications:', err);
      setError('Unable to retrieve distributor applications.');
      toast.error('Error syncing B2B leads list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredList = leads.filter((l) => {
    const matchesSearch = 
      l.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRecords = filteredList.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const paginatedList = filteredList.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const filterOptions = [
    { label: 'All Statuses', value: 'all' },
    { label: 'New / Unread', value: 'new' },
    { label: 'Under Review', value: 'under_review' },
    { label: 'Contacted', value: 'contacted' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' }
  ];

  const columns = [
    { 
      header: 'Company Name', 
      render: (l: any) => <span className="font-bold text-[#1A5C5E]">{l.company_name}</span> 
    },
    { 
      header: 'Contact Person', 
      render: (l: any) => <span className="text-slate-700 font-medium">{l.contact_person}</span> 
    },
    { 
      header: 'Phone Contact', 
      render: (l: any) => <span className="font-mono text-xs text-slate-500">{l.phone}</span> 
    },
    { 
      header: 'City', 
      render: (l: any) => <span className="text-xs text-slate-500">{l.city}</span> 
    },
    { 
      header: 'Expected Vol.', 
      render: (l: any) => <span className="font-bold text-xs text-[#C9943E]">{l.expected_monthly_volume || 'Not Specified'}</span> 
    },
    { 
      header: 'Received Date', 
      render: (l: any) => <span className="text-xs text-slate-500 font-mono">{new Date(l.created_at).toLocaleDateString('en-IN')}</span> 
    },
    { 
      header: 'Status', 
      render: (l: any) => <AdminStatusBadge status={l.status} /> 
    },
    {
      header: 'Actions',
      render: (l: any) => (
        <button
          type="button"
          onClick={() => router.push(`/admin/distributors/${l.id}`)}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1A5C5E] hover:bg-[#134547] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Eye size={14} />
          <span>View</span>
        </button>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="bg-[#134547] text-white p-6 rounded-2xl border border-[#1A5C5E] shadow-md">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#C9943E] uppercase tracking-wider block">B2B Channel Partners Workspace</span>
          <h1 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-wide">Wholesale Distributors</h1>
          <p className="text-slate-300 text-xs font-light">Evaluate applications and monitor B2B pipeline statuses</p>
        </div>
      </div>

      <AdminCard>
        <AdminFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search business name, contact person, city, or phone..."
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
          title="No Applications Found"
          description="No distributor application leads match your query."
        />
      ) : (
        <div className="space-y-4">
          <div className="hidden md:block">
            <AdminCard className="p-0 overflow-hidden">
              <AdminDataTable
                columns={columns}
                data={paginatedList}
                keyExtractor={(l) => l.id}
                onRowClick={(l) => router.push(`/admin/distributors/${l.id}`)}
              />
            </AdminCard>
          </div>

          <div className="md:hidden space-y-3">
            {paginatedList.map((l) => (
              <AdminMobileRecord
                key={l.id}
                title={l.company_name}
                subtitle={l.contact_person}
                meta={`${l.city} · Expected Vol: ${l.expected_monthly_volume || 'N/A'}`}
                badge={<AdminStatusBadge status={l.status} />}
                actionUrl={`/admin/distributors/${l.id}`}
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
