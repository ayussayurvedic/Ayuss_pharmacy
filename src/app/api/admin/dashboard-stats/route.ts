import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { apiSuccess, apiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || '30days';

    let dateString = '';
    const now = new Date();

    if (filter === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateString = today.toISOString();
    } else if (filter === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateString = sevenDaysAgo.toISOString();
    } else if (filter === '30days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateString = thirtyDaysAgo.toISOString();
    } else if (filter === 'this_month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateString = startOfMonth.toISOString();
    }

    // Query 1: Orders query
    let ordersQuery = supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (dateString) {
      ordersQuery = ordersQuery.gte('created_at', dateString);
    }

    const { data: ordersData, error: ordersError } = await ordersQuery;
    if (ordersError) throw ordersError;

    // Query 2: Applications/Leads query
    let leadsQuery = supabaseAdmin
      .from('distributor_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (dateString) {
      leadsQuery = leadsQuery.gte('created_at', dateString);
    }

    const { data: applicationData, error: applicationsError } = await leadsQuery;
    if (applicationsError) throw applicationsError;

    // Query 3: Inquiries table query
    let inqQuery = supabaseAdmin
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (dateString) {
      inqQuery = inqQuery.gte('created_at', dateString);
    }

    const { data: rawInquiriesData } = await inqQuery;

    const activeOrders = ordersData || [];
    const activeApplications = applicationData || [];
    const activeTableInquiries = rawInquiriesData || [];

    // Financial aggregates
    const paidOrders = activeOrders.filter((o) => o.payment_status === 'paid');
    const revenueVal = paidOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const averageValue = paidOrders.length > 0 ? Math.round(revenueVal / paidOrders.length) : 0;

    // Separate Enquiries vs. Distributor Leads across both tables
    const distEnquiries = activeApplications.filter(
      (a) => a.company_name?.startsWith('Enquiry:') || a.company_name?.startsWith('Contact Inquiry:') || a.company_name === 'General Contact Enquiry'
    );

    const normalizedTableInquiries = activeTableInquiries.map((inq) => ({
      id: inq.id,
      name: inq.name || 'Anonymous Customer',
      email: inq.email || '',
      phone: inq.phone || '',
      requirement: inq.message || inq.requirement || '',
      status: inq.status || 'new',
      created_at: inq.created_at
    }));

    const normalizedDistEnquiries = distEnquiries.map((app) => ({
      id: app.id,
      name: app.contact_person || app.company_name?.replace(/^(Enquiry:\s*|Contact Inquiry:\s*)/i, '') || 'Anonymous Contact',
      email: app.email || '',
      phone: app.phone || '',
      requirement: app.notes || app.requirement || '',
      status: app.status || 'new',
      created_at: app.created_at
    }));

    // Deduplicate combined enquiries
    const combinedEnquiriesMap = new Map();
    [...normalizedTableInquiries, ...normalizedDistEnquiries].forEach(item => {
      if (!combinedEnquiriesMap.has(item.id)) {
        combinedEnquiriesMap.set(item.id, item);
      }
    });

    const enquiries = Array.from(combinedEnquiriesMap.values());
    enquiries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const distributorLeads = activeApplications.filter(
      (a) => !a.company_name?.startsWith('Enquiry:') && !a.company_name?.startsWith('Contact Inquiry:') && a.company_name !== 'General Contact Enquiry'
    );

    // Operational attention counts
    const pendingOrdersCount = activeOrders.filter((o) => o.order_status === 'new').length;
    const confirmedOrdersCount = activeOrders.filter((o) => o.order_status === 'confirmed').length;
    const processingOrdersCount = activeOrders.filter((o) => o.order_status === 'processing').length;
    const shippedOrdersCount = activeOrders.filter((o) => o.order_status === 'shipped').length;

    const unreadEnquiriesCount = enquiries.filter((e) => e.status === 'new').length;
    const pendingDistributorsCount = distributorLeads.filter(
      (d) => d.status === 'new' || d.status === 'under_review'
    ).length;

    return apiSuccess(
      {
        stats: {
          revenue: revenueVal,
          ordersCount: activeOrders.length,
          aov: averageValue,
          enquiriesCount: enquiries.length,
          leadsCount: distributorLeads.length,
          attentionItems: {
            pendingOrders: pendingOrdersCount,
            confirmedOrders: confirmedOrdersCount,
            processingOrders: processingOrdersCount,
            shippedOrders: shippedOrdersCount,
            unreadEnquiries: unreadEnquiriesCount,
            pendingDistributors: pendingDistributorsCount,
          },
        },
        recentOrders: activeOrders.slice(0, 5),
        recentEnquiries: enquiries.slice(0, 5),
        recentLeads: distributorLeads.slice(0, 5),
        allOrders: activeOrders,
      },
      200,
      {
        'Cache-Control': 'public, max-age=10, stale-while-revalidate=30',
      }
    );
  } catch (error: any) {
    console.error('[API /api/admin/dashboard-stats] Error compiling dashboard stats:', error);
    return apiError(error?.message || 'Failed to compile dashboard metrics', 500);
  }
}
