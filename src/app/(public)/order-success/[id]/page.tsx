'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, MessageCircle, Printer, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface OrderDetails {
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  paymentStatus: string;
}

export default function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/details?orderNumber=${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error('Order query page error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  // Calculate estimated delivery date range (3 to 5 days from today)
  const today = new Date();
  const deliveryStart = new Date(today.setDate(today.getDate() + 3)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const deliveryEnd = new Date(today.setDate(today.getDate() + 2)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const whatsappMessage = encodeURIComponent(`Hi S.S. Pharmacy, I would like to track my Order #${id}`);

  if (loading) {
    return (
      <div className="bg-[#FDF8F0] min-h-[100dvh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#1A5C5E] animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-[#FDF8F0] text-slate-800 pt-24 pb-16 min-h-[100dvh] font-sans flex items-center justify-center">
        <div className="max-w-[480px] w-full mx-auto px-4 text-center space-y-6 border border-[#C9D5D5]/80 p-8 rounded-2xl bg-white shadow-md">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 border border-rose-200 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-serif text-rose-700 font-bold">Invalid Order Reference</h1>
            <p className="text-xs text-slate-600 mt-2">The order reference code in the URL does not match any orders in our records.</p>
          </div>
          <Link href="/" className="inline-block bg-[#1A5C5E] text-white px-6 py-2 rounded-full text-xs font-bold uppercase">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FDF8F0] text-slate-800 pt-24 pb-16 min-h-[100dvh] font-sans flex items-center justify-center">
      <div className="max-w-[480px] w-full mx-auto px-4 text-center space-y-6 border border-[#C9D5D5]/80 p-8 rounded-2xl bg-white shadow-md">
        
        {/* Success Badge */}
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-serif text-[#1A5C5E] font-bold uppercase tracking-wide">Order Confirmed!</h1>
          <p className="text-xs text-slate-600 mt-1 font-light">Thank you, {order.customerName}. We have received your order.</p>
        </div>

        {/* Order Details Summary */}
        <div className="p-4 bg-[#FDFBF7] border border-[#C9D5D5]/60 rounded-xl text-xs space-y-3">
          <div className="flex justify-between border-b border-slate-200/50 pb-2">
            <span className="text-slate-500 font-sans uppercase text-[10px]">Order Number</span>
            <span className="font-bold font-mono text-slate-900">{order.orderNumber}</span>
          </div>

          <div className="flex justify-between border-b border-slate-200/50 pb-2">
            <span className="text-slate-500 font-sans uppercase text-[10px]">Total Amount</span>
            <span className="font-bold text-[#1A5C5E]">₹{order.totalAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between border-b border-slate-200/50 pb-2">
            <span className="text-slate-500 font-sans uppercase text-[10px]">Payment Status</span>
            <span className="font-bold capitalize text-slate-900">{order.paymentStatus}</span>
          </div>

          <div className="pt-2.5 flex items-center justify-center gap-2 text-[#1A5C5E] font-semibold">
            <Truck className="w-4 h-4 text-[#C9943E] shrink-0" />
            <span>Estimated Delivery: <strong className="text-slate-900">{deliveryStart} - {deliveryEnd}</strong></span>
          </div>
        </div>

        {/* Actions */}
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
