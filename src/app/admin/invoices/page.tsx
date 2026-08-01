'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import { Download, RefreshCw, FileText, ArrowRight } from 'lucide-react';

export default function AdminInvoices() {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<'invoices' | 'gst'>('invoices');
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [gstRows, setGstRows] = useState<any[]>([]);
  
  // Invoices filtering
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [pdfFilter, setPdfFilter] = useState('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Invoices pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Invoices table fetch notice:', error.message);
        setInvoices([]);
      } else {
        setInvoices(data || []);
      }

      try {
        const { data: gstData, error: gstErr } = await supabase
          .from('vw_gst_r1_prep_report')
          .select('*')
          .order('report_month', { ascending: false });
        
        if (!gstErr) {
          setGstRows(gstData || []);
        }
      } catch (gstCatch) {
        console.warn('GST report view notice:', gstCatch);
      }
    } catch (err: any) {
      console.warn('Fetch invoices notice:', err?.message);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleRetryPdf = async (invoiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSubmitting(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('generate-invoice-pdf', {
        body: { invoice_id: invoiceId }
      });

      if (fnErr || data?.error) throw new Error(fnErr?.message || data?.error || 'PDF generation failed');

      toast.success('Invoice PDF regenerated successfully.');
      await fetchInvoices();
    } catch (err: any) {
      console.error('Regenerate PDF error:', err);
      toast.error(err.message || 'Failed to regenerate invoice PDF.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdf = async (inv: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inv.pdf_storage_path) {
      toast.error('PDF storage path not available. Regenerate PDF first.');
      return;
    }

    try {
      const { data, error } = await supabase.storage.from('invoices').createSignedUrl(inv.pdf_storage_path, 60);
      if (error || !data?.signedUrl) throw new Error(error?.message || 'Failed to create signed URL');

      window.open(data.signedUrl, '_blank');
    } catch (err: any) {
      console.error('Signed URL error:', err);
      toast.error('Failed to download invoice PDF.');
    }
  };

  const handleExportGSTR1 = async () => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('export_report_dataset', {
        p_report_type: 'gstr1_b2c',
        p_format: 'csv'
      });

      if (error || !data?.success) throw new Error(error?.message || 'Export failed');

      toast.success(`GSTR-1 report export queued. Export ID: #${data.export_id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to export GSTR-1 report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
                          inv.customer_name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || inv.invoice_type === typeFilter;
    const matchesPdf = pdfFilter === 'ALL' || inv.pdf_status === pdfFilter;
    return matchesSearch && matchesType && matchesPdf;
  });

  const totalRecords = filteredInvoices.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, pdfFilter]);

  const totalTaxable = invoices.reduce((acc, i) => acc + (i.taxable_value || 0), 0);
  const totalGrand = invoices.reduce((acc, i) => acc + (i.grand_total || 0), 0);

  const filterOptions = [
    { label: 'All Document Types', value: 'ALL' },
    { label: 'Tax Invoices', value: 'TAX_INVOICE' },
    { label: 'Bills of Supply', value: 'BILL_OF_SUPPLY' }
  ];

  const invoiceColumns = [
    { 
      header: 'Invoice #', 
      render: (inv: any) => <span className="font-mono font-bold text-[#C9943E]">{inv.invoice_number}</span> 
    },
    { 
      header: 'Doc Type', 
      render: (inv: any) => <AdminStatusBadge status={inv.invoice_type.toLowerCase()} /> 
    },
    { 
      header: 'Customer Info', 
      render: (inv: any) => (
        <div>
          <span className="font-bold text-[#1A5C5E] block text-xs">{inv.customer_name}</span>
          {inv.customer_gstin && <span className="text-[10px] font-mono text-slate-500">GSTIN: {inv.customer_gstin}</span>}
        </div>
      ) 
    },
    { 
      header: 'FY', 
      render: (inv: any) => <span className="font-mono text-xs text-slate-500">{inv.financial_year}</span> 
    },
    { 
      header: 'Taxable Value', 
      render: (inv: any) => <span className="font-mono text-xs font-semibold text-slate-700">₹{inv.taxable_value?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>,
      className: 'text-right'
    },
    { 
      header: 'Grand Total', 
      render: (inv: any) => <span className="font-mono text-xs font-bold text-[#1A5C5E]">₹{inv.grand_total?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>,
      className: 'text-right'
    },
    { 
      header: 'Actions', 
      render: (inv: any) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/admin/invoices/${inv.order_id || inv.id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#054432] hover:bg-[#032e22] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <FileText size={12} />
            <span>Print Invoice</span>
          </Link>
          {inv.pdf_status === 'generated' && (
            <button
              type="button"
              onClick={(e) => handleDownloadPdf(inv, e)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1A5C5E] hover:bg-[#134547] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Download size={12} />
              <span>PDF</span>
            </button>
          )}
          {(inv.pdf_status === 'failed' || inv.pdf_status === 'pending') && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={(e) => handleRetryPdf(inv.id, e)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#C9943E] hover:bg-[#b78332] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={12} />
              <span>Regen</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => router.push(`/admin/orders/${inv.order_id}`)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#1A5C5E] rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <span>Order</span>
            <ArrowRight size={12} />
          </button>
        </div>
      ),
      className: 'text-right'
    }
  ];

  const gstColumns = [
    { 
      header: 'Month', 
      render: (r: any) => <span className="font-mono text-xs font-bold text-[#C9943E]">{r.report_month}</span> 
    },
    { 
      header: 'POS State', 
      render: (r: any) => <span className="font-bold text-xs text-[#1A5C5E]">{r.place_of_supply}</span> 
    },
    { 
      header: 'HSN Code', 
      render: (r: any) => <span className="font-mono text-xs text-slate-500">{r.hsn_code}</span> 
    },
    { 
      header: 'Rate', 
      render: (r: any) => <span className="font-mono text-xs text-slate-500">{r.gst_rate}%</span> 
    },
    { 
      header: 'Qty', 
      render: (r: any) => <span className="font-mono text-xs text-slate-700">{r.total_quantity}</span>,
      className: 'text-right'
    },
    { 
      header: 'Taxable Value', 
      render: (r: any) => <span className="font-mono text-xs font-semibold text-slate-700">₹{r.total_taxable_value?.toLocaleString('en-IN')}</span>,
      className: 'text-right'
    },
    { 
      header: 'CGST', 
      render: (r: any) => <span className="font-mono text-xs text-slate-500">₹{r.total_cgst?.toLocaleString('en-IN')}</span>,
      className: 'text-right'
    },
    { 
      header: 'SGST', 
      render: (r: any) => <span className="font-mono text-xs text-slate-500">₹{r.total_sgst?.toLocaleString('en-IN')}</span>,
      className: 'text-right'
    },
    { 
      header: 'IGST', 
      render: (r: any) => <span className="font-mono text-xs text-slate-500">₹{r.total_igst?.toLocaleString('en-IN')}</span>,
      className: 'text-right'
    },
    { 
      header: 'Invoice Total', 
      render: (r: any) => <span className="font-mono text-xs font-bold text-[#1A5C5E]">₹{r.total_invoice_value?.toLocaleString('en-IN')}</span>,
      className: 'text-right'
    }
  ];

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="bg-[#134547] text-white p-6 rounded-2xl border border-[#1A5C5E] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#C9943E] uppercase tracking-wider block">Financial Administration & Tax Records</span>
          <h1 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-wide">Billing & GST Compliance</h1>
          <p className="text-slate-300 text-xs font-light">Authoritative tax invoices, bills of supply, and GST state-wise ledgers</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'invoices' 
                ? 'bg-[#C9943E] text-white shadow-xs' 
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            Invoices
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gst')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'gst' 
                ? 'bg-[#C9943E] text-white shadow-xs' 
                : 'bg-white/10 text-slate-200 hover:bg-white/20'
            }`}
          >
            GSTR-1 Report
          </button>
        </div>
      </div>

      {activeTab === 'invoices' ? (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-[#C9D5D5]/60 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Invoices</span>
              <span className="text-xl font-bold font-mono text-[#1A5C5E]">{invoices.length}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#C9D5D5]/60 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Taxable Value</span>
              <span className="text-xl font-bold font-mono text-[#1A5C5E]">₹{totalTaxable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#C9D5D5]/60 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Billing Value</span>
              <span className="text-xl font-bold font-mono text-[#1A5C5E]">₹{totalGrand.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          {/* Filter bar */}
          <AdminCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-2">
                <AdminFilterBar
                  searchQuery={search}
                  onSearchChange={setSearch}
                  searchPlaceholder="Search Invoice # or Customer Name..."
                  selectedFilter={typeFilter}
                  onFilterChange={setTypeFilter}
                  filterOptions={filterOptions}
                  filterLabel="Type"
                />
              </div>
              <div className="flex items-center gap-2 justify-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase">PDF Status:</span>
                <select
                  value={pdfFilter}
                  onChange={(e) => setPdfFilter(e.target.value)}
                  className="py-2 px-3 text-xs font-bold rounded-xl border border-[#C9D5D5] bg-white text-[#1A5C5E] focus:outline-none cursor-pointer shadow-xs"
                >
                  <option value="ALL">All PDF Statuses</option>
                  <option value="generated">Generated</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </AdminCard>

          {/* List */}
          {loading ? (
            <AdminSkeleton type="table" rows={5} />
          ) : totalRecords === 0 ? (
            <AdminEmptyState
              title="No Invoices Issued"
              description="Tax invoices will populate once customer orders are shipped."
              actionLabel="View Active Orders"
              onActionClick={() => router.push('/admin/orders')}
            />
          ) : (
            <div className="space-y-4">
              <div className="hidden md:block">
                <AdminCard className="p-0 overflow-hidden">
                  <AdminDataTable
                    columns={invoiceColumns}
                    data={paginatedInvoices}
                    keyExtractor={(inv) => inv.id}
                  />
                </AdminCard>
              </div>

              <div className="md:hidden space-y-3">
                {paginatedInvoices.map((inv) => (
                  <AdminMobileRecord
                    key={inv.id}
                    title={inv.invoice_number}
                    subtitle={inv.customer_name}
                    meta={`FY: ${inv.financial_year} · Taxable: ₹${inv.taxable_value?.toLocaleString('en-IN')}`}
                    badge={<AdminStatusBadge status={inv.pdf_status} />}
                    actionUrl={`/admin/orders/${inv.order_id}`}
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
        </>
      ) : (
        <>
          {/* GST Tab */}
          <div className="flex justify-between items-center bg-white border border-[#C9D5D5]/60 p-5 rounded-2xl shadow-xs">
            <div>
              <h3 className="font-bold text-sm text-[#1A5C5E]">GSTR-1 Preparation Summary</h3>
              <p className="text-xs text-slate-500 m-0">Review state-wise place of supply sales summaries for monthly tax compliance</p>
            </div>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleExportGSTR1}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1A5C5E] hover:bg-[#134547] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Download size={16} />
              <span>Export GSTR-1 CSV</span>
            </button>
          </div>

          {loading ? (
            <AdminSkeleton type="table" rows={5} />
          ) : gstRows.length === 0 ? (
            <AdminEmptyState
              title="No GST Summary Records"
              description="Issued GST tax invoices will populate state-wise tax data automatically."
            />
          ) : (
            <AdminCard className="p-0 overflow-hidden">
              <AdminDataTable
                columns={gstColumns}
                data={gstRows}
                keyExtractor={(r) => `${r.report_month}-${r.hsn_code}-${r.place_of_supply}`}
              />
            </AdminCard>
          )}
        </>
      )}
    </div>
  );
}
