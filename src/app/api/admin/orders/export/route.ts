import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyActiveAdmin, getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate admin using verifyActiveAdmin
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return new Response('Unauthorized', { status: 401 });
    }
    await verifyActiveAdmin(session.id);

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('order_number, customer_name, customer_phone, total_amount, payment_status, order_status, created_at')
      .order('created_at', { ascending: false });

    if (error || !orders) throw error || new Error('No orders found');

    // 2. Generate CSV Content
    const headers = ['Order Number', 'Customer Name', 'Phone', 'Amount', 'Payment Status', 'Order Status', 'Date'];
    const rows = orders.map(o => [
      o.order_number,
      o.customer_name,
      o.customer_phone,
      o.total_amount.toString(),
      o.payment_status,
      o.order_status,
      o.created_at
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="orders_export.csv"',
      }
    });
  } catch (err: any) {
    console.error('CSV export failed:', err);
    return new Response('Failed to export CSV', { status: 500 });
  }
}
