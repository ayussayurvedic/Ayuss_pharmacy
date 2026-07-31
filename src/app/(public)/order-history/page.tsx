'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Search, ShoppingBag, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface OrderHistoryItem {
  id: string;
  order_number: string;
  total_amount: number;
  payment_status: string;
  order_status: string;
  created_at: string;
}

export default function OrderHistoryPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<OrderHistoryItem[] | null>(null);
  const { toast } = useToast();

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setOrders(null);

    try {
      const res = await fetch(`/api/orders/history?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to search order history.');
      }
      setOrders(data.orders || []);
      toast.success(`Found ${data.orders?.length || 0} order(s).`);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FDF8F0] text-slate-800 pt-24 pb-16 min-h-[100dvh] font-sans flex items-start justify-center">
      <div className="max-w-[540px] w-full mx-auto px-4 mt-8 space-y-6">
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-serif text-[#1A5C5E] font-bold">Your Order History</h1>
          <p className="text-xs text-slate-600 font-light">Lookup all your purchases by mobile number</p>
        </div>

        {/* Input Card */}
        <div className="border border-[#C9D5D5]/80 p-6 rounded-2xl bg-white shadow-sm">
          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label className="block text-slate-700 mb-1 font-semibold text-xs">Mobile Number</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9848523295"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-[#C9D5D5] pl-10 pr-4 py-3 rounded-xl text-xs font-sans outline-none focus:border-[#1A5C5E] min-h-[44px]"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A5C5E] hover:bg-[#134547] text-white py-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-wider cursor-pointer shadow-xs"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Search Orders</span>}
            </button>
          </form>
        </div>

        {/* Results List */}
        {orders !== null && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Search Results ({orders.length})</h3>
            
            {orders.length === 0 ? (
              <div className="border border-[#C9D5D5]/60 p-8 rounded-2xl bg-white text-center text-xs text-slate-500">
                <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p>No orders found matching this mobile number.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className="border border-[#C9D5D5]/60 p-4 rounded-xl bg-white shadow-xs flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <div className="font-mono font-bold text-slate-900">{o.order_number}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="flex gap-2 pt-0.5">
                        <span className="bg-[#1A5C5E]/5 text-[#1A5C5E] px-2 py-0.5 rounded-sm font-semibold uppercase text-[9px]">{o.order_status}</span>
                        <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-sm font-semibold uppercase text-[9px]">{o.payment_status}</span>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      <div className="font-bold text-[#1A5C5E] text-sm">₹{o.total_amount.toFixed(2)}</div>
                      <Link 
                        href={`/order-tracking?orderNum=${o.order_number}`}
                        className="text-[10px] text-slate-600 hover:text-[#1A5C5E] flex items-center justify-end gap-1 font-semibold"
                      >
                        <span>Track</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
