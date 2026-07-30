'use client';

import { use } from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, MessageCircle, Printer, ArrowRight } from 'lucide-react';

export default function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // Calculate estimated delivery date range (3 to 5 days from today)
  const today = new Date();
  const deliveryStart = new Date(today.setDate(today.getDate() + 3)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const deliveryEnd = new Date(today.setDate(today.getDate() + 2)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const whatsappMessage = encodeURIComponent(`Hi S.S. Pharmacy, I would like to track my Order #${id}`);

  return (
    <div className="bg-[#FDF8F0] text-slate-800 pt-24 pb-16 min-h-[100dvh] font-sans flex items-center justify-center">
      <div className="max-w-[480px] w-full mx-auto px-4 text-center space-y-6 border border-[#C9D5D5]/80 p-8 rounded-2xl bg-white shadow-md">
        
        {/* Animated Success Badge */}
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-serif text-[#1A5C5E] font-bold uppercase tracking-wide">Order Confirmed!</h1>
          <p className="text-xs text-slate-600 mt-1 font-light">Thank you for your purchase. We have received your order.</p>
        </div>

        {/* Order Number & Delivery Estimate */}
        <div className="p-4 bg-[#FDFBF7] border border-[#C9D5D5]/60 rounded-xl text-xs space-y-3">
          <div className="font-mono">
            <span className="text-slate-500 block text-[10px] uppercase font-sans tracking-wider mb-0.5">Order Number</span>
            <span className="font-bold text-slate-900 text-sm">{id}</span>
          </div>

          <div className="border-t border-slate-200/60 pt-2.5 flex items-center justify-center gap-2 text-[#1A5C5E] font-semibold">
            <Truck className="w-4 h-4 text-[#C9943E] shrink-0" />
            <span>Estimated Delivery: <strong className="text-slate-900">{deliveryStart} - {deliveryEnd}</strong></span>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="space-y-3 pt-1">
          <a
            href={`https://wa.me/919848523295?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md uppercase tracking-wider cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Track Order on WhatsApp</span>
          </a>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>

            <Link 
              href="/products" 
              className="w-full bg-[#1A5C5E] hover:bg-[#134547] text-white py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wider cursor-pointer shadow-xs"
            >
              <span>Shop More</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
