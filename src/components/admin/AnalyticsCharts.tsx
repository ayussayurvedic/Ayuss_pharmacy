'use client';

import { useMemo } from 'react';
import { ShoppingBag, TrendingUp } from 'lucide-react';

interface OrderItem {
  product_name: string;
  quantity: number;
  total_price: number;
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  order_status: string;
  order_items?: OrderItem[];
}

interface AnalyticsChartsProps {
  orders: Order[];
}

export default function AnalyticsCharts({ orders }: AnalyticsChartsProps) {
  // 1. Process Formulation Sales Data
  const formulationSales = useMemo(() => {
    const counts = {
      'Dr. Lion Pain Cream': 0,
      'Dr. Lion Pain Pills': 0,
      'Moon Light Cream': 0
    };

    orders.forEach(o => {
      if (o.order_status === 'cancelled') return;
      o.order_items?.forEach(item => {
        const name = (item.product_name || '').toLowerCase();
        if (name.includes('pain cream')) {
          counts['Dr. Lion Pain Cream'] += item.quantity || 0;
        } else if (name.includes('pain pill')) {
          counts['Dr. Lion Pain Pills'] += item.quantity || 0;
        } else if (name.includes('moon light') || name.includes('moonlight')) {
          counts['Moon Light Cream'] += item.quantity || 0;
        }
      });
    });

    return Object.entries(counts).map(([name, units]) => ({ name, units }));
  }, [orders]);

  const maxUnits = useMemo(() => {
    const vals = formulationSales.map(s => s.units);
    return Math.max(...vals, 1);
  }, [formulationSales]);

  // 2. Process Revenue Weekly Trend (Last 7 weeks)
  const weeklyRevenue = useMemo(() => {
    const weeklySums = Array(7).fill(0);
    const now = new Date();

    orders.forEach(o => {
      if (o.order_status === 'cancelled') return;
      const orderDate = new Date(o.created_at);
      const diffMs = now.getTime() - orderDate.getTime();
      const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));

      if (diffWeeks >= 0 && diffWeeks < 7) {
        weeklySums[6 - diffWeeks] += Number(o.total_amount) || 0;
      }
    });

    return weeklySums.map((rev, idx) => ({
      label: `W-${6 - idx}`,
      value: rev
    }));
  }, [orders]);

  const maxWeeklyRev = useMemo(() => {
    const vals = weeklyRevenue.map(w => w.value);
    return Math.max(...vals, 1);
  }, [weeklyRevenue]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs text-slate-800">
      
      {/* Formulation Distribution (Horizontal bars) */}
      <div className="bg-white p-6 rounded-2xl border border-[#C9D5D5]/60 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-[#C9D5D5]/40 pb-3">
          <div className="space-y-0.5">
            <h3 className="font-bold text-[#1A5C5E] uppercase tracking-wider text-[10px]">Formulations Demand</h3>
            <p className="text-[10px] text-slate-400 font-light">Units sold per Ayurvedic proprietary blend</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#1A5C5E]/5 text-[#1A5C5E] flex items-center justify-center border border-[#1A5C5E]/15">
            <ShoppingBag size={15} />
          </div>
        </div>

        <div className="space-y-4 pt-1">
          {formulationSales.map((item, idx) => {
            const percentage = (item.units / maxUnits) * 100;
            const barColors = [
              'bg-[#1A5C5E]', // Warm Teal
              'bg-[#C9943E]', // Accent Gold
              'bg-[#2A7B7E]'  // Soft Teal
            ];
            
            return (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between items-center text-[11px] font-medium text-slate-700">
                  <span className="font-bold">{item.name}</span>
                  <span className="font-bold font-mono text-[#1A5C5E]">{item.units} units</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`${barColors[idx % barColors.length]} h-full rounded-full transition-all duration-700`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Revenue Weekly Trend (Vertical bars & line overlays) */}
      <div className="bg-white p-6 rounded-2xl border border-[#C9D5D5]/60 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-[#C9D5D5]/40 pb-3">
          <div className="space-y-0.5">
            <h3 className="font-bold text-[#1A5C5E] uppercase tracking-wider text-[10px]">Revenue Trend</h3>
            <p className="text-[10px] text-slate-400 font-light">Weekly aggregate billing logs (last 7 weeks)</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#C9943E]/10 text-[#C9943E] flex items-center justify-center border border-[#C9943E]/20">
            <TrendingUp size={15} />
          </div>
        </div>

        <div className="relative mt-2">
          {/* Grid lines */}
          <div className="absolute inset-x-0 top-0 h-32 flex flex-col justify-between pointer-events-none z-0 opacity-40">
            <div className="w-full border-t border-dashed border-[#C9D5D5]" />
            <div className="w-full border-t border-dashed border-[#C9D5D5]" />
            <div className="w-full border-t border-dashed border-[#C9D5D5]" />
            <div className="w-full border-t border-[#C9D5D5]/70" />
          </div>

          {/* Bar Charts */}
          <div className="relative z-10 flex items-end justify-between h-36 gap-3 pt-4 px-2">
            {weeklyRevenue.map((week, idx) => {
              const percentage = (week.value / maxWeeklyRev) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group h-full justify-end">
                  <div className="relative w-full flex flex-col items-center h-full justify-end">
                    {/* Tooltip */}
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-[#134547] text-white text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border border-[#1A5C5E] pointer-events-none z-20 shadow-sm whitespace-nowrap">
                      ₹{week.value}
                    </div>

                    {/* Bar Fill */}
                    <div 
                      className="w-full max-w-[20px] rounded-t-xs bg-gradient-to-t from-[#1A5C5E] to-[#2A7B7E] hover:from-[#134547] hover:to-[#1A5C5E] transition-all duration-500 shadow-xs cursor-pointer"
                      style={{ height: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 mt-2 uppercase tracking-wide">
                    {week.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
