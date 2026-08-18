import Link from 'next/link';
import { ArrowLeft, Home, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FDF8F0] px-4 py-16">
      <div className="max-w-md w-full text-center bg-white p-8 sm:p-10 rounded-3xl border border-[#C9D5D5] shadow-lg">
        {/* Large 404 indicator */}
        <div className="relative mb-6">
          <span className="text-[100px] sm:text-[130px] font-serif font-bold text-[#1A5C5E]/10 leading-none select-none block">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[#1A5C5E]/10 flex items-center justify-center backdrop-blur-sm border border-[#C9943E]/30 shadow-inner">
              <Sparkles className="w-8 h-8 text-[#C9943E]" />
            </div>
          </div>
        </div>

        <span className="text-[10px] font-bold text-[#C9943E] uppercase tracking-widest bg-[#C9943E]/10 px-3 py-1 rounded-full border border-[#C9943E]/20 inline-block mb-3">
          Page Not Found
        </span>

        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A5C5E] mb-3 tracking-tight">
          Formulation Not Found
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-8 max-w-xs mx-auto font-light">
          The page you are looking for does not exist, has been removed, or is temporarily unavailable. Let&apos;s guide you back.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1A5C5E] hover:bg-[#134547] text-white font-bold text-xs shadow-md shadow-[#1A5C5E]/20 hover:-translate-y-0.5 transition-all duration-200 uppercase tracking-wider"
          >
            <Home className="w-4 h-4 text-[#C9943E]" />
            <span>Return Home</span>
          </Link>

          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#1A5C5E] text-[#1A5C5E] hover:bg-[#1A5C5E]/5 font-bold text-xs hover:-translate-y-0.5 transition-all duration-200 uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>View Formulations</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
