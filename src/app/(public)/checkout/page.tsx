'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheck, MapPin, Loader2, Lock, CreditCard, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
  const { cartItems, handleClearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();
  const checkoutAttemptId = useRef('');

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online_razorpay'>('cod');
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    checkoutAttemptId.current = window.crypto.randomUUID();
    
    // Auto-load saved shipping details from localStorage
    try {
      const savedForm = localStorage.getItem('ssp_checkout_form');
      if (savedForm) {
        setForm(JSON.parse(savedForm));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);


  // Auto-save form changes to localStorage
  const updateForm = (updates: Partial<typeof form>) => {
    setForm(prev => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('ssp_checkout_form', JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const handlePincodeChange = async (val: string) => {
    updateForm({ pincode: val });
    if (val.length === 6 && /^\d+$/.test(val)) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice?.length > 0) {
            const po = data[0].PostOffice[0];
            updateForm({
              city: po.District || po.Name || form.city,
              state: po.State || form.state
            });
            toast.success(`PIN Code recognized: ${po.District}, ${po.State}`);
          }
        }
      } catch {
        // Soft fallback
      }
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.sellingPrice || item.product.mrp || 0) * item.quantity, 0);
  const delivery = subtotal > 500 ? 0 : 50;
  const total = subtotal + delivery;

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.pincode) {
      toast.error('Please fill in Name, Phone, Address and PIN Code.');
      return;
    }

    setLoading(true);

    try {
      // 1. Submit order data to the secure server API route
      const res = await fetch('/api/orders/place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          cartItems,
          paymentMethod,
          delivery,
          subtotal,
          total,
          checkoutAttemptId: checkoutAttemptId.current,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to place order.');
      }

      const { orderId, orderNumber } = data;

      // Online payment handling via Razorpay
      if (paymentMethod === 'online_razorpay') {
        const sdkLoaded = await loadRazorpayScript();
        const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

        if (sdkLoaded && razorpayKey && (window as any).Razorpay) {
          const options = {
            key: razorpayKey,
            amount: total * 100, // Amount in paise
            currency: 'INR',
            name: 'S.S. PHARMACY',
            description: `Order #${orderNumber}`,
            image: '/products/logo/logo.webp',
            prefill: {
              name: form.name,
              email: form.email,
              contact: form.phone,
            },
            theme: {
              color: '#1A5C5E',
            },
            handler: async function (response: any) {
              // Verify signature on the server-side securely
              const verifyRes = await fetch('/api/orders/verify-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  orderId,
                  razorpayOrderId: response.razorpay_order_id || 'sandbox_order',
                  razorpayPaymentId: response.razorpay_payment_id || 'sandbox_payment',
                  razorpaySignature: response.razorpay_signature || 'sandbox_signature',
                }),
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok || verifyData.error) {
                toast.error(verifyData.error || 'Payment signature verification failed.');
                return;
              }

              handleClearCart();
              toast.success('Payment verified successfully!');
              router.push(`/order-success/${orderNumber}`);
            },
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
          setLoading(false);
          return;
        } else {
          // Fallback sandbox test authorization using server verification
          toast.warning('Razorpay live SDK fallback. Verifying test payment...');
          const verifyRes = await fetch('/api/orders/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId,
              razorpayOrderId: 'sandbox_order',
              razorpayPaymentId: 'sandbox_payment',
              razorpaySignature: 'sandbox_signature',
            }),
          });
          
          if (!verifyRes.ok) {
            toast.error('Sandbox verification failed.');
            return;
          }
        }
      }

      handleClearCart();
      toast.success('Order placed successfully.');
      router.push(`/order-success/${orderNumber}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported.');
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            updateForm({
              address: data.display_name || form.address,
              city: addr.city || addr.town || addr.village || form.city,
              state: addr.state || form.state,
              pincode: addr.postcode || form.pincode
            });
            toast.success('Location detected!');
          }
        } catch {
          toast.error('Reverse geocode failed.');
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        setDetectingLocation(false);
        toast.error('Permission denied.');
      }
    );
  };

  return (
    <div className="bg-[#FDF8F0] text-slate-800 pt-24 pb-16 min-h-[100dvh] font-sans">
      <div className="max-w-[840px] mx-auto px-4">
        <h1 className="text-xl sm:text-2xl font-serif text-[#1A5C5E] font-bold mb-6">Complete Your Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-5 border border-[#C9D5D5]/80 p-6 rounded-2xl bg-white text-xs shadow-xs">
            <h3 className="font-bold text-sm border-b pb-3 mb-2 text-[#1A5C5E] uppercase tracking-wider">1. Delivery Details</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold text-xs">Contact Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Anjaneyulu Rao"
                  value={form.name} 
                  onChange={e => updateForm({ name: e.target.value })} 
                  className="w-full border border-[#C9D5D5] p-3 rounded-xl min-h-[44px] text-xs font-sans outline-none focus:border-[#1A5C5E]" 
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold text-xs">Mobile Number (10 digits) *</label>
                <input 
                  type="tel" 
                  required 
                  placeholder="e.g. 9848523295"
                  value={form.phone} 
                  onChange={e => updateForm({ phone: e.target.value })} 
                  className="w-full border border-[#C9D5D5] p-3 rounded-xl min-h-[44px] text-xs font-sans outline-none focus:border-[#1A5C5E]" 
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold text-xs">Email Address</label>
                <input 
                  type="email" 
                  placeholder="e.g. name@domain.com"
                  value={form.email} 
                  onChange={e => updateForm({ email: e.target.value })} 
                  className="w-full border border-[#C9D5D5] p-3 rounded-xl min-h-[44px] text-xs font-sans outline-none focus:border-[#1A5C5E]" 
                />
              </div>

              <div className="pt-1">
                <button 
                  type="button" 
                  onClick={handleDetectGPS} 
                  disabled={detectingLocation} 
                  className="text-xs text-[#1A5C5E] hover:underline flex items-center gap-1.5 bg-transparent border-0 cursor-pointer font-semibold"
                >
                  {detectingLocation ? <Loader2 className="w-4 h-4 animate-spin text-[#C9943E]" /> : <MapPin className="w-4 h-4 text-[#C9943E]" />}
                  <span>Auto-detect Address via GPS</span>
                </button>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold text-xs">Shipping Address *</label>
                <textarea 
                  required 
                  rows={2}
                  placeholder="House No, Street, Landmark..."
                  value={form.address} 
                  onChange={e => updateForm({ address: e.target.value })} 
                  className="w-full border border-[#C9D5D5] p-3 rounded-xl text-xs font-sans outline-none focus:border-[#1A5C5E]" 
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold text-[11px]">PIN Code *</label>
                  <input 
                    type="text" 
                    required 
                    maxLength={6}
                    placeholder="e.g. 516309"
                    value={form.pincode} 
                    onChange={e => handlePincodeChange(e.target.value)} 
                    className="w-full border border-[#C9D5D5] p-3 rounded-xl min-h-[44px] text-xs font-sans outline-none focus:border-[#1A5C5E]" 
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold text-[11px]">City</label>
                  <input 
                    type="text" 
                    value={form.city} 
                    onChange={e => updateForm({ city: e.target.value })} 
                    className="w-full border border-[#C9D5D5] p-3 rounded-xl min-h-[44px] text-xs font-sans outline-none focus:border-[#1A5C5E]" 
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1 font-semibold text-[11px]">State</label>
                  <input 
                    type="text" 
                    value={form.state} 
                    onChange={e => updateForm({ state: e.target.value })} 
                    className="w-full border border-[#C9D5D5] p-3 rounded-xl min-h-[44px] text-xs font-sans outline-none focus:border-[#1A5C5E]" 
                  />
                </div>
              </div>
            </div>

            <h3 className="font-bold text-sm border-b pb-3 pt-3 text-[#1A5C5E] uppercase tracking-wider">2. Payment Method</h3>
            <div className="space-y-3">
              <label 
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'cod' ? 'border-[#1A5C5E] bg-[#1A5C5E]/5 shadow-xs' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input 
                    type="radio" 
                    name="payment_method"
                    checked={paymentMethod === 'cod'} 
                    onChange={() => setPaymentMethod('cod')} 
                    className="accent-[#1A5C5E]"
                  />
                  <div>
                    <span className="font-bold block text-xs">Cash on Delivery (COD)</span>
                    <span className="text-[10px] text-slate-500 block">Pay in cash upon doorstep delivery</span>
                  </div>
                </div>
                <CheckCircle className={`w-4 h-4 ${paymentMethod === 'cod' ? 'text-[#1A5C5E]' : 'opacity-0'}`} />
              </label>

              <label 
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'online_razorpay' ? 'border-[#1A5C5E] bg-[#1A5C5E]/5 shadow-xs' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input 
                    type="radio" 
                    name="payment_method"
                    checked={paymentMethod === 'online_razorpay'} 
                    onChange={() => setPaymentMethod('online_razorpay')} 
                    className="accent-[#1A5C5E]"
                  />
                  <div>
                    <span className="font-bold block text-xs">UPI / Credit / Debit Card / NetBanking</span>
                    <span className="text-[10px] text-slate-500 block">Instant authorization via Razorpay</span>
                  </div>
                </div>
                <CreditCard className={`w-4 h-4 ${paymentMethod === 'online_razorpay' ? 'text-[#1A5C5E]' : 'text-slate-400'}`} />
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-[#1A5C5E] hover:bg-[#134547] text-white py-3.5 rounded-full font-bold block text-center transition-colors min-h-[44px] shadow-md uppercase tracking-wider text-xs cursor-pointer"
            >
              {loading ? 'Processing Order...' : `Place Order (₹${total})`}
            </button>
          </form>

          {/* Summary Column */}
          <div className="lg:col-span-5 border border-[#C9D5D5]/80 p-5 rounded-2xl bg-white space-y-4 text-xs shadow-xs">
            <h3 className="font-bold text-sm border-b pb-3 text-[#1A5C5E] uppercase tracking-wider">Order Summary</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                  <div>
                    <span className="font-bold text-slate-900 block">{item.product.name}</span>
                    <span className="text-slate-500 block text-[10px]">Qty: {item.quantity} · {item.product.packSize}</span>
                  </div>
                  <span className="font-bold text-[#1A5C5E]">₹{(item.product.sellingPrice || item.product.mrp || 0) * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charges:</span>
                <span className={delivery === 0 ? 'text-emerald-700 font-bold' : ''}>
                  {delivery === 0 ? 'FREE Express' : `₹${delivery}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-[#1A5C5E] text-sm pt-2 border-t">
                <span>Total Amount:</span>
                <span>₹{total}</span>
              </div>
            </div>

            <div className="bg-[#FDFBF7] p-3.5 rounded-xl border border-[#C9D5D5]/60 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-[#C9943E] shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-600 leading-tight">
                <strong className="block text-slate-800 mb-0.5">256-Bit SSL Encrypted Checkout</strong>
                Your order is protected under S.S. Pharmacy licensed quality terms (Lic No. R-1970/Ayur).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
