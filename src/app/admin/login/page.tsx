import type { Metadata } from 'next';
import LoginForm from '@/components/admin/LoginForm';
import Logo from '@/components/ui/Logo';

export const metadata: Metadata = { title: 'Admin Login | Ayu S.S. Pharmacy' };

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDF8F0] px-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1A5C5E]/8 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#C9943E]/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[420px] relative z-10">
        <div className="text-center mb-8 flex flex-col items-center">
          {/* Logo & Company Name horizontally aligned */}
          <div className="flex items-center justify-center gap-3.5 mb-6">
            <Logo className="w-14 h-14" dark={false} />
            <div className="text-left">
              <span className="text-xl font-serif font-black tracking-wide text-[#134547] block leading-tight">AYU S.S. PHARMACY</span>
              <span className="text-[9px] font-bold text-[#C9943E] tracking-widest uppercase block">Ayurvedic Medicines</span>
            </div>
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A5C5E]/8 border border-[#1A5C5E]/20 backdrop-blur-md mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9943E] animate-pulse" />
            <span className="text-[10px] font-bold text-[#1A5C5E] uppercase tracking-[0.2em]">Secure Access</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#134547]">Admin Control Center</h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">Enterprise portal authentication</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-[#C9D5D5]/60 relative overflow-hidden group">
          {/* Subtle card internal glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#1A5C5E]/5 rounded-full blur-3xl group-hover:bg-[#1A5C5E]/10 transition-colors duration-700" />
          
          <LoginForm />

          <div className="mt-8 pt-8 border-t border-[#C9D5D5]/40 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              © {new Date().getFullYear()} Ayu S.S. Pharmacy
            </p>
          </div>
        </div>

        {/* Support links */}
        <div className="mt-8 flex justify-center gap-6">
          <a href="mailto:ayuss.ayurvedic@gmail.com?subject=Admin%20Password%20Reset%20Request" className="text-[11px] font-bold text-slate-500 hover:text-[#1A5C5E] uppercase tracking-wider transition-colors">Forgot Password?</a>
          <a href="mailto:ayuss.ayurvedic@gmail.com?subject=Admin%20Portal%20Support" className="text-[11px] font-bold text-slate-500 hover:text-[#1A5C5E] uppercase tracking-wider transition-colors">Support</a>
        </div>
      </div>
    </div>
  );
}
