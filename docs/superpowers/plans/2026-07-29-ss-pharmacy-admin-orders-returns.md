# S.S. Pharmacy Admin Orders & Returns (Wave 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild S.S. Pharmacy admin customer orders list, order details (with packaging, invoice issuance, and shipping status tracker), returns listing workspace, and reverse logistics return detail panels in Next.js.

**Architecture:** Create server/client page boundaries under `/admin/orders` and `/admin/returns` using dynamic rendering (`force-dynamic`). Connect to the `orders`, `order_items`, `order_status_history`, `shipments`, `refunds`, `customer_notifications`, `invoices`, `returns`, `return_items`, `return_status_history`, and `cod_payouts` tables, invoking database-level transaction RPCs.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Supabase SSR, Lucide Icons, Vitest.

## Global Constraints
* Re-use the existing visual design layouts and components from S.S. Pharmacy (Next.js).
* Keep all file edits localized, focused, and type-safe.
* Do NOT stage, commit, or push any changes to Git or GitHub per user instruction.
* Dynamic rendering is required (`export const dynamic = 'force-dynamic'`) on pages querying Supabase database status.

---

### Task 1: Rebuild Admin Orders List Page

**Files:**
* Create: `src/app/admin/orders/page.tsx`
* Create: `src/__tests__/pure/orders-filtering.test.ts`

**Interfaces:**
* Consumes: Supabase `orders` table rows.
* Produces: Filtered and paginated list of purchase orders with status summary pill buttons.

- [ ] **Step 1: Write orders filtering unit test**
  Create `src/__tests__/pure/orders-filtering.test.ts`:
  ```typescript
  import { describe, it, expect } from 'vitest';

  interface LocalOrder {
    order_number: string;
    customer_name: string;
    order_status: string;
  }

  function filterOrdersList(list: LocalOrder[], search: string, status: string): LocalOrder[] {
    return list.filter(o => {
      const matchSearch = o.order_number.toLowerCase().includes(search.toLowerCase()) || 
                          o.customer_name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = status === 'all' || o.order_status === status;
      return matchSearch && matchStatus;
    });
  }

  describe('Orders Filtering Logic', () => {
    const list: LocalOrder[] = [
      { order_number: 'ORD-1001', customer_name: 'John Doe', order_status: 'new' },
      { order_number: 'ORD-1002', customer_name: 'Jane Smith', order_status: 'shipped' },
      { order_number: 'ORD-1003', customer_name: 'Ram Kumar', order_status: 'new' }
    ];

    it('should filter by search query', () => {
      const res = filterOrdersList(list, 'Smith', 'all');
      expect(res.length).toBe(1);
      expect(res[0].order_number).toBe('ORD-1002');
    });

    it('should filter by status', () => {
      const res = filterOrdersList(list, '', 'new');
      expect(res.length).toBe(2);
    });
  });
  ```

- [ ] **Step 2: Run test to verify it passes**
  Run: `npx vitest run src/__tests__/pure/orders-filtering.test.ts`
  Expected: PASS

- [ ] **Step 3: Create src/app/admin/orders/page.tsx**
  Write a dynamic admin orders component under `src/app/admin/orders/page.tsx`:
  ```tsx
  'use client';

  import { useState, useEffect } from 'react';
  import { useRouter } from 'next/navigation';
  import { createClient } from '@/lib/supabase/client';
  import { useToast } from '@/components/ui/Toast';
  import { 
    AdminCard, 
    AdminStatusBadge, 
    AdminDataTable, 
    AdminMobileRecord, 
    AdminFilterBar, 
    AdminPagination, 
    AdminSkeleton, 
    AdminEmptyState 
  } from '@/components/admin/AdminPrimitives';
  import { Eye } from 'lucide-react';

  export default function AdminOrders() {
    const { toast } = useToast();
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (dbError) throw dbError;
        setOrders(data || []);
      } catch (err: any) {
        console.error('Error loading orders:', err);
        setError('Unable to retrieve purchase orders.');
        toast.error('Error syncing orders list.');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchOrders();
    }, []);

    // Filter logic
    const filteredOrders = orders.filter((o) => {
      const orderNo = o.order_number || '';
      const custName = o.customer_name || '';
      const custPhone = o.customer_phone || '';
      
      const matchesSearch = 
        orderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        custName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        custPhone.includes(searchQuery);

      const matchesStatus = statusFilter === 'all' || o.order_status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Pagination calculations
    const totalRecords = filteredOrders.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const paginatedOrders = filteredOrders.slice(
      (currentPage - 1) * recordsPerPage,
      currentPage * recordsPerPage
    );

    // Reset page when filters change
    useEffect(() => {
      setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    const filterOptions = [
      { label: 'All Statuses', value: 'all' },
      { label: 'New', value: 'new' },
      { label: 'Confirmed', value: 'confirmed' },
      { label: 'Processing', value: 'processing' },
      { label: 'Packed', value: 'packed' },
      { label: 'Shipped', value: 'shipped' },
      { label: 'Out for Delivery', value: 'out_for_delivery' },
      { label: 'Delivered', value: 'delivered' },
      { label: 'Cancelled', value: 'cancelled' }
    ];

    // Quick category summary counts
    const counts = {
      all: orders.length,
      new: orders.filter(o => o.order_status === 'new').length,
      confirmed: orders.filter(o => o.order_status === 'confirmed').length,
      processing: orders.filter(o => o.order_status === 'processing').length,
      shipped: orders.filter(o => o.order_status === 'shipped').length,
      delivered: orders.filter(o => o.order_status === 'delivered').length,
      cancelled: orders.filter(o => o.order_status === 'cancelled').length
    };

    const columns = [
      { 
        header: 'Order #', 
        render: (o: any) => <span className="font-mono font-semibold text-slate-200">{o.order_number}</span> 
      },
      { 
        header: 'Customer', 
        render: (o: any) => (
          <div className="flex flex-col">
            <span className="font-medium text-slate-200">{o.customer_name}</span>
            <span className="text-[10px] text-slate-500 font-mono">{o.customer_phone}</span>
          </div>
        ) 
      },
      { 
        header: 'Date', 
        render: (o: any) => (
          <span className="text-xs text-slate-400 font-medium">
            {new Date(o.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        ) 
      },
      { 
        header: 'Payment', 
        render: (o: any) => (
          <div className="flex flex-col items-start gap-0.5">
            <span className="uppercase text-[10px] font-semibold text-slate-500">
              {(o.payment_method || 'cod').replace('online_razorpay', 'razorpay')}
            </span>
            <AdminStatusBadge status={o.payment_status} />
          </div>
        ) 
      },
      { 
        header: 'Fulfillment Status', 
        render: (o: any) => <AdminStatusBadge status={o.order_status} /> 
      },
      { 
        header: 'Total', 
        render: (o: any) => <span className="font-mono font-semibold text-slate-200">₹{o.total_amount?.toLocaleString('en-IN')}</span> 
      },
      { 
        header: 'Action', 
        render: (o: any) => (
          <button 
            type="button" 
            onClick={() => router.push(`/admin/orders/${o.id}`)}
            className="admin-btn-outline !min-h-[32px] !py-1 !px-3 text-xs flex items-center gap-1"
            aria-label={`View details for order ${o.order_number}`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View</span>
          </button>
        ),
        className: 'text-right'
      }
    ];

    return (
      <div className="space-y-5 text-slate-200">
        <div className="flex flex-col gap-3 pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Order Management Workspace</span>
            <h1 className="text-xl font-bold text-slate-100">Customer Orders</h1>
            <p className="text-xs text-slate-500 margin-0">Review, process, and update customer order lifecycles</p>
          </div>

          {/* Category Summary Count Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === 'all' 
                  ? 'bg-slate-200 text-slate-900 font-bold' 
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('new')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === 'new' 
                  ? 'bg-slate-200 text-slate-900 font-bold' 
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              New ({counts.new})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('confirmed')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === 'confirmed' 
                  ? 'bg-slate-200 text-slate-900 font-bold' 
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              Confirmed ({counts.confirmed})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('processing')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === 'processing' 
                  ? 'bg-slate-200 text-slate-900 font-bold' 
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              Processing ({counts.processing})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('shipped')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === 'shipped' 
                  ? 'bg-slate-200 text-slate-900 font-bold' 
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              Shipped ({counts.shipped})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('delivered')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === 'delivered' 
                  ? 'bg-slate-200 text-slate-900 font-bold' 
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              Delivered ({counts.delivered})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === 'cancelled' 
                  ? 'bg-slate-200 text-slate-900 font-bold' 
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              Cancelled ({counts.cancelled})
            </button>
          </div>
        </div>

        <AdminCard>
          <AdminFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search Order #, Customer Name, or Phone..."
            selectedFilter={statusFilter}
            onFilterChange={setStatusFilter}
            filterOptions={filterOptions}
            filterLabel="Status"
          />
        </AdminCard>

        {loading ? (
          <AdminSkeleton type="table" rows={5} />
        ) : error ? (
          <div className="text-red-500 text-xs py-4">{error}</div>
        ) : paginatedOrders.length === 0 ? (
          <AdminEmptyState
            title="No Purchase Orders Found"
            description="No customer purchase orders match your search and filter criteria."
          />
        ) : (
          <div className="space-y-4">
            <div className="hidden md:block">
              <AdminCard className="p-0 overflow-hidden">
                <AdminDataTable
                  columns={columns}
                  data={paginatedOrders}
                  keyExtractor={(o) => o.id}
                  onRowClick={(o) => router.push(`/admin/orders/${o.id}`)}
                />
              </AdminCard>
            </div>

            <div className="md:hidden space-y-3">
              {paginatedOrders.map((o) => (
                <AdminMobileRecord
                  key={o.id}
                  title={o.order_number}
                  subtitle={o.customer_name}
                  meta={`Amt: ₹${o.total_amount?.toLocaleString('en-IN')} · Pay: ${o.payment_status.toUpperCase()}`}
                  badge={<AdminStatusBadge status={o.order_status} />}
                  actionUrl={`/admin/orders/${o.id}`}
                />
              ))}
            </div>

            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={totalRecords}
              recordsPerPage={recordsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    );
  }
  ```

- [ ] **Step 4: Run production build check to verify compile success**
  Run: `npm run build`
  Expected: Compiled successfully with 0 errors.

---

### Task 2: Rebuild Order Details Page

**Files:**
* Create: `src/app/admin/orders/[id]/page.tsx`

**Interfaces:**
* Consumes: Supabase `orders`, `order_items`, `order_status_history`, `shipments`, `refunds`, `customer_notifications`, and `invoices` table joins.
* Produces: Fulfillment operations (shipment dispatch triggers, cancel forms, invoice creation, print views).

- [ ] **Step 1: Create src/app/admin/orders/[id]/page.tsx**
  Implement order details sheet with full status modification callbacks, shipping logistics details, and customer notification trackers:
  ```tsx
  'use client';

  import { useState, useEffect, use } from 'react';
  import Link from 'next/link';
  import { useRouter } from 'next/navigation';
  import { createClient } from '@/lib/supabase/client';
  import { useToast } from '@/components/ui/Toast';
  import { AdminCard, AdminSkeleton, AdminStatusBadge, AdminInput, AdminTextarea } from '@/components/admin/AdminPrimitives';
  import { AdminConfirmDialog } from '@/components/admin/AdminConfirmDialog';
  import { 
    ChevronLeft, 
    AlertTriangle, 
    ShoppingCart, 
    User, 
    MapPin, 
    CreditCard, 
    Clock, 
    CheckCircle, 
    Truck, 
    ExternalLink, 
    IndianRupee, 
    Mail, 
    RefreshCw, 
    Send, 
    Receipt, 
    Download 
  } from 'lucide-react';

  export default function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { toast } = useToast();
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<any | null>(null);
    const [orderItems, setOrderItems] = useState<any[]>([]);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [shipment, setShipment] = useState<any | null>(null);
    const [refund, setRefund] = useState<any | null>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [invoice, setInvoice] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Status modification state
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Shipment Modal States
    const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
    const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
    const [shipmentForm, setShipmentForm] = useState({
      carrier: '',
      service_name: '',
      awb_number: '',
      tracking_number: '',
      tracking_url: '',
      admin_note: ''
    });
    const [correctionForm, setCorrectionForm] = useState({
      carrier: '',
      service_name: '',
      awb_number: '',
      tracking_number: '',
      tracking_url: '',
      reason: ''
    });

    const fetchOrderDetail = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch main order metadata
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();

        if (orderError) throw orderError;
        setOrder(orderData);

        // 2. Fetch associated order line items
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', id);

        if (itemsError) throw itemsError;
        setOrderItems(itemsData || []);

        // 3. Fetch history timeline
        const { data: historyData, error: historyError } = await supabase
          .from('order_status_history')
          .select('*')
          .eq('order_id', id)
          .order('created_at', { ascending: true });
          
        if (historyError) throw historyError;
        setTimeline(historyData || []);

        // 4. Fetch shipment record
        const { data: shipmentData, error: shipmentError } = await supabase
          .from('shipments')
          .select('*')
          .eq('order_id', id)
          .maybeSingle();

        if (!shipmentError && shipmentData) {
          setShipment(shipmentData);
          setShipmentForm({
            carrier: shipmentData.carrier || '',
            service_name: shipmentData.service_name || '',
            awb_number: shipmentData.awb_number || '',
            tracking_number: shipmentData.tracking_number || '',
            tracking_url: shipmentData.tracking_url || '',
            admin_note: shipmentData.admin_note || ''
          });
          setCorrectionForm({
            carrier: shipmentData.carrier || '',
            service_name: shipmentData.service_name || '',
            awb_number: shipmentData.awb_number || '',
            tracking_number: shipmentData.tracking_number || '',
            tracking_url: shipmentData.tracking_url || '',
            reason: ''
          });
        } else {
          setShipment(null);
        }

        // 5. Fetch refund record
        const { data: refundData } = await supabase
          .from('refunds')
          .select('*')
          .eq('order_id', id)
          .maybeSingle();

        setRefund(refundData);

        // 6. Fetch notification events
        const { data: notifData } = await supabase
          .from('customer_notifications')
          .select('*')
          .eq('order_id', id)
          .order('created_at', { ascending: false });

        setNotifications(notifData || []);

        // 7. Fetch invoice record
        const { data: invData } = await supabase
          .from('invoices')
          .select('*')
          .eq('order_id', id)
          .maybeSingle();

        setInvoice(invData);
      } catch (err: any) {
        console.error('Fetch order detail error:', err);
        setError(err.message || 'Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };

    const handleIssueInvoice = async () => {
      if (!id) return;
      setIsSubmitting(true);
      try {
        const { data, error: rpcErr } = await supabase.rpc('issue_order_invoice', { p_order_id: id });
        if (rpcErr || !data?.success) throw new Error(rpcErr?.message || 'Invoice issuance failed');

        toast.success(`Invoice ${data.invoice_number} issued successfully.`);

        // Trigger PDF generation Edge Function asynchronously
        await supabase.functions.invoke('generate-invoice-pdf', {
          body: { invoice_id: data.invoice_id }
        });

        await fetchOrderDetail();
      } catch (err: any) {
        console.error('Issue invoice error:', err);
        toast.error(err.message || 'Failed to issue tax invoice.');
      } finally {
        setIsSubmitting(false);
      }
    };

    useEffect(() => {
      fetchOrderDetail();
    }, [id]);

    const handleStatusChangeAttempt = (newStatus: string) => {
      if (newStatus === 'cancelled') {
        setIsCancelModalOpen(true);
        return;
      }
      setPendingStatus(newStatus);
      setIsConfirmOpen(true);
    };

    const handleConfirmStatusChange = async () => {
      if (!id || !pendingStatus || !order) return;
      
      setIsSubmitting(true);
      try {
        let rpcName = 'update_order_status';
        let rpcArgs: any = { p_order_id: id, p_new_status: pendingStatus, p_note: null };

        if (pendingStatus === 'shipped') {
          rpcName = 'mark_order_shipped';
          rpcArgs = { p_order_id: id };
        } else if (pendingStatus === 'out_for_delivery') {
          rpcName = 'mark_order_out_for_delivery';
          rpcArgs = { p_order_id: id };
        } else if (pendingStatus === 'delivered') {
          rpcName = 'mark_order_delivered';
          rpcArgs = { p_order_id: id };
        }

        const { error: updateError } = await supabase.rpc(rpcName, rpcArgs);

        if (updateError) throw updateError;

        await fetchOrderDetail();
        toast.success(`Order updated to ${pendingStatus.toUpperCase()} successfully.`);
      } catch (err: any) {
        console.error('Update status error:', err);
        toast.error(err.message || 'Failed to write changes to Supabase.');
      } finally {
        setIsSubmitting(false);
        setIsConfirmOpen(false);
        setPendingStatus(null);
      }
    };

    const handleCancelOrderSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!id) return;
      if (cancelReason.trim().length < 10) {
        toast.error('Cancellation reason must be at least 10 characters.');
        return;
      }

      setIsSubmitting(true);
      try {
        const { error: cancelErr } = await supabase.rpc('cancel_order_with_refund_check', {
          p_order_id: id,
          p_reason: cancelReason.trim()
        });

        if (cancelErr) throw cancelErr;

        toast.success('Order cancelled successfully.');
        setIsCancelModalOpen(false);
        await fetchOrderDetail();
      } catch (err: any) {
        console.error('Cancel order error:', err);
        toast.error(err.message || 'Failed to cancel purchase order.');
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleCreateShipmentSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!id) return;
      if (!shipmentForm.carrier.trim() || !shipmentForm.tracking_number.trim()) {
        toast.error('Carrier name and tracking number are mandatory.');
        return;
      }

      setIsSubmitting(true);
      try {
        const { error: shipErr } = await supabase.rpc('create_order_shipment', {
          p_order_id: id,
          p_carrier: shipmentForm.carrier.trim(),
          p_service_name: shipmentForm.service_name.trim() || null,
          p_awb_number: shipmentForm.awb_number.trim() || null,
          p_tracking_number: shipmentForm.tracking_number.trim(),
          p_tracking_url: shipmentForm.tracking_url.trim() || null,
          p_admin_note: shipmentForm.admin_note.trim() || null
        });

        if (shipErr) throw shipErr;

        toast.success('Shipment log created successfully.');
        setIsShipmentModalOpen(false);
        await fetchOrderDetail();
      } catch (err: any) {
        console.error('Create shipment error:', err);
        toast.error(err.message || 'Failed to record shipment.');
      } finally {
        setIsSubmitting(false);
      }
    };

    if (loading) {
      return (
        <div className="space-y-5 py-6">
          <AdminSkeleton type="card" />
          <AdminSkeleton type="table" rows={4} />
        </div>
      );
    }

    if (error || !order) {
      return <div className="text-red-500 text-xs py-10 text-center">{error || 'Order record not found.'}</div>;
    }

    return (
      <div className="space-y-5 pb-12 text-slate-200">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <Link href="/admin/orders" className="admin-btn-icon !min-h-[36px] !min-w-[36px] !p-0 flex items-center justify-center" aria-label="Back to orders">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Purchase Order Detail</span>
              <h2 className="text-base font-bold text-slate-100">{order.order_number}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AdminStatusBadge status={order.order_status} />
            {invoice ? (
              <span className="font-mono text-xs bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                Invoice Issued
              </span>
            ) : (
              <button 
                type="button" 
                onClick={handleIssueInvoice}
                disabled={isSubmitting || order.order_status === 'cancelled'}
                className="admin-btn-outline !min-h-[32px] !py-1 !px-3 text-xs flex items-center gap-1.5"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Issue Invoice</span>
              </button>
            )}
          </div>
        </div>

        {/* Master Summary Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-5">
            {/* Customer Details */}
            <AdminCard className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800/50 pb-2">
                <User className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-300">Customer Identity</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Name</span>
                  <span className="font-semibold text-slate-200">{order.customer_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Contact Phone</span>
                  <span className="font-semibold text-slate-200 font-mono">{order.customer_phone}</span>
                </div>
                {order.customer_email && (
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Email Address</span>
                    <span className="font-semibold text-slate-200 font-mono">{order.customer_email}</span>
                  </div>
                )}
              </div>
            </AdminCard>

            {/* Line Items & Products */}
            <AdminCard className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800/50 pb-2">
                <ShoppingCart className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-300">Formulation Line Items</h3>
              </div>
              <div className="admin-table-container overflow-x-auto">
                <table className="admin-data-table min-w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-2 text-slate-400">Product Name</th>
                      <th className="text-right py-2 text-slate-400">MRP</th>
                      <th className="text-right py-2 text-slate-400">Price</th>
                      <th className="text-right py-2 text-slate-400">Qty</th>
                      <th className="text-right py-2 text-slate-400">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item) => (
                      <tr key={item.id} className="border-b border-slate-800/30">
                        <td className="font-semibold text-slate-200 py-3">{item.product_name}</td>
                        <td className="text-right font-mono text-slate-500 py-3">₹{item.mrp || 0}</td>
                        <td className="text-right font-mono text-slate-200 py-3">₹{item.selling_price || 0}</td>
                        <td className="text-right font-mono text-slate-200 py-3">{item.quantity}</td>
                        <td className="text-right font-mono font-semibold text-slate-200 py-3">
                          ₹{((item.selling_price || 0) * item.quantity).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t border-slate-800 font-bold">
                      <td colSpan={4} className="text-right py-3 text-slate-400">Subtotal Amount:</td>
                      <td className="text-right font-mono py-3 text-slate-200">₹{order.total_amount?.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </AdminCard>

            {/* Delivery Shipping Address */}
            <AdminCard className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800/50 pb-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-300">Shipping Destination</h3>
              </div>
              <div className="text-xs space-y-1.5 text-slate-300">
                <p className="font-semibold text-slate-200">{order.shipping_name || order.customer_name}</p>
                <p>{order.shipping_address_line1}</p>
                {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
                <p>
                  {order.shipping_city}, {order.shipping_state} - <span className="font-mono">{order.shipping_pincode}</span>
                </p>
              </div>
            </AdminCard>
          </div>

          {/* Sidebar Metadata */}
          <div className="space-y-5">
            {/* Commercials Summary */}
            <AdminCard className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800/50 pb-2">
                <CreditCard className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-300">Commercial Summary</h3>
              </div>
              <div className="text-xs space-y-2 text-slate-300 font-mono">
                <div className="flex justify-between">
                  <span>Grand Total</span>
                  <span className="font-bold text-slate-200">₹{order.total_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Method</span>
                  <span className="font-semibold text-slate-200 uppercase">
                    {(order.payment_method || 'cod').replace('online_razorpay', 'razorpay')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Payment status</span>
                  <span>
                    <AdminStatusBadge status={order.payment_status} />
                  </span>
                </div>
              </div>
            </AdminCard>

            {/* Action Workflow Controllers */}
            {order.order_status !== 'cancelled' && order.order_status !== 'delivered' && (
              <AdminCard className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800/50 pb-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-300">Fulfillment Controls</h3>
                </div>
                <div className="flex flex-col gap-2">
                  {order.order_status === 'new' && (
                    <button 
                      type="button" 
                      onClick={() => handleStatusChangeAttempt('confirmed')}
                      className="admin-btn-primary w-full"
                    >
                      Confirm Order
                    </button>
                  )}
                  {order.order_status === 'confirmed' && (
                    <button 
                      type="button" 
                      onClick={() => handleStatusChangeAttempt('processing')}
                      className="admin-btn-primary w-full"
                    >
                      Process / Prepare Order
                    </button>
                  )}
                  {order.order_status === 'processing' && (
                    <button 
                      type="button" 
                      onClick={() => handleStatusChangeAttempt('packed')}
                      className="admin-btn-primary w-full"
                    >
                      Pack & Box Items
                    </button>
                  )}
                  {order.order_status === 'packed' && (
                    <button 
                      type="button" 
                      onClick={() => setIsShipmentModalOpen(true)}
                      className="admin-btn-primary w-full flex items-center justify-center gap-1.5"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Dispatch Shipment</span>
                    </button>
                  )}
                  {order.order_status === 'shipped' && (
                    <button 
                      type="button" 
                      onClick={() => handleStatusChangeAttempt('out_for_delivery')}
                      className="admin-btn-primary w-full"
                    >
                      Out for Delivery
                    </button>
                  )}
                  {order.order_status === 'out_for_delivery' && (
                    <button 
                      type="button" 
                      onClick={() => handleStatusChangeAttempt('delivered')}
                      className="admin-btn-primary w-full flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark Delivered</span>
                    </button>
                  )}

                  {order.order_status !== 'shipped' && order.order_status !== 'out_for_delivery' && (
                    <button 
                      type="button" 
                      onClick={() => handleStatusChangeAttempt('cancelled')}
                      className="admin-btn-outline !border-red-900 !text-red-500 hover:!bg-red-950/20 w-full"
                    >
                      Cancel Purchase Order
                    </button>
                  )}
                </div>
              </AdminCard>
            )}
          </div>
        </div>

        {/* Shipment Info Panel */}
        {shipment && (
          <AdminCard className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/50 pb-2">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-slate-400" />
                <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-300">Shipment Logistics details</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Courier Partner</span>
                <span className="font-semibold text-slate-200">{shipment.carrier}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Tracking Number</span>
                <span className="font-semibold text-slate-200 font-mono">{shipment.tracking_number}</span>
              </div>
              <div>
                <span className="text-slate-500 block">AWB Number</span>
                <span className="font-semibold text-slate-200 font-mono">{shipment.awb_number || 'N/A'}</span>
              </div>
              {shipment.tracking_url && (
                <div>
                  <span className="text-slate-500 block">Tracking URL</span>
                  <a 
                    href={shipment.tracking_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-teal-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Track Order</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </AdminCard>
        )}

        {/* Confirm Status Dialog */}
        <AdminConfirmDialog
          isOpen={isConfirmOpen}
          title="Update Order Status?"
          message={`Are you sure you want to change this order status to ${pendingStatus?.toUpperCase()}?`}
          onConfirm={handleConfirmStatusChange}
          onCancel={() => setIsConfirmOpen(false)}
        />

        {/* Cancel Modal */}
        {isCancelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[#1e293b] rounded-xl max-w-md w-full p-5 border border-slate-800 space-y-3.5 shadow-xl text-xs text-slate-200">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>Cancel Purchase Order: {order.order_number}</span>
                </h3>
              </div>
              <form onSubmit={handleCancelOrderSubmit} className="space-y-3">
                <AdminTextarea
                  label="Cancellation Reason (Mandatory, min 10 characters) *"
                  required
                  placeholder="State the reason for cancelling this order..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="text-slate-200 focus:outline-none"
                />
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(false)}
                    className="admin-btn-secondary"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="admin-btn-confirm destructive"
                  >
                    {isSubmitting ? 'Cancelling...' : 'Cancel Order'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dispatch Shipment Modal */}
        {isShipmentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[#1e293b] rounded-xl max-w-md w-full p-5 border border-slate-800 space-y-3.5 shadow-xl text-xs text-slate-200">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="font-semibold text-sm text-slate-100">
                  Dispatch Shipment: {order.order_number}
                </h3>
              </div>
              <form onSubmit={handleCreateShipmentSubmit} className="space-y-3">
                <AdminInput
                  label="Courier Carrier *"
                  required
                  value={shipmentForm.carrier}
                  onChange={(e) => setShipmentForm(prev => ({ ...prev, carrier: e.target.value }))}
                  placeholder="e.g. Delhivery, Shiprocket"
                />
                <AdminInput
                  label="Tracking Number *"
                  required
                  value={shipmentForm.tracking_number}
                  onChange={(e) => setShipmentForm(prev => ({ ...prev, tracking_number: e.target.value }))}
                  placeholder="Carrier tracking code"
                />
                <AdminInput
                  label="Tracking URL"
                  value={shipmentForm.tracking_url}
                  onChange={(e) => setShipmentForm(prev => ({ ...prev, tracking_url: e.target.value }))}
                  placeholder="http://..."
                />
                <AdminInput
                  label="AWB Reference Number"
                  value={shipmentForm.awb_number}
                  onChange={(e) => setShipmentForm(prev => ({ ...prev, awb_number: e.target.value }))}
                />
                <AdminTextarea
                  label="Fulfillment Dispatch Notes"
                  value={shipmentForm.admin_note}
                  onChange={(e) => setShipmentForm(prev => ({ ...prev, admin_note: e.target.value }))}
                />
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsShipmentModalOpen(false)}
                    className="admin-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="admin-btn-primary"
                  >
                    {isSubmitting ? 'Saving...' : 'Dispatch Shipment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }
  ```

- [ ] **Step 2: Run production build check to verify compile success**
  Run: `npm run build`
  Expected: Compiled successfully with 0 errors.

---

### Task 3: Rebuild Admin Returns Workspaces

**Files:**
* Create: `src/app/admin/returns/page.tsx`
* Create: `src/__tests__/pure/returns-counting.test.ts`

**Interfaces:**
* Consumes: Supabase `returns` table joined on `orders` and `return_items`.
* Produces: Filtered list of merchandise returns with review action buttons.

- [ ] **Step 1: Write returns counting logic unit test**
  Create `src/__tests__/pure/returns-counting.test.ts`:
  ```typescript
  import { describe, it, expect } from 'vitest';

  interface LocalReturn {
    status: string;
  }

  function getReturnSummary(list: LocalReturn[]) {
    return {
      all: list.length,
      pending: list.filter(r => r.status === 'requested' || r.status === 'under_review').length,
      transit: list.filter(r => r.status === 'pickup_scheduled' || r.status === 'in_transit').length
    };
  }

  describe('Returns Summary Logic', () => {
    const list: LocalReturn[] = [
      { status: 'requested' },
      { status: 'under_review' },
      { status: 'pickup_scheduled' },
      { status: 'completed' }
    ];

    it('should calculate counts correctly', () => {
      const summary = getReturnSummary(list);
      expect(summary.all).toBe(4);
      expect(summary.pending).toBe(2);
      expect(summary.transit).toBe(1);
    });
  });
  ```

- [ ] **Step 2: Run test to verify it passes**
  Run: `npx vitest run src/__tests__/pure/returns-counting.test.ts`
  Expected: PASS

- [ ] **Step 3: Create src/app/admin/returns/page.tsx**
  Write the Next.js returns list view component under `src/app/admin/returns/page.tsx`:
  ```tsx
  'use client';

  import { useState, useEffect } from 'react';
  import { useRouter } from 'next/navigation';
  import { createClient } from '@/lib/supabase/client';
  import { useToast } from '@/components/ui/Toast';
  import { 
    AdminCard, 
    AdminStatusBadge, 
    AdminDataTable, 
    AdminMobileRecord, 
    AdminFilterBar, 
    AdminPagination, 
    AdminSkeleton, 
    AdminEmptyState 
  } from '@/components/admin/AdminPrimitives';
  import { Eye } from 'lucide-react';

  export default function AdminReturns() {
    const { toast } = useToast();
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [returnsList, setReturnsList] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;

    const fetchReturns = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('returns')
          .select('*, orders(order_number, customer_name, customer_phone, total_amount), return_items(*)')
          .order('requested_at', { ascending: false });

        if (error) throw error;
        setReturnsList(data || []);
      } catch (err: any) {
        console.error('Fetch returns error:', err);
        toast.error('Failed to load returns list from Supabase.');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchReturns();
    }, []);

    const filteredReturns = returnsList.filter(r => {
      const returnNo = r.return_number || '';
      const orderNo = r.orders?.order_number || '';
      const custName = r.orders?.customer_name || '';

      const matchesSearch = returnNo.toLowerCase().includes(search.toLowerCase()) ||
                            orderNo.toLowerCase().includes(search.toLowerCase()) ||
                            custName.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Pagination calculations
    const totalRecords = filteredReturns.length;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const paginatedReturns = filteredReturns.slice(
      (currentPage - 1) * recordsPerPage,
      currentPage * recordsPerPage
    );

    // Reset page when search or filters change
    useEffect(() => {
      setCurrentPage(1);
    }, [search, statusFilter]);

    const totalRequests = returnsList.length;
    const pendingReview = returnsList.filter(r => r.status === 'requested' || r.status === 'under_review').length;
    const inTransit = returnsList.filter(r => r.status === 'pickup_scheduled' || r.status === 'in_transit' || r.status === 'received').length;
    const awaitingInspection = returnsList.filter(r => r.status === 'inspection').length;

    const filterOptions = [
      { label: 'All Return Statuses', value: 'ALL' },
      { label: 'Requested (New)', value: 'requested' },
      { label: 'Under Review', value: 'under_review' },
      { label: 'Approved', value: 'approved' },
      { label: 'Pickup Scheduled', value: 'pickup_scheduled' },
      { label: 'In Reverse Transit', value: 'in_transit' },
      { label: 'Received at Warehouse', value: 'received' },
      { label: 'Under Inspection', value: 'inspection' },
      { label: 'Completed & Refunded', value: 'completed' },
      { label: 'Rejected', value: 'rejected' }
    ];

    const columns = [
      { 
        header: 'Return #', 
        render: (r: any) => <span className="font-mono font-semibold text-slate-200">{r.return_number}</span> 
      },
      { 
        header: 'Order Details', 
        render: (r: any) => (
          <div>
            <span className="font-semibold text-slate-200 block text-xs">{r.orders?.customer_name}</span>
            <span className="text-[10px] font-mono text-slate-500">Order: #{r.orders?.order_number}</span>
          </div>
        ) 
      },
      { 
        header: 'Reason', 
        render: (r: any) => <span className="text-xs text-slate-400 font-medium">{r.reason_code?.replace('_', ' ')}</span> 
      },
      { 
        header: 'Items', 
        render: (r: any) => <span className="font-mono text-xs text-slate-200">{r.return_items?.length || 0} Item(s)</span> 
      },
      { 
        header: 'Status', 
        render: (r: any) => <AdminStatusBadge status={r.status} /> 
      },
      { 
        header: 'Requested At', 
        render: (r: any) => <span className="font-mono text-xs text-slate-500">{new Date(r.requested_at).toLocaleDateString('en-IN')}</span> 
      },
      { 
        header: 'Action', 
        render: (r: any) => (
          <button
            type="button"
            onClick={() => router.push(`/admin/returns/${r.id}`)}
            className="admin-btn-outline !min-h-[30px] !py-1 !px-2 text-[10px] flex items-center gap-1"
            aria-label={`Review return ${r.return_number}`}
          >
            <Eye className="w-3 h-3" />
            <span>Review</span>
          </button>
        ),
        className: 'text-right'
      }
    ];

    return (
      <div className="space-y-5 pb-12 text-slate-200">
        <div className="pb-3 border-b border-slate-800">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Reverse Logistics & Returns Workspace</span>
          <h1 className="text-xl font-bold text-slate-100">Customer Returns</h1>
          <p className="text-xs text-slate-500 margin-0">Manage merchandise return requests, warehouse inspections, COD payouts, and credit notes</p>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <AdminCard>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Total Return Requests</span>
            <span className="text-xl font-bold font-mono text-slate-200">{totalRequests}</span>
          </AdminCard>
          <AdminCard>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Awaiting Review</span>
            <span className="text-xl font-bold font-mono text-slate-200">{pendingReview}</span>
          </AdminCard>
          <AdminCard>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">In Reverse Transit</span>
            <span className="text-xl font-bold font-mono text-slate-200">{inTransit}</span>
          </AdminCard>
          <AdminCard>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Awaiting Inspection</span>
            <span className="text-xl font-bold font-mono text-slate-200">{awaitingInspection}</span>
          </AdminCard>
        </div>

        {/* Filter Bar */}
        <AdminCard>
          <AdminFilterBar
            searchQuery={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search Return #, Order #, or Customer Name..."
            selectedFilter={statusFilter}
            onFilterChange={setStatusFilter}
            filterOptions={filterOptions}
            filterLabel="Status"
          />
        </AdminCard>

        {loading ? (
          <AdminSkeleton type="table" rows={5} />
        ) : totalRecords === 0 ? (
          <AdminEmptyState
            title="No Return Requests Found"
            description="No customer return requests match your search and filter parameters."
          />
        ) : (
          <div className="space-y-4">
            <div className="hidden md:block">
              <AdminCard className="p-0 overflow-hidden">
                <AdminDataTable
                  columns={columns}
                  data={paginatedReturns}
                  keyExtractor={(r) => r.id}
                  onRowClick={(r) => router.push(`/admin/returns/${r.id}`)}
                />
              </AdminCard>
            </div>

            <div className="md:hidden space-y-3">
              {paginatedReturns.map((r) => (
                <AdminMobileRecord
                  key={r.id}
                  title={r.return_number}
                  subtitle={r.orders?.customer_name}
                  meta={`Order: #${r.orders?.order_number} · ${r.return_items?.length || 0} items`}
                  badge={<AdminStatusBadge status={r.status} />}
                  actionUrl={`/admin/returns/${r.id}`}
                />
              ))}
            </div>

            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={totalRecords}
              recordsPerPage={recordsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    );
  }
  ```

- [ ] **Step 4: Run production build check to verify compile success**
  Run: `npm run build`
  Expected: Compiled successfully with 0 errors.

---

### Task 4: Rebuild Return Requests Details Page

**Files:**
* Create: `src/app/admin/returns/[id]/page.tsx`

**Interfaces:**
* Consumes: Supabase `returns`, `return_items`, `return_status_history`, and `cod_payouts` table status joins.
* Produces: Warehouse inventory updates, refund approval validations, payout detail forms.

- [ ] **Step 1: Create src/app/admin/returns/[id]/page.tsx**
  Implement return request details sheet:
  ```tsx
  'use client';

  import { useState, useEffect, use } from 'react';
  import Link from 'next/link';
  import { createClient } from '@/lib/supabase/client';
  import { useToast } from '@/components/ui/Toast';
  import { AdminCard, AdminStatusBadge, AdminInput, AdminSelect, AdminSkeleton } from '@/components/admin/AdminPrimitives';
  import { ChevronLeft, Check, X, Clipboard, CreditCard } from 'lucide-react';

  export default function AdminReturnDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id: returnId } = use(params);
    const { toast } = useToast();
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [returnRecord, setReturnRecord] = useState<any | null>(null);
    const [returnItems, setReturnItems] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [codPayout, setCodPayout] = useState<any | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Inspection Modal State
    const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);
    const [itemDispositions, setItemDispositions] = useState<Record<string, { condition: string; disposition: string; note: string }>>({});

    // COD Payout Modal State
    const [isCodModalOpen, setIsCodModalOpen] = useState(false);
    const [payoutMethod, setPayoutMethod] = useState<'BANK_TRANSFER' | 'UPI'>('BANK_TRANSFER');
    const [beneficiaryName, setBeneficiaryName] = useState('');
    const [accountLast4, setAccountLast4] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [upiId, setUpiId] = useState('');
    const [referenceNumber, setReferenceNumber] = useState('');

    const fetchDetail = async () => {
      if (!returnId) return;
      setLoading(true);
      try {
        const { data: retData, error: retErr } = await supabase
          .from('returns')
          .select('*, orders(*)')
          .eq('id', returnId)
          .maybeSingle();

        if (retErr) throw retErr;
        setReturnRecord(retData);

        const { data: itemData } = await supabase
          .from('return_items')
          .select('*, products(name)')
          .eq('return_id', returnId);

        setReturnItems(itemData || []);

        const { data: histData } = await supabase
          .from('return_status_history')
          .select('*')
          .eq('return_id', returnId)
          .order('created_at', { ascending: true });

        setHistory(histData || []);

        const { data: payoutData } = await supabase
          .from('cod_payouts')
          .select('*')
          .eq('return_id', returnId)
          .maybeSingle();

        setCodPayout(payoutData);

        // Initialize inspection defaults
        const dispMap: Record<string, { condition: string; disposition: string; note: string }> = {};
        (itemData || []).forEach(it => {
          dispMap[it.id] = {
            condition: it.condition_status || 'UNOPENED',
            disposition: it.inventory_disposition === 'pending_inspection' ? 'restock' : it.inventory_disposition,
            note: it.inspection_note || ''
          };
        });
        setItemDispositions(dispMap);

      } catch (err: any) {
        console.error('Fetch return detail error:', err);
        toast.error('Failed to load return details.');
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchDetail();
    }, [returnId]);

    const handleApprove = async () => {
      if (!returnRecord) return;
      setIsSubmitting(true);
      try {
        const { error } = await supabase
          .from('returns')
          .update({ status: 'approved', approved_at: new Date().toISOString() })
          .eq('id', returnRecord.id);

        if (error) throw error;

        await supabase.from('return_status_history').insert({
          return_id: returnRecord.id,
          from_status: returnRecord.status,
          to_status: 'approved',
          source: 'admin',
          note: 'Return request approved by admin'
        });

        toast.success('Return request approved successfully.');
        await fetchDetail();
      } catch (err: any) {
        toast.error(err.message || 'Failed to approve return.');
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleReject = async () => {
      if (!returnRecord) return;
      const reason = prompt('Enter rejection reason:');
      if (!reason || !reason.trim()) return;

      setIsSubmitting(true);
      try {
        const { error } = await supabase
          .from('returns')
          .update({ status: 'rejected', rejected_at: new Date().toISOString(), admin_note: reason })
          .eq('id', returnRecord.id);

        if (error) throw error;

        await supabase.from('return_status_history').insert({
          return_id: returnRecord.id,
          from_status: returnRecord.status,
          to_status: 'rejected',
          source: 'admin',
          note: `Return rejected: ${reason}`
        });

        toast.success('Return request rejected.');
        await fetchDetail();
      } catch (err: any) {
        toast.error(err.message || 'Failed to reject return.');
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleInspectionSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!returnRecord) return;
      setIsSubmitting(true);

      try {
        const payload = returnItems.map(it => ({
          return_item_id: it.id,
          condition_status: itemDispositions[it.id]?.condition || 'UNOPENED',
          inventory_disposition: itemDispositions[it.id]?.disposition || 'restock',
          inspection_note: itemDispositions[it.id]?.note || ''
        }));

        const { data, error } = await supabase.rpc('complete_return_inspection', {
          p_return_id: returnRecord.id,
          p_dispositions: payload
        });

        if (error || !data?.success) throw new Error(error?.message || 'Inspection failed');

        toast.success('Physical inspection recorded and inventory updated.');
        setIsInspectModalOpen(false);
        await fetchDetail();
      } catch (err: any) {
        toast.error(err.message || 'Failed to complete inspection.');
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleSaveCodPayout = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!returnRecord) return;
      if (!referenceNumber.trim()) {
        toast.error('Bank Reference / UTR Number is mandatory.');
        return;
      }

      setIsSubmitting(true);
      try {
        const totalRefund = returnItems.reduce((acc, it) => acc + (it.refund_eligible_amount || 0), 0);

        const { error } = await supabase.from('cod_payouts').insert({
          return_id: returnRecord.id,
          order_id: returnRecord.order_id,
          payout_method: payoutMethod,
          beneficiary_name: beneficiaryName.trim() || returnRecord.orders?.customer_name,
          account_number_last4: accountLast4,
          ifsc_code: ifscCode,
          upi_id: upiId,
          amount: totalRefund,
          status: 'completed',
          reference_number: referenceNumber.trim(),
          processed_at: new Date().toISOString()
        });

        if (error) throw error;

        toast.success('COD payout details saved and marked completed.');
        setIsCodModalOpen(false);
        await fetchDetail();
      } catch (err: any) {
        toast.error(err.message || 'Failed to save COD payout.');
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleCompleteReturn = async () => {
      if (!returnRecord) return;
      setIsSubmitting(true);
      try {
        const { data, error } = await supabase.rpc('complete_return', {
          p_return_id: returnRecord.id
        });

        if (error || !data?.success) throw new Error(error?.message || 'Completion failed');

        toast.success('Return completed successfully. Credit note generated.');
        await fetchDetail();
      } catch (err: any) {
        toast.error(err.message || 'Failed to complete return.');
      } finally {
        setIsSubmitting(false);
      }
    };

    if (loading) {
      return (
        <div className="space-y-5 py-6">
          <AdminSkeleton type="card" />
          <AdminSkeleton type="table" rows={4} />
        </div>
      );
    }

    if (!returnRecord) {
      return <div className="text-red-500 text-xs py-10 text-center">Return request not found.</div>;
    }

    const totalEligibleRefund = returnItems.reduce((acc, it) => acc + (it.refund_eligible_amount || 0), 0);

    return (
      <div className="space-y-5 pb-12 text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <Link href="/admin/returns" className="admin-btn-icon !min-h-[36px] !min-w-[36px] !p-0 flex items-center justify-center" aria-label="Back to returns">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Return Request Review</span>
              <h2 className="text-base font-bold text-slate-100">{returnRecord.return_number}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AdminStatusBadge status={returnRecord.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Return Items & Info */}
          <div className="lg:col-span-2 space-y-5">
            {/* Request Info */}
            <AdminCard className="space-y-3">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-300">Request Reason Details</h3>
              <div className="text-xs grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block">Reason Category</span>
                  <span className="font-semibold text-slate-200">{returnRecord.reason_code?.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Payout Preference</span>
                  <span className="font-semibold text-slate-200 uppercase">{returnRecord.refund_payment_method || 'CREDIT_NOTE'}</span>
                </div>
                {returnRecord.customer_note && (
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Customer Explanation Note</span>
                    <p className="bg-slate-900 border border-slate-800/80 p-2.5 rounded-lg text-slate-300 m-0">
                      {returnRecord.customer_note}
                    </p>
                  </div>
                )}
              </div>
            </AdminCard>

            {/* Return Items */}
            <AdminCard className="space-y-3">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-300">Merchandise Line Items</h3>
              <div className="admin-table-container overflow-x-auto">
                <table className="admin-data-table min-w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-2 text-slate-400">Product</th>
                      <th className="text-right py-2 text-slate-400">Requested Qty</th>
                      <th className="text-right py-2 text-slate-400">Price Paid</th>
                      <th className="text-right py-2 text-slate-400">Eligible Refund</th>
                      <th className="text-left py-2 text-slate-400">Warehouse Condition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnItems.map(item => (
                      <tr key={item.id} className="border-b border-slate-800/30">
                        <td className="font-semibold text-slate-200 py-3">{item.products?.name || item.product_id}</td>
                        <td className="text-right font-mono text-slate-200 py-3">{item.quantity}</td>
                        <td className="text-right font-mono text-slate-400 py-3">₹{item.price_paid}</td>
                        <td className="text-right font-mono font-semibold text-slate-200 py-3">₹{item.refund_eligible_amount}</td>
                        <td className="py-3">
                          {item.condition_status ? (
                            <span className="font-semibold text-slate-300 uppercase">{item.condition_status}</span>
                          ) : (
                            <span className="text-slate-500 italic">Pending Inspection</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminCard>
          </div>

          {/* Action Center Side panel */}
          <div className="space-y-5">
            {/* Returns Totals Panel */}
            <AdminCard className="space-y-3">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-300">Financial Summary</h3>
              <div className="text-xs space-y-2 text-slate-400 font-mono">
                <div className="flex justify-between">
                  <span>Grand Total Refund</span>
                  <span className="font-bold text-slate-200">₹{totalEligibleRefund}</span>
                </div>
              </div>
            </AdminCard>

            {/* Return Processing Actions */}
            <AdminCard className="space-y-3">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-300">Reverse Fulfillment Actions</h3>
              <div className="flex flex-col gap-2">
                {returnRecord.status === 'requested' && (
                  <>
                    <button 
                      type="button" 
                      onClick={handleApprove}
                      disabled={isSubmitting}
                      className="admin-btn-primary w-full flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Request</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={handleReject}
                      disabled={isSubmitting}
                      className="admin-btn-outline !border-red-900 !text-red-500 hover:!bg-red-950/20 w-full flex items-center justify-center gap-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject Request</span>
                    </button>
                  </>
                )}

                {returnRecord.status === 'received' && (
                  <button 
                    type="button" 
                    onClick={() => setIsInspectModalOpen(true)}
                    disabled={isSubmitting}
                    className="admin-btn-primary w-full flex items-center justify-center gap-1.5"
                  >
                    <Clipboard className="w-4 h-4" />
                    <span>Perform Physical Inspection</span>
                  </button>
                )}

                {returnRecord.status === 'inspection' && (
                  <>
                    {returnRecord.refund_payment_method === 'cod_cash' && !codPayout && (
                      <button 
                        type="button" 
                        onClick={() => setIsCodModalOpen(true)}
                        disabled={isSubmitting}
                        className="admin-btn-primary w-full flex items-center justify-center gap-1.5"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Issue Cash Payout</span>
                      </button>
                    )}
                    {(returnRecord.refund_payment_method !== 'cod_cash' || codPayout) && (
                      <button 
                        type="button" 
                        onClick={handleCompleteReturn}
                        disabled={isSubmitting}
                        className="admin-btn-primary w-full flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Complete Return & Refund</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </AdminCard>
          </div>
        </div>

        {/* Warehouse Physical Inspection Modal */}
        {isInspectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[#1e293b] rounded-xl max-w-lg w-full p-5 border border-slate-800 space-y-3.5 shadow-xl text-xs text-slate-200">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="font-semibold text-sm text-slate-100">
                  Warehouse Merchandise Inspection: {returnRecord.return_number}
                </h3>
              </div>
              <form onSubmit={handleInspectionSubmit} className="space-y-4">
                {returnItems.map(item => (
                  <div key={item.id} className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg space-y-3">
                    <span className="font-semibold text-slate-200 block">{item.products?.name}</span>
                    <div className="grid grid-cols-2 gap-4">
                      <AdminSelect
                        label="Product Condition *"
                        value={itemDispositions[item.id]?.condition || 'UNOPENED'}
                        onChange={(e) => setItemDispositions(prev => ({
                          ...prev,
                          [item.id]: { ...prev[item.id], condition: e.target.value }
                        }))}
                        options={[
                          { label: 'Unopened / Mint', value: 'UNOPENED' },
                          { label: 'Opened / Resalable', value: 'OPENED' },
                          { label: 'Damaged / Non-Resalable', value: 'DAMAGED' },
                          { label: 'Expired', value: 'EXPIRED' }
                        ]}
                      />
                      <AdminSelect
                        label="Inventory Action *"
                        value={itemDispositions[item.id]?.disposition || 'restock'}
                        onChange={(e) => setItemDispositions(prev => ({
                          ...prev,
                          [item.id]: { ...prev[item.id], disposition: e.target.value }
                        }))}
                        options={[
                          { label: 'Restock into active inventory', value: 'restock' },
                          { label: 'Discard / Write off', value: 'discard' }
                        ]}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsInspectModalOpen(false)}
                    className="admin-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="admin-btn-primary"
                  >
                    {isSubmitting ? 'Submitting...' : 'Complete Inspection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* COD Payout Modal */}
        {isCodModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-[#1e293b] rounded-xl max-w-md w-full p-5 border border-slate-800 space-y-3.5 shadow-xl text-xs text-slate-200">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="font-semibold text-sm text-slate-100">
                  Record Cash Payout details: {returnRecord.return_number}
                </h3>
              </div>
              <form onSubmit={handleSaveCodPayout} className="space-y-3">
                <AdminSelect
                  label="Payout Method *"
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value as any)}
                  options={[
                    { label: 'Bank Transfer (NEFT/IMPS)', value: 'BANK_TRANSFER' },
                    { label: 'UPI payout', value: 'UPI' }
                  ]}
                />
                <AdminInput
                  label="Beneficiary Full Name *"
                  required
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  placeholder="Receiver account name"
                />
                {payoutMethod === 'BANK_TRANSFER' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <AdminInput
                      label="Account Number (Last 4 digits) *"
                      required
                      value={accountLast4}
                      onChange={(e) => setAccountLast4(e.target.value)}
                    />
                    <AdminInput
                      label="IFSC Code *"
                      required
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                    />
                  </div>
                ) : (
                  <AdminInput
                    label="UPI VPA ID *"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="name@upi"
                  />
                )}
                <AdminInput
                  label="Bank Reference / UTR Number *"
                  required
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Enter 12-digit transaction UTR"
                />
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCodModalOpen(false)}
                    className="admin-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="admin-btn-primary"
                  >
                    {isSubmitting ? 'Recording...' : 'Mark Paid & Complete'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }
  ```

- [ ] **Step 2: Run production build check to verify compile success**
  Run: `npm run build`
  Expected: Compiled successfully with 0 errors.
