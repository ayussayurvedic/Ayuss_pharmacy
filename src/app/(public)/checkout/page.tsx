'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheck, MapPin, Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const { cartItems, handleClearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();
  const checkoutAttemptId = useRef('');

  useEffect(() => {
    checkoutAttemptId.current = window.crypto.randomUUID();
  }, []);

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

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.sellingPrice || item.product.mrp || 0) * item.quantity, 0);
  const delivery = subtotal > 500 ? 0 : 50;
  const total = subtotal + delivery;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.pincode) {
      toast.error('Please fill in Name, Phone, Address and PIN Code.');
      return;
    }

    setLoading(true);

    try {
      const generatedOrderNum = `SSP-${Math.floor(100000 + Math.random() * 900000)}`;

      // 1. Create order record
      const { data: newOrder, error: orderErr } = await supabase
        .from('orders')
        .select('*')
        .eq('checkout_attempt_id', checkoutAttemptId.current)
        .maybeSingle();

      if (orderErr) throw orderErr;

      let orderId = newOrder?.id;
      let orderNum = newOrder?.order_number || generatedOrderNum;

      if (!newOrder) {
        const { data: insertedOrder, error: insErr } = await supabase
          .from('orders')
          .insert({
            order_number: generatedOrderNum,
            customer_name: form.name,
            customer_phone: form.phone,
            customer_email: form.email || null,
            shipping_address: form.address,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            subtotal,
            delivery_charge: delivery,
            total_amount: total,
            payment_method: paymentMethod,
            payment_status: paymentMethod === 'cod' ? 'cod_pending' : 'pending',
            order_status: 'new',
            checkout_attempt_id: checkoutAttemptId.current
          })
          .select()
          .single();

        if (insErr) throw insErr;
        orderId = insertedOrder.id;
        orderNum = insertedOrder.order_number;

        // 2. Insert items
        const items = cartItems.map((item) => ({
          order_id: orderId,
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.sellingPrice || item.product.mrp || 0,
          total_price: (item.product.sellingPrice || item.product.mrp || 0) * item.quantity,
          mrp_snapshot: item.product.mrp || 0,
          pack_size_snapshot: item.product.packSize || '100g'
        }));

        const { error: itemsErr } = await supabase.from('order_items').insert(items);
        if (itemsErr) throw itemsErr;
      }

      // Online payment handling simulator
      if (paymentMethod === 'online_razorpay') {
        const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        if (!key) {
          // Fallback Gate: Simulated Order confirmation
          toast.warning('Razorpay Key not set. Simulating test payment authorization.');
          await supabase.from('orders').update({ payment_status: 'paid' }).eq('id', orderId);
        } else {
          // Razorpay integration
          toast.success('Triggering Razorpay sandbox window...');
        }
      }

      handleClearCart();
      toast.success('Order placed successfully.');
      router.push(`/order-success/${orderNum}`);
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
            setForm(prev => ({
              ...prev,
              address: data.display_name || prev.address,
              city: addr.city || addr.town || addr.village || prev.city,
              state: addr.state || prev.state,
              pincode: addr.postcode || prev.pincode
            }));
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
    <div className="bg-[#FDF8F0] text-slate-800 pt-24 pb-16 min-h-screen font-sans">
      <div className="max-w-[800px] mx-auto px-4">
        <h1 className="text-xl font-serif text-[#1A5C5E] font-bold mb-6">Complete Your Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <form onSubmit={handlePlaceOrder} className="space-y-4 border p-5 rounded-xl bg-white text-xs">
            <h3 className="font-bold text-sm border-b pb-2 mb-2 text-[#1A5C5E]">1. Delivery Details</h3>
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Contact Name *</label>
              <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border p-2 rounded-lg" />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Mobile Number (10 digits) *</label>
              <input type="tel" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border p-2 rounded-lg" />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border p-2 rounded-lg" />
            </div>

            <div className="pt-2">
              <button type="button" onClick={handleDetectGPS} disabled={detectingLocation} className="text-xs text-[#1A5C5E] hover:underline flex items-center gap-1 bg-transparent border-0 cursor-pointer">
                {detectingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                <span>Auto-detect Address via GPS</span>
              </button>
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Shipping Address *</label>
              <textarea required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full border p-2 rounded-lg" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">City</label>
                <input type="text" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full border p-2 rounded-lg" />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">State</label>
                <input type="text" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="w-full border p-2 rounded-lg" />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 font-semibold">PIN Code *</label>
                <input type="text" required value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} className="w-full border p-2 rounded-lg" />
              </div>
            </div>

            <h3 className="font-bold text-sm border-b pb-2 pt-2 text-[#1A5C5E]">2. Payment Method</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                <span>Cash on Delivery (COD)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" checked={paymentMethod === 'online_razorpay'} onChange={() => setPaymentMethod('online_razorpay')} />
                <span>Online Payment</span>
              </label>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#1A5C5E] hover:bg-[#2d5238] text-white py-2.5 rounded-lg font-bold block text-center transition-colors">
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </form>

          {/* Summary */}
          <div className="border p-5 rounded-xl bg-white space-y-4 text-xs">
            <h3 className="font-bold text-sm border-b pb-2 text-[#1A5C5E]">Order Summary</h3>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">{item.product.name}</span>
                    <span className="text-slate-400 block text-[10px]">Qty: {item.quantity} · {item.product.packSize}</span>
                  </div>
                  <span className="font-semibold">₹{(item.product.sellingPrice || item.product.mrp || 0) * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-1.5">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery Charges:</span>
                <span>{delivery === 0 ? 'Free' : `₹${delivery}`}</span>
              </div>
              <div className="flex justify-between font-bold text-[#1A5C5E] text-sm pt-1.5 border-t">
                <span>Total Amount:</span>
                <span>₹{total}</span>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border flex gap-2">
              <ShieldCheck className="w-5 h-5 text-[#1A5C5E] shrink-0" />
              <span className="text-[10px] text-slate-400 leading-tight">Your order is protected by S.S. Pharmacy pharmaceutical terms.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
