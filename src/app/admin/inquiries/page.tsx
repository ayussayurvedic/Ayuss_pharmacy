import InquiryTable from '@/components/admin/InquiryTable';
import { getAdminInquiries, updateInquiryStatus, deleteInquiry } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminAppInquiriesPage() {
  const inquiries = await getAdminInquiries();

  // Filter out test inquiries containing test keywords
  const filteredInquiries = (inquiries || []).filter((inq: any) => {
    const isTest = 
      inq.name?.toLowerCase().includes('test') ||
      inq.email?.toLowerCase().includes('test') ||
      inq.company?.toLowerCase().includes('test') ||
      inq.email?.toLowerCase() === 'admin@globalps.com';
    return !isTest;
  });

  // Map database fields to component expectations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedInquiries = filteredInquiries.map((inq: any) => ({
    id: inq.id,
    name: inq.name,
    email: inq.email,
    company: inq.company || '',
    phone: inq.phone || '',
    requirement: inq.message,
    status: inq.status,
    created_at: inq.created_at,
  }));

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="bg-[#134547] text-white p-6 rounded-2xl border border-[#1A5C5E] shadow-md">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#C9943E] uppercase tracking-wider block">CRM Inbox</span>
          <h1 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-wide">Customer Inquiries</h1>
          <p className="text-slate-300 text-xs font-light">Evaluate wholesale enquiries, general feedback, and partner requests</p>
        </div>
      </div>
      <InquiryTable 
        inquiries={formattedInquiries} 
        updateStatus={updateInquiryStatus} 
        deleteInquiry={deleteInquiry}
      />
    </div>
  );
}
