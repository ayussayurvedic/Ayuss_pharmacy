import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getSentNotifications } from './actions';
import AdminNotificationsClient from './AdminNotificationsClient';

export const dynamic = 'force-dynamic';

export default async function AdminNotificationsPage() {
  const session = await getSession();
  if (!session || !session.id) {
    redirect('/admin/login');
  }

  const isAdmin = session.role === 'admin';
  if (!isAdmin) {
    redirect('/admin/dashboard');
  }

  // Fetch admins list and sent history in parallel
  const [
    adminsRes,
    notificationsRes
  ] = await Promise.all([
    supabaseAdmin
      .from('admin_users')
      .select('id, email')
      .order('email', { ascending: true }),
    getSentNotifications()
  ]);

  const admins = (adminsRes.data || []).map(a => ({ id: a.id, name: a.email, employee_id: 'ADMIN' }));
  const initialNotifications = notificationsRes.success ? notificationsRes.notifications : [];

  return (
    <div className="space-y-6 pb-12 font-sans">
      <div className="bg-[#134547] text-white p-6 rounded-2xl border border-[#1A5C5E] shadow-md">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#C9943E] uppercase tracking-wider block">System Alerts</span>
          <h1 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-wide">Notification Dispatcher</h1>
          <p className="text-slate-300 text-xs font-light">Send announcements or targeted system alerts to administrators and staff</p>
        </div>
      </div>
      <AdminNotificationsClient
        employees={admins}
        initialNotifications={initialNotifications}
      />
    </div>
  );
}
