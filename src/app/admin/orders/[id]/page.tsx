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
  Download,
  FileText,
  XCircle 
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

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    customerName: '',
    customerPhone: '',
    shippingAddress: '',
    giftMessage: ''
  });

  useEffect(() => {
    if (order) {
      setEditForm({
        customerName: order.customer_name || '',
        customerPhone: order.customer_phone || '',
        shippingAddress: order.shipping_address || order.shipping_address_line1 || '',
        giftMessage: order.gift_message || ''
      });
    }
  }, [order]);

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

  const handleEditOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/orders/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          customerName: editForm.customerName,
          customerPhone: editForm.customerPhone,
          shippingAddress: editForm.shippingAddress,
          giftMessage: editForm.giftMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to update order details.');
      }

      setOrder((prev: any) => ({
        ...prev,
        customer_name: editForm.customerName,
        customer_phone: editForm.customerPhone,
        shipping_address: editForm.shippingAddress,
        gift_message: editForm.giftMessage,
      }));

      toast.success('Order details updated successfully.');
      setIsEditModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ payment_status: 'paid' })
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success('Order payment status marked as PAID.');

      // Auto-issue invoice if missing
      if (!invoice) {
        const { data, error: rpcErr } = await supabase.rpc('issue_order_invoice', { p_order_id: id });
        if (!rpcErr && data?.success) {
          toast.success(`Invoice ${data.invoice_number} automatically issued.`);
          await supabase.functions.invoke('generate-invoice-pdf', {
            body: { invoice_id: data.invoice_id }
          });
        }
      }

      await fetchOrderDetail();
    } catch (err: any) {
      console.error('Mark as paid error:', err);
      toast.error(err.message || 'Failed to update payment status.');
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

      let { error: updateError } = await supabase.rpc(rpcName, rpcArgs);

      // Fallback to direct DB update if RPC function is missing from schema cache
      if (updateError && (updateError.code === 'PGRST202' || updateError.message?.includes('Could not find the function'))) {
        console.warn(`RPC ${rpcName} missing in schema cache, falling back to direct table update.`);
        const updatePayload: Record<string, any> = {
          order_status: pendingStatus,
          updated_at: new Date().toISOString()
        };
        if (pendingStatus === 'delivered') {
          updatePayload.payment_status = 'paid';
        }
        const { error: directErr } = await supabase
          .from('orders')
          .update(updatePayload)
          .eq('id', id);
        updateError = directErr;
      }

      if (updateError) throw updateError;

      // If marked as delivered, automatically set payment status to paid if not already paid
      if (pendingStatus === 'delivered' && order.payment_status !== 'paid') {
        const { error: payErr } = await supabase
          .from('orders')
          .update({ payment_status: 'paid' })
          .eq('id', id);
        if (!payErr) {
          toast.success('Payment status automatically marked as PAID.');
        }
      }

      // Auto-issue invoice on shipment or delivery if missing
      if ((pendingStatus === 'shipped' || pendingStatus === 'delivered') && !invoice) {
        try {
          const { data, error: rpcErr } = await supabase.rpc('issue_order_invoice', { p_order_id: id });
          if (!rpcErr && data?.success) {
            toast.success(`Invoice ${data.invoice_number} automatically issued.`);
            await supabase.functions.invoke('generate-invoice-pdf', {
              body: { invoice_id: data.invoice_id }
            });
          }
        } catch (invErr) {
          console.error('Auto-invoice during status update failed:', invErr);
        }
      }

      await fetchOrderDetail();
      toast.success(`Order updated to ${pendingStatus.toUpperCase()} successfully.`);

      // Trigger SMS and Webhook notifications asynchronously in the background
      fetch('/api/admin/orders/notify-transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, newStatus: pendingStatus })
      }).catch(err => console.error('Failed to send status transition notifications:', err));
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
      let { error: cancelErr } = await supabase.rpc('cancel_order_with_refund_check', {
        p_order_id: id,
        p_reason: cancelReason.trim()
      });

      // Fallback to direct DB update if RPC function is missing from schema cache
      if (cancelErr && (cancelErr.code === 'PGRST202' || cancelErr.message?.includes('Could not find the function'))) {
        console.warn('RPC cancel_order_with_refund_check missing in schema cache, falling back to direct table update.');
        const { error: directErr } = await supabase
          .from('orders')
          .update({
            order_status: 'cancelled',
            cancellation_reason: cancelReason.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
        cancelErr = directErr;
      }

      if (cancelErr) throw cancelErr;

      toast.success('Order cancelled successfully.');
      setIsCancelModalOpen(false);
      await fetchOrderDetail();

      // Trigger SMS and Webhook notifications asynchronously in the background
      fetch('/api/admin/orders/notify-transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, newStatus: 'cancelled' })
      }).catch(err => console.error('Failed to send cancellation notifications:', err));
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

      // Trigger SMS and Webhook notifications asynchronously in the background
      fetch('/api/admin/orders/notify-transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, newStatus: 'shipped' })
      }).catch(err => console.error('Failed to send shipment notifications:', err));

      // Auto-issue invoice on shipment if it hasn't been issued yet
      if (!invoice) {
        try {
          const { data, error: rpcErr } = await supabase.rpc('issue_order_invoice', { p_order_id: id });
          if (!rpcErr && data?.success) {
            toast.success(`Invoice ${data.invoice_number} automatically issued.`);
            await supabase.functions.invoke('generate-invoice-pdf', {
              body: { invoice_id: data.invoice_id }
            });
          }
        } catch (invErr) {
          console.error('Auto-invoice during shipment dispatch failed:', invErr);
        }
      }

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
    <div className="space-y-6 pb-12 font-sans text-slate-700">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between border-b border-[#C9D5D5]/60 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders" className="inline-flex items-center justify-center w-9 h-9 bg-white border border-[#C9D5D5] hover:bg-slate-50 text-[#1A5C5E] rounded-xl transition-all cursor-pointer shadow-xs" aria-label="Back to orders">
            <ChevronLeft size={16} />
          </Link>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purchase Order Detail</span>
            <h2 className="text-xl font-bold text-[#134547]">{order.order_number}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AdminStatusBadge status={order.order_status} />
          {invoice ? (
            <span className="font-mono text-xs bg-slate-100 border border-[#C9D5D5]/60 text-slate-500 px-2 py-0.5 rounded font-bold">
              Invoice Issued
            </span>
          ) : (
             <Link 
            href={`/admin/invoices/${id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#054432] hover:bg-[#032e22] text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <FileText size={14} />
            <span>Print A4 Tax Invoice</span>
          </Link>
          )}
          {!invoice && (
            <button 
              type="button" 
              onClick={handleIssueInvoice}
              disabled={isSubmitting || order.order_status === 'cancelled'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-[#C9D5D5] disabled:opacity-50 text-[#1A5C5E] rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Receipt size={14} />
              <span>Issue Official GST Record</span>
            </button>
          )}
        </div>
      </div>

      {/* Master Summary Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details */}
          <AdminCard className="space-y-4 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between border-b border-[#C9D5D5]/40 pb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#1A5C5E]" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A5C5E]">Customer Identity</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs text-[#1A5C5E] hover:underline font-semibold bg-transparent border-0 cursor-pointer"
              >
                Edit details
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold block mb-0.5">Name</span>
                <span className="font-bold text-slate-800">{order.customer_name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-0.5">Contact Phone</span>
                <span className="font-bold text-slate-800 font-mono">{order.customer_phone}</span>
              </div>
              {order.customer_email && (
                <div className="col-span-2">
                  <span className="text-slate-400 font-bold block mb-0.5">Email Address</span>
                  <span className="font-bold text-slate-800 font-mono">{order.customer_email}</span>
                </div>
              )}
            </div>
          </AdminCard>

          {/* Line Items & Products */}
          <AdminCard className="space-y-4 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#C9D5D5]/40 pb-2">
              <ShoppingCart className="w-4 h-4 text-[#1A5C5E]" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A5C5E]">Formulation Line Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="border-b border-[#C9D5D5]/60 uppercase text-[9px] text-[#1A5C5E] font-bold tracking-wider">
                    <th className="py-2 text-left">Product Name</th>
                    <th className="py-2 text-right">MRP</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C9D5D5]/40 font-semibold text-slate-750">
                  {orderItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="font-bold text-slate-800 py-3">{item.product_name}</td>
                      <td className="text-right font-mono text-slate-400 py-3">₹{item.mrp || 0}</td>
                      <td className="text-right font-mono text-slate-850 py-3">₹{item.selling_price || 0}</td>
                      <td className="text-right font-mono text-slate-800 py-3">{item.quantity}</td>
                      <td className="text-right font-mono font-bold text-slate-800 py-3">
                        ₹{((item.selling_price || 0) * item.quantity).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-[#C9D5D5]/60 font-bold text-slate-800 bg-[#FDF8F0]/30">
                    <td colSpan={4} className="text-right py-3 text-slate-450 uppercase tracking-wide">Subtotal Amount:</td>
                    <td className="text-right font-mono py-3 text-[#134547] font-bold text-sm">₹{order.total_amount?.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </AdminCard>

          {/* Delivery Shipping Address */}
          <AdminCard className="space-y-4 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#C9D5D5]/40 pb-2">
              <MapPin className="w-4 h-4 text-[#1A5C5E]" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A5C5E]">Shipping Destination</h3>
            </div>
            <div className="text-xs space-y-1.5 text-slate-650 font-semibold">
              <p className="font-bold text-slate-800">{order.shipping_name || order.customer_name}</p>
              <p>{order.shipping_address || order.shipping_address_line1}</p>
              {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
              <p>
                {order.city || order.shipping_city}, {order.state || order.shipping_state} - <span className="font-mono text-slate-800 font-bold">{order.pincode || order.shipping_pincode}</span>
              </p>
              {order.gift_message && (
                <div className="mt-3 p-3 bg-amber-50/50 border border-amber-250/30 rounded-xl text-[11px] text-amber-900">
                  <span className="font-bold block text-xs text-amber-950 uppercase tracking-wide mb-1">🎁 Gift Message Included:</span>
                  &ldquo;{order.gift_message}&rdquo;
                </div>
              )}
            </div>
          </AdminCard>
        </div>

        {/* Sidebar Metadata */}
        <div className="space-y-6">
          {/* Commercials Summary */}
          <AdminCard className="space-y-4 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#C9D5D5]/40 pb-2">
              <CreditCard className="w-4 h-4 text-[#1A5C5E]" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A5C5E]">Commercial Summary</h3>
            </div>
            <div className="text-xs space-y-2.5 text-slate-700 font-mono font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold font-sans">Grand Total</span>
                <span className="font-bold text-[#134547] text-sm font-mono">₹{order.total_amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold font-sans">Method</span>
                <span className="font-bold text-slate-800 uppercase">
                  {(order.payment_method || 'cod').replace('online_razorpay', 'razorpay')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold font-sans">Payment status</span>
                <span className="flex items-center gap-1.5">
                  <AdminStatusBadge status={order.payment_status} />
                  {order.payment_status !== 'paid' && order.order_status !== 'cancelled' && (
                    <button
                      type="button"
                      onClick={handleMarkAsPaid}
                      disabled={isSubmitting}
                      className="px-2 py-0.5 bg-white hover:bg-slate-50 border border-[#C9D5D5] text-[#1A5C5E] rounded-md text-[10px] font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                    >
                      Mark Paid
                    </button>
                  )}
                </span>
              </div>
            </div>
          </AdminCard>

          {/* Action Workflow Controllers */}
          {order.order_status !== 'cancelled' && order.order_status !== 'delivered' && (
            <AdminCard className="space-y-4 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
              <div className="flex items-center gap-2 border-b border-[#C9D5D5]/40 pb-2">
                <Clock className="w-4 h-4 text-[#1A5C5E]" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A5C5E]">Fulfillment Controls</h3>
              </div>
              <div className="flex flex-col gap-2">
                {order.order_status === 'new' && (
                  <button 
                    type="button" 
                    onClick={() => handleStatusChangeAttempt('confirmed')}
                    className="w-full px-4 py-2.5 bg-[#1A5C5E] hover:bg-[#134547] text-white rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-95 text-center border-0 shadow-sm"
                  >
                    Confirm Order
                  </button>
                )}
                {order.order_status === 'confirmed' && (
                  <button 
                    type="button" 
                    onClick={() => handleStatusChangeAttempt('processing')}
                    className="w-full px-4 py-2.5 bg-[#1A5C5E] hover:bg-[#134547] text-white rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-95 text-center border-0 shadow-sm"
                  >
                    Process / Prepare Order
                  </button>
                )}
                {order.order_status === 'processing' && (
                  <button 
                    type="button" 
                    onClick={() => handleStatusChangeAttempt('packed')}
                    className="w-full px-4 py-2.5 bg-[#1A5C5E] hover:bg-[#134547] text-white rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-95 text-center border-0 shadow-sm"
                  >
                    Pack & Box Items
                  </button>
                )}
                {order.order_status === 'packed' && (
                  <button 
                    type="button" 
                    onClick={() => setIsShipmentModalOpen(true)}
                    className="w-full px-4 py-2.5 bg-[#1A5C5E] hover:bg-[#134547] text-white rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 border-0 shadow-sm"
                  >
                    <Truck size={14} />
                    <span>Dispatch Shipment</span>
                  </button>
                )}
                {order.order_status === 'shipped' && (
                  <button 
                    type="button" 
                    onClick={() => handleStatusChangeAttempt('out_for_delivery')}
                    className="w-full px-4 py-2.5 bg-[#1A5C5E] hover:bg-[#134547] text-white rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-95 text-center border-0 shadow-sm"
                  >
                    Out for Delivery
                  </button>
                )}
                {order.order_status === 'out_for_delivery' && (
                  <button 
                    type="button" 
                    onClick={() => handleStatusChangeAttempt('delivered')}
                    className="w-full px-4 py-2.5 bg-[#1A5C5E] hover:bg-[#134547] text-white rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 border-0 shadow-sm"
                  >
                    <CheckCircle size={14} />
                    <span>Mark Delivered</span>
                  </button>
                )}

                {order.order_status !== 'shipped' && order.order_status !== 'out_for_delivery' && (
                  <button 
                    type="button" 
                    onClick={() => handleStatusChangeAttempt('cancelled')}
                    className="w-full px-4 py-2.5 bg-red-50 hover:bg-red-105/50 border border-red-200 text-red-650 rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-95 text-center shadow-xs"
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
                  rel="noopener noreferrer"
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
      {/* Edit Order Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#1e293b] rounded-xl max-w-md w-full p-5 border border-slate-800 space-y-3.5 shadow-xl text-xs text-slate-200">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="font-semibold text-sm text-slate-100">
                Edit Order Details: {order.order_number}
              </h3>
            </div>
            <form onSubmit={handleEditOrderSubmit} className="space-y-3">
              <AdminInput
                label="Customer Name *"
                required
                value={editForm.customerName}
                onChange={(e) => setEditForm(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Customer display name"
              />
              <AdminInput
                label="Contact Phone *"
                required
                value={editForm.customerPhone}
                onChange={(e) => setEditForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="Phone number"
              />
              <AdminTextarea
                label="Shipping Address *"
                required
                value={editForm.shippingAddress}
                onChange={(e) => setEditForm(prev => ({ ...prev, shippingAddress: e.target.value }))}
                placeholder="Shipping address destination"
              />
              <AdminTextarea
                label="Gift Message (Optional)"
                value={editForm.giftMessage}
                onChange={(e) => setEditForm(prev => ({ ...prev, giftMessage: e.target.value }))}
                placeholder="Gift message content"
              />
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="admin-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="admin-btn-primary"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
