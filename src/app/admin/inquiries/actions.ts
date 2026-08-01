'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';
import { getSession, verifyActiveAdmin } from '@/lib/auth';
import { logAuditAction } from '@/lib/audit';

export async function getAdminInquiries(limit = 200, offset = 0) {
  const session = await getSession();
  if (!session || session.role !== 'admin' || !session.id) throw new Error('Unauthorized');
  await verifyActiveAdmin(session.id);

  // 1. Fetch from 'inquiries' table
  const { data: tableInquiries, error: inqErr } = await supabaseAdmin
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (inqErr) {
    console.error('Error fetching inquiries table:', inqErr);
  }

  // 2. Fetch from 'distributor_applications' table where company_name represents an inquiry
  const { data: distApplications, error: distErr } = await supabaseAdmin
    .from('distributor_applications')
    .select('*')
    .or('company_name.ilike.Enquiry:%,company_name.ilike.Contact Inquiry:%,company_name.eq.General Contact Enquiry')
    .order('created_at', { ascending: false });

  if (distErr) {
    console.error('Error fetching distributor enquiries:', distErr);
  }

  // 3. Normalize inquiries table records
  const normalizedInquiries = (tableInquiries || []).map((inq: any) => ({
    id: inq.id,
    source_table: 'inquiries',
    name: inq.name || 'Anonymous Customer',
    email: inq.email || '',
    company: inq.company || '',
    phone: inq.phone || '',
    message: inq.message || inq.requirement || '',
    status: inq.status || 'new',
    created_at: inq.created_at || new Date().toISOString()
  }));

  // 4. Normalize distributor_applications inquiry records
  const normalizedDistributorEnquiries = (distApplications || []).map((app: any) => ({
    id: app.id,
    source_table: 'distributor_applications',
    name: app.contact_person || app.company_name?.replace(/^(Enquiry:\s*|Contact Inquiry:\s*)/i, '') || 'Anonymous Contact',
    email: app.email || '',
    company: app.company_name || 'Contact Inquiry',
    phone: app.phone || '',
    message: app.notes || app.requirement || '',
    status: app.status || 'new',
    created_at: app.created_at || new Date().toISOString()
  }));

  // 5. Combine and deduplicate
  const combined = [...normalizedInquiries, ...normalizedDistributorEnquiries];
  
  // Deduplicate by ID
  const seenIds = new Set();
  const uniqueInquiries = combined.filter(item => {
    if (seenIds.has(item.id)) return false;
    seenIds.add(item.id);
    return true;
  });

  // Sort chronologically (newest first)
  uniqueInquiries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return uniqueInquiries.slice(offset, offset + limit);
}

export async function updateInquiryStatus(id: string, status: string) {
  const session = await getSession();
  if (!session || session.role !== 'admin') throw new Error('Unauthorized');
  await verifyActiveAdmin(session.id);

  const VALID_STATUSES = ['new', 'contacted', 'qualified', 'closed', 'under_review', 'approved', 'rejected'];
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  // Update in inquiries table
  const { error: inqErr } = await supabaseAdmin
    .from('inquiries')
    .update({ status })
    .eq('id', id);

  // Update in distributor_applications table
  const { error: distErr } = await supabaseAdmin
    .from('distributor_applications')
    .update({ status })
    .eq('id', id);

  if (inqErr && distErr) {
    console.error('Error updating inquiry status across tables:', { inqErr, distErr });
    throw new Error('Failed to update status');
  }

  revalidatePath('/admin/inquiries');
  revalidatePath('/admin/dashboard');
}

export async function deleteInquiry(id: string) {
  const session = await getSession();
  if (!session || session.role !== 'admin') throw new Error('Unauthorized');
  await verifyActiveAdmin(session.id);

  await supabaseAdmin
    .from('inquiries')
    .delete()
    .eq('id', id);

  await supabaseAdmin
    .from('distributor_applications')
    .delete()
    .eq('id', id);

  revalidatePath('/admin/inquiries');
  revalidatePath('/admin/dashboard');
}
