'use client';

import { use } from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export default function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="bg-[#FDF8F0] text-slate-800 pt-24 pb-16 min-h-screen font-sans flex items-center justify-center">
      <div className="max-w-[400px] w-full mx-auto px-4 text-center space-y-5 border p-8 rounded-xl bg-white shadow-sm">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-serif text-[#1A5C5E] font-bold uppercase tracking-wide">Order Confirmed!</h1>
          <p className="text-xs text-slate-400 mt-1">Thank you for your purchase. We have received your order.</p>
        </div>

        <div className="p-4 bg-slate-50 border rounded-lg text-xs font-mono">
          <span className="text-slate-500 block text-[10px] uppercase font-sans mb-0.5">Order Number</span>
          <span className="font-bold text-slate-900">{id}</span>
        </div>

        <div className="pt-2">
          <Link href="/products" className="bg-[#1A5C5E] hover:bg-[#134547] text-white px-5 py-2.5 rounded-lg text-xs font-bold block transition-colors uppercase tracking-wider">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
