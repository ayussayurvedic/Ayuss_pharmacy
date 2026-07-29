'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { AdminCard, AdminStatusBadge, AdminSkeleton } from '@/components/admin/AdminPrimitives';
import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog';
import { ChevronLeft, Building2, User, Phone, Mail, MapPin, CheckSquare } from 'lucide-react';

export default function AdminDistributorsDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLeadDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('distributor_applications')
        .select('*')
        .eq('id', id)
        .single();

      if (dbError) throw dbError;
      setLead(data);
      setSelectedStatus(data.status);
    } catch (err: any) {
      console.error('Failed to query B2B details:', err);
      setError('Distributor application not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadDetail();
  }, [id]);

  const handleStatusChangeAttempt = (status: string) => {
    setPendingStatus(status);
    setIsConfirmOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!id || !pendingStatus || !lead) return;
    setIsSubmitting(true);
    try {
      const { error: dbError } = await supabase
        .from('distributor_applications')
        .update({ status: pendingStatus })
        .eq('id', id);

      if (dbError) throw dbError;

      setLead((prev: any) => prev ? { ...prev, status: pendingStatus } : null);
      setSelectedStatus(pendingStatus);
      toast.success(`Distributor application status updated to ${pendingStatus.toUpperCase()}.`);
    } catch (err: any) {
      console.error('Status update error:', err);
      toast.error('Failed to write updates to Supabase.');
    } finally {
      setIsConfirmOpen(false);
      setPendingStatus('');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5 py-6">
        <AdminSkeleton type="card" />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="text-center py-12 text-slate-200">
        <Building2 className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-100">Operational Failure</h2>
        <p className="text-xs text-slate-500 mt-1.5">{error}</p>
        <Link href="/admin/distributors" className="admin-btn-primary mt-5 inline-block">
          Back to Distributors List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-700">
      <div className="flex items-center justify-between border-b border-[#C9D5D5]/60 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/distributors" className="inline-flex items-center justify-center w-9 h-9 bg-white border border-[#C9D5D5] hover:bg-slate-50 text-[#1A5C5E] rounded-xl transition-all cursor-pointer shadow-xs" aria-label="Back to distributor list">
            <ChevronLeft size={16} />
          </Link>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Distributor Application</span>
            <h2 className="text-xl font-bold text-[#134547]">{lead.company_name}</h2>
          </div>
        </div>
        <span className="font-mono text-xs text-slate-400">ID: {lead.id}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <AdminCard className="space-y-4 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#C9D5D5]/40 pb-2">
              <Building2 className="w-4 h-4 text-[#1A5C5E]" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A5C5E]">Business Profile</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold block mb-0.5">Company / Business Name</span>
                <span className="font-bold text-slate-800">{lead.company_name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-0.5">GSTIN Registration</span>
                <span className="font-mono text-slate-800 font-bold">{lead.gstin || 'Not Provided'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-0.5">Expected Monthly Volume</span>
                <span className="font-bold text-slate-800">{lead.expected_monthly_volume || 'Not Specified'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-0.5">Submission Date</span>
                <span className="font-mono text-slate-500 font-bold">{new Date(lead.created_at).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
          </AdminCard>

          <AdminCard className="space-y-4 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#C9D5D5]/40 pb-2">
              <Building2 className="w-4 h-4 text-[#1A5C5E]" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A5C5E]">Application Notes / Experience</h3>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-semibold bg-[#FDF8F0] border border-[#C9D5D5]/60 rounded-xl p-4 whitespace-pre-wrap margin-0">
              {lead.notes || 'No notes submitted.'}
            </p>
          </AdminCard>
        </div>

        {/* Contact Person & Status Manager */}
        <div className="space-y-6">
          <AdminCard className="space-y-4 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#C9D5D5]/40 pb-2">
              <User className="w-4 h-4 text-[#1A5C5E]" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A5C5E]">Contact Person</h3>
            </div>
            <div className="space-y-3.5 text-xs font-semibold">
              <div className="flex items-center gap-2.5">
                <User size={16} className="text-[#C9943E] shrink-0" />
                <span className="text-slate-850">{lead.contact_person}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="text-[#C9943E] shrink-0" />
                <a href={`mailto:${lead.email}`} className="text-[#1A5C5E] font-mono hover:underline truncate block">
                  {lead.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="text-[#C9943E] shrink-0" />
                <a href={`tel:${lead.phone}`} className="text-[#1A5C5E] font-mono hover:underline block">
                  {lead.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin size={16} className="text-[#C9943E] shrink-0" />
                <span className="text-slate-500">{lead.city}, {lead.state}</span>
              </div>
            </div>
          </AdminCard>

          <AdminCard className="space-y-4 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#C9D5D5]/40 pb-2">
              <CheckSquare className="w-4 h-4 text-[#1A5C5E]" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A5C5E]">Workflow Action</h3>
            </div>
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1.5">Current Application Status</span>
                <AdminStatusBadge status={lead.status} />
              </div>

              <div className="pt-3 border-t border-[#C9D5D5]/40">
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-2.5">Update Application Status:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={selectedStatus === 'under_review'}
                    onClick={() => handleStatusChangeAttempt('under_review')}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer text-center"
                  >
                    Under Review
                  </button>
                  <button
                    type="button"
                    disabled={selectedStatus === 'contacted'}
                    onClick={() => handleStatusChangeAttempt('contacted')}
                    className="px-3 py-2 bg-[#C9943E]/10 hover:bg-[#C9943E]/20 disabled:opacity-50 text-[#C9943E] rounded-lg text-[10px] font-bold transition-all cursor-pointer text-center"
                  >
                    Contacted
                  </button>
                  <button
                    type="button"
                    disabled={selectedStatus === 'approved'}
                    onClick={() => handleStatusChangeAttempt('approved')}
                    className="px-3 py-2 bg-[#1A5C5E] hover:bg-[#134547] disabled:opacity-50 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer text-center"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={selectedStatus === 'rejected'}
                    onClick={() => handleStatusChangeAttempt('rejected')}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-650 rounded-lg text-[10px] font-bold transition-all cursor-pointer text-center"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </AdminCard>
        </div>
      </div>

      <AdminConfirmDialog
        isOpen={isConfirmOpen}
        title="Update Distributor Application Status?"
        message={`Are you sure you want to write these modifications to: ${pendingStatus.toUpperCase()}?`}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
