'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { AdminCard, AdminSkeleton, AdminStatusBadge } from '@/components/admin/AdminPrimitives';
import { ChevronLeft, Clock, History } from 'lucide-react';

export default function AdminInventoryDetail({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params);
  const { toast } = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<any | null>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);

  const fetchDetail = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      // 1. Fetch Inventory Record
      const { data: invData, error: invErr } = await supabase
        .from('inventory')
        .select('*, products(name, mrp, category)')
        .eq('product_id', productId)
        .maybeSingle();

      if (invErr) throw invErr;
      setInventory(invData);

      // 2. Fetch Movements Ledger
      const { data: movData, error: movErr } = await supabase
        .from('inventory_movements')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (movErr) throw movErr;
      setMovements(movData || []);

      // 3. Fetch Reservations
      const { data: resData, error: resErr } = await supabase
        .from('inventory_reservations')
        .select('*')
        .eq('product_id', productId)
        .eq('status', 'active');

      if (resErr) throw resErr;
      setReservations(resData || []);

    } catch (err: any) {
      console.error('Fetch inventory detail error:', err);
      toast.error('Failed to load inventory movement details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [productId]);

  if (loading) {
    return (
      <div className="space-y-5 py-6">
        <AdminSkeleton type="card" />
        <AdminSkeleton type="table" rows={4} />
      </div>
    );
  }

  const available = inventory ? (inventory.quantity_on_hand - inventory.quantity_reserved) : 0;

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-700">
      <div className="flex items-center justify-between border-b border-[#C9D5D5]/60 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/inventory" className="inline-flex items-center justify-center w-9 h-9 bg-white border border-[#C9D5D5] hover:bg-slate-50 text-[#1A5C5E] rounded-xl transition-all cursor-pointer shadow-xs" aria-label="Back to inventory">
            <ChevronLeft size={16} />
          </Link>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inventory Detail & Ledger</span>
            <h2 className="text-xl font-bold text-[#134547]">{inventory?.products?.name || productId}</h2>
          </div>
        </div>
        <span className="font-mono text-xs text-slate-400">SKU: {inventory?.sku || 'N/A'}</span>
      </div>

      <AdminCard className="bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#C9D5D5]/40 pb-3 mb-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stock Level Summary</span>
            <h3 className="font-bold text-sm text-[#134547] m-0">{inventory?.products?.name || productId}</h3>
            <p className="text-xs text-slate-500 m-0">{inventory?.products?.category}</p>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="text-center px-3 py-1.5 bg-[#FDF8F0] rounded-lg border border-[#C9D5D5]/60">
              <span className="text-[10px] text-slate-500 block font-bold uppercase">On Hand</span>
              <span className="font-bold text-sm text-[#134547]">{inventory?.quantity_on_hand || 0}</span>
            </div>
            <div className="text-center px-3 py-1.5 bg-[#FDF8F0] rounded-lg border border-[#C9D5D5]/60">
              <span className="text-[10px] text-slate-500 block font-bold uppercase">Reserved</span>
              <span className="font-bold text-sm text-[#134547]">{inventory?.quantity_reserved || 0}</span>
            </div>
            <div className="text-center px-3 py-1.5 bg-[#1A5C5E]/10 rounded-lg border border-[#1A5C5E]/20 text-[#1A5C5E]">
              <span className="text-[10px] block font-bold uppercase">Available</span>
              <span className="font-bold text-sm">{available}</span>
            </div>
          </div>
        </div>
      </AdminCard>

      {reservations.length > 0 && (
        <AdminCard className="bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 border-b border-[#C9D5D5]/40 pb-2 mb-3">
            <Clock className="w-4 h-4 text-[#1A5C5E]" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A5C5E] m-0">Active Order Reservations ({reservations.length})</h3>
          </div>
          <div className="space-y-2 text-xs font-semibold">
            {reservations.map(r => (
              <div key={r.id} className="flex justify-between items-center bg-[#FDF8F0] p-2.5 rounded-xl border border-[#C9D5D5]/60">
                <div>
                  <span className="text-slate-800">Order #{r.order_id}</span>
                  <span className="text-slate-400 ml-2 font-mono text-xs">Qty: {r.quantity}</span>
                </div>
                <div className="text-[10px] text-[#C9943E] font-mono">
                  Expires: {new Date(r.expires_at).toLocaleTimeString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      )}

      <AdminCard className="space-y-4 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 border-b border-[#C9D5D5]/40 pb-2">
          <History className="w-4 h-4 text-[#1A5C5E]" />
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A5C5E] m-0">Movement Ledger History</h3>
        </div>

        {movements.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">No inventory movements recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="border-b border-[#C9D5D5]/60 uppercase text-[9px] text-[#1A5C5E] font-bold tracking-wider">
                  <th className="py-2.5 text-left">Movement Type</th>
                  <th className="py-2.5 text-right">Change</th>
                  <th className="py-2.5 text-right">Before</th>
                  <th className="py-2.5 text-right">After</th>
                  <th className="py-2.5 text-left">Reason / Reference</th>
                  <th className="py-2.5 text-left">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C9D5D5]/40 font-semibold text-slate-700">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3">
                      <AdminStatusBadge status={m.movement_type.toLowerCase()} />
                    </td>
                    <td className={`text-right font-mono font-bold py-3 ${m.quantity_change > 0 ? 'text-[#1A5C5E]' : m.quantity_change < 0 ? 'text-red-650' : 'text-slate-650'}`}>
                      {m.quantity_change > 0 ? `+${m.quantity_change}` : m.quantity_change}
                    </td>
                    <td className="text-right font-mono text-slate-400 py-3">{m.quantity_before}</td>
                    <td className="text-right font-mono font-bold text-slate-800 py-3">{m.quantity_after}</td>
                    <td className="text-slate-600 py-3">{m.reason}</td>
                    <td className="font-mono text-[10px] text-slate-400 py-3">
                      {new Date(m.created_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
