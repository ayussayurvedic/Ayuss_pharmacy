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

    const activeOrders = ordersData || [];
    const activeApplications = applicationData || [];

    // Financial aggregates
    const paidOrders = activeOrders.filter((o) => o.payment_status === 'paid');
    const revenueVal = paidOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const averageValue = paidOrders.length > 0 ? Math.round(revenueVal / paidOrders.length) : 0;

    // Separate Enquiries vs. Distributor Leads
    const enquiries = activeApplications.filter(
      (a) => a.company_name?.startsWith('Enquiry:') || a.company_name === 'General Contact Enquiry'
    );
    const distributorLeads = activeApplications.filter(
      (a) => !a.company_name?.startsWith('Enquiry:') && a.company_name !== 'General Contact Enquiry'
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
