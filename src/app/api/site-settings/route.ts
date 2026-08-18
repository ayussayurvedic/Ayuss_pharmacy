import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('business_tax_settings')
      .select('support_phone, support_email, trade_name, legal_business_name, registered_address_line1, city, state, postal_code')
      .maybeSingle();

    if (error) {
      console.error('Error fetching site settings from DB:', error);
    }

    const rawPhone = data?.support_phone || '';
    const addressParts = [
      data?.registered_address_line1,
      data?.city,
      data?.state ? `${data?.state}${data?.postal_code ? ` - ${data?.postal_code}` : ''}` : data?.postal_code
    ].filter(Boolean);

    return NextResponse.json({
      success: true,
      data: {
        supportPhone: rawPhone,
        supportEmail: data?.support_email || 'ayuss.ayurvedic@gmail.com',
        tradeName: data?.trade_name || 'Ayu S.S. Pharmacy',
        legalBusinessName: data?.legal_business_name || 'Ayu S.S. Pharmacy',
        address: addressParts.length > 0 ? addressParts.join(', ') : 'Prakash Nagar, Yerraguntla, YSR Kadapa Dist., A.P. - 516309'
      }
    });
  } catch (err: any) {
    console.error('Site settings endpoint error:', err);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch settings'
    }, { status: 500 });
  }
}
