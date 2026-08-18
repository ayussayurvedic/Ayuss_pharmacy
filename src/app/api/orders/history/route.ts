import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { apiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const phone = request.nextUrl.searchParams.get('phone');
    if (!phone) {
      return apiError('Missing phone number', 400);
    }

    // Clean phone input (extract last 10 digits for lookup to match formatting variations)
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return apiError('Invalid phone number format.', 400);
    }
    const phoneSuffix = cleanPhone.slice(-10);

    // Query matching orders directly by phone suffix with safe limit
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, total_amount, payment_status, order_status, created_at, customer_phone')
      .ilike('customer_phone', `%${phoneSuffix}`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ success: true, orders: orders || [] });
  } catch (err: any) {
    console.error('History lookup error:', err);
    return apiError('Failed to query order history', 500);
  }
}
