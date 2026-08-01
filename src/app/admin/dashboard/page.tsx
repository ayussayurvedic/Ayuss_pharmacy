'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { 
  AdminCard, 
  AdminStatusBadge, 
  AdminDataTable, 
  AdminSkeleton, 
  AdminEmptyState 
} from '@/components/admin/AdminPrimitives';
import AnalyticsCharts from '@/components/admin/AnalyticsCharts';
import { 
  Coins, 
  ShoppingBag, 
  MessageSquare, 
  Building2, 
  Clock, 
  AlertTriangle, 
  Eye 
} from 'lucide-react';

type DateFilter = 'today' | '7days' | '30days' | 'this_month';

interface DashboardAttentionItems {
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  unreadEnquiries: number;
  pendingDistributors: number;
}

interface DashboardStatsData {
  revenue: number;
  ordersCount: number;
  aov: number;
  enquiriesCount: number;
  leadsCount: number;
  attentionItems: DashboardAttentionItems;
}

export interface RecentOrderRecord {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  order_status: string;
}

export interface RecentLeadRecord {
  id: string;
  company_name: string;
  contact_person: string;
  city: string;
  expected_monthly_volume?: string;
  status: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('30days');

  const [stats, setStats] = useState<DashboardStatsData>({
    revenue: 0,
    ordersCount: 0,
    aov: 0,
    enquiriesCount: 0,
    leadsCount: 0,
    attentionItems: {
      pendingOrders: 0,
      confirmedOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      unreadEnquiries: 0,
      pendingDistributors: 0
    }
  });

  const [recentOrders, setRecentOrders] = useState<RecentOrderRecord[]>([]);
  const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<RecentLeadRecord[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/dashboard-stats?filter=${dateFilter}`);
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const json = await res.json();
      if (!json.success && json.error) {
        throw new Error(json.error);
      }

      const payload = json.data || json;
      if (payload.stats) {
        setStats(payload.stats);
      }
      setRecentOrders(payload.recentOrders || []);
      setRecentEnquiries(payload.recentEnquiries || []);
      setRecentLeads(payload.recentLeads || []);
      setAllOrders(payload.allOrders || []);
    } catch (err: any) {
      console.error('Failed to load dashboard statistics:', err);
      setError('Unable to compile operational metrics. Please check server connectivity.');
      toast.error('Error syncing dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter]);

  if (loading) {
    return (
      <div className="space-y-6 py-6">
        <AdminSkeleton type="kpi" />
        <AdminSkeleton type="table" rows={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-slate-200">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-100">Operational Failure</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">{error}</p>
        <button 
          type="button" 
          onClick={fetchDashboardData} 
          className="admin-btn-primary mt-5"
        >
          Retry Operational Sync
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Title Subheader */}
      <div className="bg-[#134547] text-white p-6 rounded-2xl border border-[#1A5C5E] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#E8C87A] uppercase tracking-wider block">Administrative Command Center</span>
          <h1 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-wide !text-white text-white">Executive Dashboard</h1>
          <p className="!text-slate-200 text-slate-200 text-xs font-light">Realtime operations summary, revenue trends, and pending lead logs</p>
        </div>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as DateFilter)}
          className="py-2 px-3 text-xs font-bold rounded-xl border border-[#C9D5D5] bg-white text-[#1A5C5E] focus:outline-none cursor-pointer shadow-xs"
        >
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="this_month">This Month</option>
        </select>
      </div>

      {/* Operational KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-[#C9D5D5]/60 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Revenue</span>
            <span className="text-xl font-bold font-mono text-[#1A5C5E]">₹{stats.revenue.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#C9D5D5]/60 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#C9943E]/10 text-[#C9943E] flex items-center justify-center border border-[#C9943E]/25 shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Orders Count</span>
            <span className="text-xl font-bold font-mono text-[#1A5C5E]">{stats.ordersCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#C9D5D5]/60 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200 shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Value (AOV)</span>
            <span className="text-xl font-bold font-mono text-[#1A5C5E]">₹{stats.aov.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#C9D5D5]/60 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Distributor Leads</span>
            <span className="text-xl font-bold font-mono text-[#1A5C5E]">{stats.leadsCount}</span>
          </div>
        </div>
      </div>

      <AnalyticsCharts orders={allOrders} />
 
      {/* Attention Items Alert Strip */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 bg-white p-4 rounded-2xl border border-[#C9D5D5]/60 shadow-xs">
        <div className="p-3 bg-[#FDF8F0] border border-[#C9D5D5]/50 rounded-xl text-center">
          <span className="text-[9px] font-bold text-slate-500 uppercase block">New Orders</span>
          <span className="text-base font-bold font-mono text-[#1A5C5E]">{stats.attentionItems.pendingOrders}</span>
        </div>
        <div className="p-3 bg-[#FDF8F0] border border-[#C9D5D5]/50 rounded-xl text-center">
          <span className="text-[9px] font-bold text-slate-500 uppercase block">Confirmed</span>
          <span className="text-base font-bold font-mono text-[#1A5C5E]">{stats.attentionItems.confirmedOrders}</span>
        </div>
        <div className="p-3 bg-[#FDF8F0] border border-[#C9D5D5]/50 rounded-xl text-center">
          <span className="text-[9px] font-bold text-slate-500 uppercase block">Processing</span>
          <span className="text-base font-bold font-mono text-[#1A5C5E]">{stats.attentionItems.processingOrders}</span>
        </div>
        <div className="p-3 bg-[#FDF8F0] border border-[#C9D5D5]/50 rounded-xl text-center">
          <span className="text-[9px] font-bold text-slate-500 uppercase block">Shipped</span>
          <span className="text-base font-bold font-mono text-[#1A5C5E]">{stats.attentionItems.shippedOrders}</span>
        </div>
        <Link href="/admin/inquiries" className="p-3 bg-[#FDF8F0] border border-[#C9D5D5]/50 hover:border-[#C9943E] rounded-xl text-center transition-colors block">
          <span className="text-[9px] font-bold text-slate-500 uppercase block">New Inquiries</span>
          <span className="text-base font-bold font-mono text-[#1A5C5E]">{stats.attentionItems.unreadEnquiries}</span>
        </Link>
        <div className="p-3 bg-[#FDF8F0] border border-[#C9D5D5]/50 rounded-xl text-center">
          <span className="text-[9px] font-bold text-slate-500 uppercase block">Pending B2B</span>
          <span className="text-base font-bold font-mono text-[#1A5C5E]">{stats.attentionItems.pendingDistributors}</span>
        </div>
      </div>

      {/* 3-Column Section for Orders, Leads, and Customer Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-2xl border border-[#C9D5D5]/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#C9D5D5]/40 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A5C5E] flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#C9943E]" />
              <span>Recent Orders</span>
            </h3>
            <Link href="/admin/orders" className="text-[11px] font-bold text-[#C9943E] hover:underline">
              View All
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No recent sales records.</p>
          ) : (
            <div className="space-y-2.5">
              {recentOrders.map(o => (
                <div 
                  key={o.id}
                  onClick={() => router.push(`/admin/orders/${o.id}`)}
                  className="p-3 bg-[#FDF8F0] border border-[#C9D5D5]/40 hover:border-[#C9943E] rounded-xl flex items-center justify-between text-xs cursor-pointer transition-colors"
                >
                  <div>
                    <span className="font-mono font-bold text-[#C9943E] block">{o.order_number}</span>
                    <span className="text-[11px] text-slate-600 font-medium">{o.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-[#1A5C5E]">₹{o.total_amount}</span>
                    <AdminStatusBadge status={o.order_status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Contact Inquiries */}
        <div className="bg-white p-6 rounded-2xl border border-[#C9D5D5]/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#C9D5D5]/40 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A5C5E] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#C9943E]" />
              <span>Customer Inquiries</span>
            </h3>
            <Link href="/admin/inquiries" className="text-[11px] font-bold text-[#C9943E] hover:underline">
              View All
            </Link>
          </div>
          {recentEnquiries.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No customer inquiries submitted recently.</p>
          ) : (
            <div className="space-y-2.5">
              {recentEnquiries.map(inq => (
                <div 
                  key={inq.id}
                  onClick={() => router.push('/admin/inquiries')}
                  className="p-3 bg-[#FDF8F0] border border-[#C9D5D5]/40 hover:border-[#C9943E] rounded-xl flex items-center justify-between text-xs cursor-pointer transition-colors"
                >
                  <div>
                    <span className="font-bold text-[#1A5C5E] block">{inq.name}</span>
                    <span className="text-[11px] text-slate-500 truncate max-w-[180px] block">{inq.requirement || inq.message}</span>
                  </div>
                  <AdminStatusBadge status={inq.status || 'new'} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent B2B leads */}
        <div className="bg-white p-6 rounded-2xl border border-[#C9D5D5]/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#C9D5D5]/40 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A5C5E] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#C9943E]" />
              <span>Distributor Leads</span>
            </h3>
            <Link href="/admin/distributors" className="text-[11px] font-bold text-[#C9943E] hover:underline">
              View All
            </Link>
          </div>
          {recentLeads.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No B2B leads registered recently.</p>
          ) : (
            <div className="space-y-2.5">
              {recentLeads.map(l => (
                <div 
                  key={l.id}
                  onClick={() => router.push(`/admin/distributors/${l.id}`)}
                  className="p-3 bg-[#FDF8F0] border border-[#C9D5D5]/40 hover:border-[#C9943E] rounded-xl flex items-center justify-between text-xs cursor-pointer transition-colors"
                >
                  <div>
                    <span className="font-bold text-[#1A5C5E] block">{l.company_name}</span>
                    <span className="text-[11px] text-slate-500">{l.contact_person} ({l.city})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-[#C9943E]">{l.expected_monthly_volume || 'N/A'}</span>
                    <AdminStatusBadge status={l.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
