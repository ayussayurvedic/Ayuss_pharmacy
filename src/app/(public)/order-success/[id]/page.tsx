'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Truck, MessageCircle, Printer, ArrowRight, Loader2, AlertCircle, QrCode, Copy, Check } from 'lucide-react';

interface OrderDetails {
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  paymentStatus: string;
}

export default function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const cleanId = decodeURIComponent(id || '').trim().replace(/^#+/, '');
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (!cleanId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/orders/details?orderNumber=${encodeURIComponent(cleanId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.orderNumber) {
            setOrder(data);
            return;
          }
        }
        
        // If server query returns non-ok (e.g. database sync delay), but ID is valid reference
        if (cleanId.toUpperCase().startsWith('SSP-') || cleanId.length >= 6) {
          setOrder({
            orderNumber: cleanId,
            customerName: 'Valued Customer',
            totalAmount: 0,
            paymentStatus: 'Order Placed',
          });
        }
      } catch (err) {
        console.error('Order query page error:', err);
        if (cleanId.toUpperCase().startsWith('SSP-') || cleanId.length >= 6) {
          setOrder({
            orderNumber: cleanId,
            customerName: 'Valued Customer',
            totalAmount: 0,
            paymentStatus: 'Order Placed',
          });
        }
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [cleanId]);

  // Calculate estimated delivery date range (3 to 5 days from today)
  const today = new Date();
  const deliveryStart = new Date(today.setDate(today.getDate() + 3)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const deliveryEnd = new Date(today.setDate(today.getDate() + 2)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const activeOrderNum = order?.orderNumber || cleanId;
  const [cachedWhatsappUrl, setCachedWhatsappUrl] = useState<string>('');
  const [supportPhone, setSupportPhone] = useState<string>('');

  useEffect(() => {
    async function loadPhoneAndSettings() {
      if (typeof window !== 'undefined') {
        try {
          const storedUrl = sessionStorage.getItem(`ssp_order_whatsapp_${cleanId}`);
          if (storedUrl) {
            setCachedWhatsappUrl(storedUrl);
          }
          const storedPhone = sessionStorage.getItem(`ssp_order_phone_${cleanId}`);
          if (storedPhone) {
            setSupportPhone(storedPhone);
          }
        } catch (e) {
          console.warn('Session storage read error:', e);
        }

        const { fetchSiteSettings, formatWhatsAppNumber } = await import('@/lib/site-settings');
        const settings = await fetchSiteSettings();
        const resolvedPhone = formatWhatsAppNumber(settings.supportPhone);
        if (resolvedPhone) {
          setSupportPhone(resolvedPhone);
        }

        // Auto-open WhatsApp if redirected from checkout
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('openWhatsapp') === '1') {
          const storedUrl = sessionStorage.getItem(`ssp_order_whatsapp_${cleanId}`);
          const defaultMsg = encodeURIComponent(
            `🌿 *AYU S.S. PHARMACY — ORDER CONFIRMATION* 🌿\n━━━━━━━━━━━━━━━━━━━━\n\nHello! I have placed an order on Ayu S.S. Pharmacy.\n\n🆔 *Order Number:* #${activeOrderNum}\n👤 *Customer:* ${order?.customerName || 'Customer'}\n💰 *Total Amount:* ₹${order?.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}\n\nPlease confirm my order. Thank you! 🙏✨`
          );
          const targetUrl = storedUrl || (resolvedPhone ? `https://wa.me/${resolvedPhone}?text=${defaultMsg}` : '');
          
          if (targetUrl) {
            const timer = setTimeout(() => {
              window.location.href = targetUrl;
            }, 800);
            return () => clearTimeout(timer);
          }
        }
      }
    }

    loadPhoneAndSettings();
  }, [cleanId, activeOrderNum, order]);

  const fallbackWhatsappMsg = encodeURIComponent(
    `🌿 *AYU S.S. PHARMACY — ORDER CONFIRMATION* 🌿\n━━━━━━━━━━━━━━━━━━━━\n\nHello! I have placed an order on Ayu S.S. Pharmacy.\n\n🆔 *Order Number:* #${activeOrderNum}\n👤 *Customer:* ${order?.customerName || 'Customer'}\n💰 *Total Amount:* ₹${order?.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}\n\nPlease confirm my order. Thank you! 🙏✨`
  );

  const activeWhatsappUrl = cachedWhatsappUrl || (supportPhone ? `https://wa.me/${supportPhone}?text=${fallbackWhatsappMsg}` : '#');

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
            <h2 className="text-xl font-serif text-rose-700 font-bold">Invalid Order Reference</h2>
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
      <div className="max-w-[480px] w-full mx-auto px-4 text-center space-y-5 border border-[#C9D5D5]/80 p-6 sm:p-8 rounded-2xl bg-white shadow-md">
        
        {/* Success Badge */}
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-serif text-[#1A5C5E] font-bold uppercase tracking-wide">Order Placed!</h1>
          <p className="text-xs text-slate-600 mt-1 font-light">Thank you, {order.customerName}. Your order is recorded in our system.</p>
        </div>

        {/* WhatsApp Order Action Banner */}
        <div className="p-4 bg-emerald-50/90 border border-emerald-300 rounded-2xl text-center space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-xs">
            <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Send Order Details via WhatsApp</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Click below to send your order reference <strong>#{activeOrderNum}</strong> directly to our WhatsApp support for instant confirmation and dispatch updates.
          </p>
          <a
            href={activeWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md uppercase tracking-wider cursor-pointer min-h-[44px]"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Open WhatsApp to Confirm</span>
          </a>
        </div>

        {/* Order Details Summary */}
        <div className="p-4 bg-[#FDFBF7] border border-[#C9D5D5]/60 rounded-xl text-xs space-y-3">
          <div className="flex justify-between border-b border-slate-200/50 pb-2">
            <span className="text-slate-500 font-sans uppercase text-[10px]">Order Number</span>
            <span className="font-bold font-mono text-slate-900">{order.orderNumber}</span>
          </div>

          {order.totalAmount > 0 && (
            <div className="flex justify-between border-b border-slate-200/50 pb-2">
              <span className="text-slate-500 font-sans uppercase text-[10px]">Total Amount</span>
              <span className="font-bold text-[#1A5C5E]">₹{order.totalAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between border-b border-slate-200/50 pb-2">
            <span className="text-slate-500 font-sans uppercase text-[10px]">Payment Status</span>
            <span className="font-bold capitalize text-slate-900">{order.paymentStatus}</span>
          </div>

          <div className="pt-2.5 flex items-center justify-center gap-2 text-[#1A5C5E] font-semibold">
            <Truck className="w-4 h-4 text-[#C9943E] shrink-0" />
            <span>Estimated Delivery: <strong className="text-slate-900">{deliveryStart} - {deliveryEnd}</strong></span>
          </div>
        </div>

        {/* Dynamic UPI Payment QR Code (Optional Pre-Payment via QRServer API) */}
        {order.totalAmount > 0 && (
          <div className="p-4 bg-white border border-[#C9D5D5] rounded-xl text-xs space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 font-bold text-[#1A5C5E]">
                <QrCode className="w-4 h-4 text-[#C9943E]" />
                <span className="uppercase tracking-wider text-[11px]">Instant UPI QR Payment</span>
              </div>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                Optional / COD Active
              </span>
            </div>

            <p className="text-[11px] text-slate-500 font-light text-center leading-relaxed">
              Scan using <strong>Google Pay, PhonePe, Paytm, or BHIM</strong> to pre-pay ₹{order.totalAmount.toFixed(2)}, or choose to pay <strong>Cash on Delivery (COD)</strong> upon arrival.
            </p>

            <div className="flex flex-col items-center justify-center pt-1">
              <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-xs">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    `upi://pay?pa=ayuss.pharmacy@okaxis&pn=S.S.%20Pharmacy&am=${order.totalAmount.toFixed(2)}&tn=${order.orderNumber}&cu=INR`
                  )}&margin=6`}
                  alt="Scan to Pay with UPI"
                  width={170}
                  height={170}
                  className="rounded-lg"
                />
              </div>

            <div className="flex items-center gap-2 mt-3 text-[11px]">
              <span className="text-slate-500 font-mono">UPI ID: <strong>ayuss.pharmacy@okaxis</strong></span>
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText('ayuss.pharmacy@okaxis');
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }
                }}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer min-h-[30px] border ${
                  copied 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-[#1A5C5E]/10 hover:text-[#1A5C5E]'
                }`}
                title="Copy UPI ID"
                aria-label="Copy UPI ID to clipboard"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[40px]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>

          <Link 
            href="/products" 
            className="w-full bg-[#1A5C5E] hover:bg-[#134547] text-white py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wider cursor-pointer shadow-xs min-h-[40px]"
          >
            <span>Shop More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
