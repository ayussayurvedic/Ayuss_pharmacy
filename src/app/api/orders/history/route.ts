import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const phone = request.nextUrl.searchParams.get('phone');
    if (!phone) {
      return NextResponse.json({ error: 'Missing phone number' }, { status: 400 });
    }

    // Clean phone input (extract last 10 digits for lookup to match formatting variations)
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json({ error: 'Invalid phone number format.' }, { status: 400 });
    }
    const phoneSuffix = cleanPhone.slice(-10);

    // Fetch matching orders by suffix check
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, total_amount, payment_status, order_status, created_at, customer_phone')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Filter matching last 10 digits of customer_phone
    const matchedOrders = (orders || []).filter(o => {
      const dbPhone = o.customer_phone.replace(/\D/g, '');
      return dbPhone.endsWith(phoneSuffix);
    });

    return NextResponse.json({ orders: matchedOrders });
  } catch (err: any) {
    console.error('History lookup error:', err);
    return NextResponse.json({ error: 'Failed to query order history' }, { status: 500 });
  }
}
