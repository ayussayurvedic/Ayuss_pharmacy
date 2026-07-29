'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Loader2, 
  Package, 
  Truck, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  MapPin,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function OrderTrackingClient() {
  const { toast } = useToast();
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !phone) return;

    setLoading(true);
    setOrder(null);
    setSearched(false);

    try {
      // Normalize order number format (e.g. prefixing SSP- if user only entered digits)
      let formattedOrderNo = orderNumber.trim().toUpperCase();
      if (/^\d+$/.test(formattedOrderNo)) {
        formattedOrderNo = `SSP-${formattedOrderNo}`;
      }

      const res = await fetch(`/api/orders/track?order_number=${encodeURIComponent(formattedOrderNo)}&phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to retrieve order status');
      }

      setOrder(data.order);
      setSearched(true);
      toast.success('Order status updated.');
    } catch (err: any) {
      toast.error(err.message || 'Verification failed. Please check inputs.');
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (step: string) => {
    if (!order) return 'inactive';
    
    // Map order status to sequence score
    const statusMap: Record<string, number> = {
      'new': 1,
      'confirmed': 2,
      'processing': 2,
      'packed': 2,
      'shipped': 3,
      'out_for_delivery': 3,
      'delivered': 4
    };

    const currentScore = statusMap[order.order_status] || 1;
    const targetScore = statusMap[step] || 1;

    if (currentScore >= targetScore) return 'completed';
    if (currentScore + 1 === targetScore) return 'active';
    return 'inactive';
  };

  const getReadableStatus = (status: string) => {
    switch (status) {
      case 'new': return 'Order Placed';
      case 'confirmed': return 'Order Confirmed';
      case 'processing': return 'Preparing Package';
      case 'packed': return 'Packed & Ready';
      case 'shipped': return 'Shipped / In Transit';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status.toUpperCase();
    }
  };

  return (
    <div className="bg-[#FDF8F0] text-slate-800 pt-24 pb-16 min-h-screen font-sans">
      <div className="max-w-[700px] mx-auto px-6 space-y-8">
        
        {/* Breadcrumb navigation */}
        <div className="flex items-center gap-2 text-[11px] text-[#2A7B7E] font-bold uppercase tracking-wider">
          <Link href="/" className="hover:text-[#1A5C5E] transition-colors">Home</Link>
          <span>•</span>
          <Link href="/products" className="hover:text-[#1A5C5E] transition-colors">Products</Link>
          <span>•</span>
          <span className="text-slate-400">Order Tracking</span>
        </div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold text-[#C9943E] uppercase tracking-wider block">Fulfillment Verification</span>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#1A5C5E] font-bold uppercase">Track Your Order</h1>
          <p className="text-xs text-slate-500 font-light max-w-sm mx-auto">
            Input your order reference number and telephone code to see live delivery updates.
          </p>
        </div>

        {/* Form panel */}
        <form onSubmit={handleTrack} className="bg-white border border-[#C9D5D5] p-5 rounded-2xl shadow-sm space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 mb-1 font-bold uppercase tracking-wider text-[10px]">Order Number *</label>
              <input 
                type="text" 
                placeholder="E.g., SSP-123456" 
                required 
                value={orderNumber} 
                onChange={e => setOrderNumber(e.target.value)} 
                className="w-full border border-[#C9D5D5] p-2.5 rounded-lg outline-none focus:border-[#1A5C5E] text-slate-700 bg-white" 
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 font-bold uppercase tracking-wider text-[10px]">Registered Phone *</label>
              <input 
                type="tel" 
                placeholder="10-digit mobile number" 
                required 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                className="w-full border border-[#C9D5D5] p-2.5 rounded-lg outline-none focus:border-[#1A5C5E] text-slate-700 bg-white" 
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#1A5C5E] hover:bg-[#134547] text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 uppercase cursor-pointer tracking-wider shadow-sm transition-all active:scale-98"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Verify & Locate Order</span>
          </button>
        </form>

        {/* Tracking Details Layout */}
        {order ? (
          <div className="bg-white border border-[#C9D5D5] rounded-2xl shadow-sm p-6 space-y-6 text-xs animate-in fade-in slide-in-from-bottom duration-300">
            
            {/* Header info */}
            <div className="border-b border-[#C9D5D5]/40 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Order Reference</span>
                <span className="font-mono text-sm font-bold text-[#C9943E]">{order.order_number}</span>
              </div>
              <div className="sm:text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Fulfillment Status</span>
                <span className="font-bold text-[#1A5C5E] text-xs uppercase tracking-wide">
                  {getReadableStatus(order.order_status)}
                </span>
              </div>
            </div>

            {/* Stepper progression or Cancelled Block */}
            {order.order_status === 'cancelled' ? (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-rose-800 uppercase tracking-wider text-[10px]">Order Cancelled</span>
                  <p className="text-rose-650 leading-relaxed">
                    This order was cancelled. If you believe this is an error, please contact S.S. Pharmacy support.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Horizontal Stepper */}
                <div className="relative flex justify-between items-start pt-6 pb-2 px-2">
                  <div className="absolute top-[37px] left-[10%] right-[10%] h-0.5 bg-slate-200 z-0" />
                  
                  {[
                    { key: 'new', label: 'Placed', icon: Package },
                    { key: 'processing', label: 'Processing', icon: ClipboardList },
                    { key: 'shipped', label: 'Shipped', icon: Truck },
                    { key: 'delivered', label: 'Delivered', icon: CheckCircle2 }
                  ].map((step, idx) => {
                    const status = getStepStatus(step.key);
                    const StepIcon = step.icon;
                    return (
                      <div key={idx} className="z-10 flex flex-col items-center gap-2 w-16">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                          status === 'completed' 
                            ? 'bg-[#1A5C5E] border-[#1A5C5E] text-white shadow-xs' 
                            : status === 'active'
                            ? 'bg-white border-[#C9943E] text-[#C9943E] ring-2 ring-[#C9943E]/20 animate-pulse'
                            : 'bg-white border-slate-200 text-slate-400'
                        }`}>
                          <StepIcon size={14} />
                        </div>
                        <span className={`text-[9px] uppercase tracking-wider font-bold text-center ${
                          status === 'completed' ? 'text-[#1A5C5E]' :
                          status === 'active' ? 'text-[#C9943E]' : 'text-slate-400'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shipments details if shipped */}
            {order.order_status === 'shipped' && (
              <div className="bg-[#FDF8F0] p-4 rounded-xl border border-[#C9D5D5]/50 flex items-start gap-3">
                <Truck className="w-5 h-5 text-[#C9943E] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-[#1A5C5E] uppercase tracking-wider text-[10px]">Transit Details</span>
                  <p className="text-slate-650 leading-relaxed font-light">
                    Your package has been dispatched. Track directly with the carrier code.
                  </p>
                </div>
              </div>
            )}

            {/* Consignee and Address */}
            <div className="border-t border-[#C9D5D5]/40 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-slate-700">
                  <MapPin size={14} className="text-[#C9943E] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[9px] block">Consignee Address</span>
                    <span className="font-bold text-slate-800 block text-[11px] mt-0.5">{order.customer_name}</span>
                    <span className="text-slate-500 font-light block leading-relaxed mt-0.5">
                      {order.shipping_address}, {order.city}, {order.state} - {order.pincode}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2 text-slate-700">
                  <CreditCard size={14} className="text-[#C9943E] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[9px] block">Payment Summary</span>
                    <span className="font-mono text-slate-600 block mt-0.5">
                      Method: <strong className="text-slate-800 uppercase">{order.payment_method || 'COD'}</strong>
                    </span>
                    <span className="font-mono text-slate-600 block mt-0.5">
                      Status: <strong className="text-[#1A5C5E] uppercase">{order.payment_status}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t border-[#C9D5D5]/40 pt-4 space-y-3">
              <span className="font-bold text-[#1A5C5E] uppercase text-[10px] tracking-wider block">Ordered Items</span>
              <div className="divide-y divide-slate-100">
                {order.order_items && order.order_items.map((item: any) => (
                  <div key={item.id} className="py-2.5 flex justify-between items-center text-slate-700">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-800">{item.product_name}</span>
                      {item.pack_size_snapshot && (
                        <span className="text-[10px] text-slate-400 block">{item.pack_size_snapshot}</span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-slate-500 block">₹{item.unit_price} x {item.quantity}</span>
                      <span className="font-mono font-bold text-slate-800 block mt-0.5">₹{item.total_price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#C9D5D5]/40 pt-4 flex justify-between text-xs font-bold text-slate-900">
              <span className="text-slate-500">Grand Total</span>
              <span className="font-mono text-base text-[#1A5C5E]">₹{order.total_amount}</span>
            </div>
          </div>
        ) : searched && (
          <div className="bg-white border border-[#C9D5D5] rounded-2xl shadow-sm p-6 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-[#C9943E] mx-auto animate-bounce" />
            <h3 className="font-bold text-sm text-[#1A5C5E] uppercase">Order Not Found</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              No matching records found for this combination of Order Number and Phone Number. Please check and try again.
            </p>
          </div>
        )}

        {/* Go back */}
        <div className="text-center pt-2">
          <Link href="/products" className="inline-flex items-center gap-1.5 text-xs text-[#1A5C5E] hover:underline font-bold transition-all bg-transparent cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Products</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
