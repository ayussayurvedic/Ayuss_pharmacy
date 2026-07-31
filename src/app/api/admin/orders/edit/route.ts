import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyActiveAdmin, getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate Admin session
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await verifyActiveAdmin(session.id);

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { orderId, customerName, customerPhone, shippingAddress, giftMessage } = body;
    if (!orderId || !customerName || !customerPhone || !shippingAddress) {
      return NextResponse.json({ error: 'Missing required update fields' }, { status: 400 });
    }

    // 2. Perform DB update
    const { error } = await supabaseAdmin
      .from('orders')
      .update({
        customer_name: customerName,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        gift_message: giftMessage || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Admin edit order crash:', err);
    return NextResponse.json({ error: err.message || 'Failed to update order' }, { status: 500 });
  }
}
