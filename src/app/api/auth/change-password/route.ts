import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 });
    }

    // Admin Password Change (via Supabase Auth)
    if (session.role === 'admin') {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(session.id, {
        password: newPassword
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: 'Admin password updated successfully' });
    }

    return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('Password change error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
