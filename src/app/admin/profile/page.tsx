import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import PasswordChangeForm from '@/components/profile/PasswordChangeForm';
import AdminProfileForm from '@/components/profile/AdminProfileForm';
import AdminNotificationPreferences from '@/components/profile/AdminNotificationPreferences';
import Card from '@/components/ui/Card';
import { User } from 'lucide-react';

export default async function AdminProfilePage() {
  const session = await getSession();
  
  if (!session || !session.id || session.role !== 'admin') {
    redirect('/admin/login');
  }

  // Admin user data comes from the session/JWT
  const admin = {
    name: session.name || 'Administrator',
    email: session.email || 'admin@sspharmacy.in',
    role: session.role
  };

  // Fetch preferences from DB
  const { data: dbAdmin } = await supabaseAdmin
    .from('admin_users')
    .select('notification_preferences')
    .eq('id', session.id)
    .maybeSingle();

  const preferences = dbAdmin?.notification_preferences || undefined;

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-700">
      {/* Premium Header */}
      <div className="bg-[#134547] text-white p-6 rounded-2xl border border-[#1A5C5E] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#C9943E]" />
            <h1 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-wide">
              Admin Profile
            </h1>
          </div>
          <p className="text-slate-300 text-xs font-light">
            Manage your account and security settings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card hover={false} className="p-6 rounded-2xl border border-[#C9D5D5]/60 shadow-xs bg-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#1A5C5E]/10 text-[#1A5C5E] border border-[#1A5C5E]/20 flex items-center justify-center">
              <User className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-sm font-bold text-[#134547] uppercase tracking-wide">Account Details</h2>
          </div>

          <AdminProfileForm 
            initialName={admin.name} 
            email={admin.email} 
            role={admin.role} 
          />
        </Card>

        {/* Password Change */}
        <Card hover={false} className="p-6 rounded-2xl border border-[#C9D5D5]/60 shadow-xs bg-white">
          <PasswordChangeForm />
        </Card>

        {/* Notification Alerts Settings */}
        <Card hover={false} className="p-6 rounded-2xl border border-[#C9D5D5]/60 shadow-xs bg-white">
          <AdminNotificationPreferences initialPreferences={preferences} />
        </Card>
      </div>
    </div>
  );
}
