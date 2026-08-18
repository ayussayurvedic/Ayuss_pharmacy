'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { getDefaultProductImage } from '@/data/products';
import { useToast } from '@/components/ui/Toast';
import { ShieldCheck, MapPin, Loader2, Lock, CreditCard, CheckCircle, Navigation } from 'lucide-react';
import { getIndianStates, getDistricts, getCities, findStateByDistrict } from '@/data/india-geo';

export default function CheckoutPage() {
  const { cartItems, handleClearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const checkoutAttemptId = useRef('');

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online_razorpay'>('cod');
  const [giftMessage, setGiftMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    district: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [resolvingPincode, setResolvingPincode] = useState(false);
  const [availableLocalities, setAvailableLocalities] = useState<string[]>([]);

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
    const cleanVal = val.replace(/\D/g, '').slice(0, 6);
    updateForm({ pincode: cleanVal });

    if (cleanVal.length === 6) {
      setResolvingPincode(true);
      try {
        const res = await fetch(`/api/pincode?code=${cleanVal}`);
        const data = await res.json();
        if (res.ok && data.success) {
          updateForm({
            city: data.city || data.postOffice || form.city,
            district: data.district || form.district,
            state: data.state || form.state
          });
          if (data.availableLocalities && Array.isArray(data.availableLocalities)) {
            setAvailableLocalities(data.availableLocalities);
          }
          toast.success(`PIN Code detected: ${data.city || data.district}, ${data.state}`);
        } else {
          toast.error(data.error || 'PIN code not recognized. Please enter City/State manually.');
        }
      } catch {
        // Soft fallback
      } finally {
        setResolvingPincode(false);
      }
    } else {
      if (availableLocalities.length > 0) {
        setAvailableLocalities([]);
      }
    }
  };

  const handleDistrictChange = (val: string) => {
    updateForm({ district: val });
    const inferred = findStateByDistrict(val);
    if (inferred && (!form.state || form.state.trim() === '')) {
      updateForm({ district: val, state: inferred });
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
          city: form.city || form.district,
          state: form.state,
          pincode: form.pincode,
          cartItems,
          paymentMethod,
          delivery,
          subtotal,
          total,
          checkoutAttemptId: checkoutAttemptId.current,
          giftMessage: giftMessage || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to place order.');
      }

      const { orderId, orderNumber, total: serverTotal } = data;
      const finalTotal = typeof serverTotal === 'number' ? serverTotal : total;

      // Online payment handling via Razorpay
      if (paymentMethod === 'online_razorpay') {
        const sdkLoaded = await loadRazorpayScript();
        const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

        if (sdkLoaded && razorpayKey && (window as any).Razorpay) {
          const options = {
            key: razorpayKey,
            amount: Math.round(finalTotal * 100), // Amount in paise
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
              try {
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
              } catch (verifyErr) {
                console.error('Payment verification failed:', verifyErr);
                toast.error('Payment verification failed. Please try again or contact support.');
              }
            },
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
          setLoading(false);
          return;
        } else {
          // Fallback sandbox test authorization using server verification
          toast.warning('Razorpay live SDK fallback. Verifying test payment...');
          try {
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
          } catch (sandboxErr) {
            console.error('Sandbox verification failed:', sandboxErr);
            toast.error('Sandbox verification failed.');
            return;
          }
        }
      }

      // 2. Open WhatsApp with complete order details (formatted with rich emojis & card layout)
      const paymentModeLabel = paymentMethod === 'online_razorpay' ? '💳 Online Paid (Razorpay)' : '💵 Cash on Delivery (COD)';

      const itemsList = cartItems
        .map((item) => `  ▫️ *${item.product.name}*\n     Qty: ${item.quantity} × ₹${((item.product.sellingPrice || item.product.mrp || 0)).toFixed(2)} = *₹${(((item.product.sellingPrice || item.product.mrp || 0) * item.quantity)).toFixed(2)}*`)
        .join('\n\n');

      const message = `🌿 *AYU S.S. PHARMACY — NEW ORDER* 🌿
━━━━━━━━━━━━━━━━━━━━

Hello Ayu S.S. Pharmacy! I have placed an order on your store.

🧾 *ORDER SUMMARY:*
🆔 *Order ID:* #${orderNumber}
💰 *Total Amount:* ₹${finalTotal.toFixed(2)}
💳 *Payment Mode:* ${paymentModeLabel}

📦 *ITEMS ORDERED:*
━━━━━━━━━━━━━━━━━━━━
${itemsList}

📍 *DELIVERY DETAILS:*
━━━━━━━━━━━━━━━━━━━━
👤 *Name:* ${form.name}
📞 *Phone:* ${form.phone}
✉️ *Email:* ${form.email || 'N/A'}
🏠 *Shipping Address:*
${form.address}, ${form.city}${form.district && form.district !== form.city ? `, ${form.district}` : ''}, ${form.state} - ${form.pincode}
${giftMessage ? `\n🎁 *Gift Note:* ${giftMessage}` : ''}
🚚 *Estimated Delivery:* 3 to 5 Business Days

Please confirm my order. Thank you! 🙏✨`;

      const encodedMessage = encodeURIComponent(message);
      
      // Fetch dynamic WhatsApp phone from DB
      const { fetchSiteSettings, formatWhatsAppNumber } = await import('@/lib/site-settings');
      const siteSettings = await fetchSiteSettings();
      const targetPhone = formatWhatsAppNumber(siteSettings.supportPhone);
      const whatsappUrl = targetPhone ? `https://wa.me/${targetPhone}?text=${encodedMessage}` : '#';

      // Save order message in sessionStorage for reliable fallback & direct opening
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(`ssp_order_msg_${orderNumber}`, message);
          if (whatsappUrl !== '#') {
            sessionStorage.setItem(`ssp_order_whatsapp_${orderNumber}`, whatsappUrl);
          }
          if (targetPhone) {
            sessionStorage.setItem(`ssp_order_phone_${orderNumber}`, targetPhone);
          }
        } catch (storageErr) {
          console.warn('Could not cache WhatsApp order message in sessionStorage:', storageErr);
        }
      }

      handleClearCart();
      toast.success('Order placed successfully! Opening WhatsApp...');
      router.push(`/order-success/${orderNumber}?openWhatsapp=1`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`/api/pincode?lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (res.ok && data.success) {
            updateForm({
              address: data.streetAddress || data.formattedAddress || form.address,
              city: data.city || form.city,
              district: data.district || form.district,
              state: data.state || form.state,
              pincode: data.pincode || form.pincode
            });
            toast.success(`Location detected: ${data.city || data.district}, ${data.state} ${data.pincode ? `(${data.pincode})` : ''}`);
          } else {
            toast.error(data.error || 'Failed to detect location from GPS coordinates.');
          }
        } catch {
          toast.error('Location service unavailable. Please enter address manually.');
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        setDetectingLocation(false);
        if (err.code === 1) {
          toast.error('Location access was denied. Please allow location permissions or type manually.');
        } else {
          toast.error('Unable to retrieve your GPS coordinates.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <div className="bg-[#FDF8F0] text-slate-800 pt-24 pb-16 min-h-[100dvh] font-sans">
      <div className="max-w-[960px] mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[11px] text-[#2A7B7E] font-medium mb-4 uppercase tracking-wider">
          <Link href="/" className="hover:text-[#1A5C5E] transition-colors">Home</Link>
          <span>•</span>
          <Link href="/products" className="hover:text-[#1A5C5E] transition-colors">Products</Link>
          <span>•</span>
          <span className="text-slate-400">Checkout</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-serif text-[#1A5C5E] font-bold mb-6">Complete Your Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-5 border border-[#C9D5D5]/80 p-6 sm:p-7 rounded-2xl bg-white text-xs shadow-xs">
            <h3 className="font-bold text-sm border-b pb-3 mb-2 text-[#1A5C5E] uppercase tracking-wider">1. Delivery Details</h3>
            
            <div className="space-y-3.5">
              <div>
                <label htmlFor="checkout-name" className="block text-slate-700 mb-1 font-semibold text-xs">Contact Name *</label>
                <input 
                  id="checkout-name"
                  type="text" 
                  required 
                  autoComplete="name"
                  placeholder="e.g. Anjaneyulu Rao"
                  value={form.name} 
                  onChange={e => updateForm({ name: e.target.value })} 
                  className="w-full border border-[#C9D5D5] p-3 rounded-xl min-h-[46px] text-xs sm:text-[13px] font-sans outline-none focus:border-[#1A5C5E]" 
                />
              </div>

              <div>
                <label htmlFor="checkout-phone" className="block text-slate-700 mb-1 font-semibold text-xs">Mobile Number (10 digits) *</label>
                <input 
                  id="checkout-phone"
                  type="tel" 
                  required 
                  autoComplete="tel"
                  placeholder="e.g. 9876543210"
                  value={form.phone} 
                  onChange={e => updateForm({ phone: e.target.value })} 
                  className="w-full border border-[#C9D5D5] p-3 rounded-xl min-h-[46px] text-xs sm:text-[13px] font-sans outline-none focus:border-[#1A5C5E]" 
                />
              </div>

              <div>
                <label htmlFor="checkout-email" className="block text-slate-700 mb-1 font-semibold text-xs">Email Address</label>
                <input 
                  id="checkout-email"
                  type="email" 
                  autoComplete="email"
                  placeholder="e.g. name@domain.com"
                  value={form.email} 
                  onChange={e => updateForm({ email: e.target.value })} 
                  className="w-full border border-[#C9D5D5] p-3 rounded-xl min-h-[46px] text-xs sm:text-[13px] font-sans outline-none focus:border-[#1A5C5E]" 
                />
              </div>

              <div className="pt-1">
                <button 
                  type="button" 
                  onClick={handleDetectGPS} 
                  disabled={detectingLocation} 
                  className="text-xs text-[#1A5C5E] hover:underline flex items-center gap-1.5 bg-transparent border-0 cursor-pointer font-semibold min-h-[44px]"
                >
                  {detectingLocation ? <Loader2 className="w-4 h-4 animate-spin text-[#C9943E]" /> : <MapPin className="w-4 h-4 text-[#C9943E]" />}
                  <span>{detectingLocation ? 'Detecting current location...' : 'Use Current Location'}</span>
                </button>
              </div>

              <div>
                <label htmlFor="checkout-address" className="block text-slate-700 mb-1 font-semibold text-xs">Shipping Address (Door / Street) *</label>
                <textarea 
                  id="checkout-address"
                  required 
                  rows={2}
                  autoComplete="street-address"
                  placeholder="House No, Street, Landmark..."
                  value={form.address} 
                  onChange={e => updateForm({ address: e.target.value })} 
                  className="w-full border border-[#C9D5D5] p-3 rounded-xl min-h-[60px] text-xs sm:text-[13px] font-sans outline-none focus:border-[#1A5C5E]" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="checkout-pincode" className="block text-slate-700 font-semibold text-xs">PIN Code *</label>
                    {resolvingPincode && <Loader2 className="w-3 h-3 animate-spin text-[#C9943E]" />}
                  </div>
                  <input 
                    id="checkout-pincode"
                    type="text" 
                    required 
                    maxLength={6}
                    autoComplete="postal-code"
                    placeholder="e.g. 516309"
                    value={form.pincode} 
                    onChange={e => handlePincodeChange(e.target.value)} 
                    className="w-full border border-[#C9D5D5] p-3 rounded-xl min-h-[46px] text-xs sm:text-[13px] font-sans outline-none focus:border-[#1A5C5E]" 
                  />
                </div>
                <div>
                  <label htmlFor="checkout-city" className="block text-slate-700 mb-1 font-semibold text-xs">City / Town *</label>
                  <input 
                    id="checkout-city"
                    type="text" 
                    list="city-suggestions"
                    autoComplete="address-level2"
                    placeholder="e.g. Yerraguntla"
                    value={form.city} 
                    onChange={e => updateForm({ city: e.target.value })} 
                    className="w-full border border-[#C9D5D5] p-3 rounded-xl min-h-[46px] text-xs sm:text-[13px] font-sans outline-none focus:border-[#1A5C5E]" 
                  />
                  <datalist id="city-suggestions">
                    {getCities(form.state, form.district, form.city).map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label htmlFor="checkout-district" className="block text-slate-700 mb-1 font-semibold text-xs">District</label>
                  <input 
                    id="checkout-district"
                    type="text" 
                    list="district-suggestions"
                    placeholder="e.g. YSR Kadapa"
                    value={form.district} 
                    onChange={e => handleDistrictChange(e.target.value)} 
                    className="w-full border border-[#C9D5D5] p-3 rounded-xl min-h-[46px] text-xs sm:text-[13px] font-sans outline-none focus:border-[#1A5C5E]" 
                  />
                  <datalist id="district-suggestions">
                    {getDistricts(form.state, form.district).map(d => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label htmlFor="checkout-state" className="block text-slate-700 mb-1 font-semibold text-xs">State *</label>
                  <input 
                    id="checkout-state"
                    type="text" 
                    list="state-suggestions"
                    autoComplete="address-level1"
                    placeholder="e.g. Andhra Pradesh"
                    value={form.state} 
                    onChange={e => updateForm({ state: e.target.value })} 
                    className="w-full border border-[#C9D5D5] p-3 rounded-xl min-h-[46px] text-xs sm:text-[13px] font-sans outline-none focus:border-[#1A5C5E]" 
                  />
                  <datalist id="state-suggestions">
                    {getIndianStates(form.state).map(s => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Quick Area / Locality Selection Pills (when available from Postal API) */}
              {availableLocalities.length > 0 && (
                <div className="p-3 bg-[#FDFBF7] border border-[#C9D5D5]/80 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-[11px]">
                    <Navigation className="w-3.5 h-3.5 text-[#C9943E]" />
                    <span>Select Area / Locality:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {availableLocalities.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => {
                          updateForm({ city: loc });
                          toast.success(`Locality selected: ${loc}`);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer border ${
                          form.city.toLowerCase() === loc.toLowerCase()
                            ? 'bg-[#1A5C5E] text-white border-[#1A5C5E] shadow-2xs'
                            : 'bg-white text-slate-700 border-[#C9D5D5] hover:border-[#1A5C5E] hover:bg-slate-50'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-slate-700 mb-1 font-semibold text-xs">Gift Message (Optional)</label>
                <textarea 
                  rows={2}
                  placeholder="Write a custom gift card message here..."
                  value={giftMessage} 
                  onChange={e => setGiftMessage(e.target.value)} 
                  className="w-full border border-[#C9D5D5] p-3 rounded-xl text-xs font-sans outline-none focus:border-[#1A5C5E]" 
                />
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
                    <span className="font-bold block text-xs">Cash on Delivery (COD) / WhatsApp Order</span>
                    <span className="text-[10px] text-slate-500 block">Confirm your order details instantly via WhatsApp</span>
                  </div>
                </div>
                <CheckCircle className={`w-4 h-4 ${paymentMethod === 'cod' ? 'text-[#1A5C5E]' : 'opacity-0'}`} />
              </label>

              {/* Hiding Online Payment option for now - to be restored when Razorpay credentials are ready */}
              {/* 
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
              */}
            </div>

            {/* Statutory Pharmaceutical Disclaimers */}
            <div className="p-3.5 rounded-xl bg-[#1A5C5E]/5 border border-[#1A5C5E]/15 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#1A5C5E]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9943E]" />
                <span>Statutory Ayurvedic Licensing & Quality Assurance</span>
              </div>
              <p className="leading-relaxed font-light text-slate-600">
                • <strong>Mfg. Lic. No: R-1970/Ayur</strong> (AYUSH Dept., Govt. of Andhra Pradesh).<br />
                • Formulated under Schedule T GMP guidelines with 100% natural botanical extracts.<br />
                • Ayurvedic proprietary formulation. Consult your healthcare practitioner for individual diagnoses.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-[#1A5C5E] hover:bg-[#134547] disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3.5 rounded-full font-bold block text-center transition-colors min-h-[44px] shadow-md uppercase tracking-wider text-xs cursor-pointer"
            >
              {loading ? 'Processing Order...' : `Place Order via WhatsApp (₹${total})`}
            </button>
          </form>

          {/* Summary Column */}
          <div className="lg:col-span-5 border border-[#C9D5D5]/80 p-5 rounded-2xl bg-white space-y-4 text-xs shadow-xs">
            <h3 className="font-bold text-sm border-b pb-3 text-[#1A5C5E] uppercase tracking-wider">Order Summary</h3>
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center gap-3 border-b pb-2.5 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                      <Image 
                        src={item.product.image || getDefaultProductImage(item.product.id)}
                        alt={item.product.name}
                        width={44}
                        height={44}
                        className="object-contain max-h-full max-w-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 block truncate">{item.product.name}</span>
                      <span className="text-slate-500 block text-[10px] mt-0.5 font-medium">Qty: {item.quantity} · {item.product.packSize}</span>
                    </div>
                  </div>
                  <span className="font-bold text-[#1A5C5E] shrink-0 text-right">₹{(item.product.sellingPrice || item.product.mrp || 0) * item.quantity}</span>
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
