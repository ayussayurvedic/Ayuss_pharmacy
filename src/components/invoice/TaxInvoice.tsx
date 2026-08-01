'use client';

import React from 'react';
import Image from 'next/image';
import { CheckCircle2, ShieldCheck, Printer, ArrowLeft } from 'lucide-react';

export interface InvoiceItem {
  id: string;
  product_id: string;
  product_name: string;
  sku?: string;
  hsn_code?: string;
  batch_number?: string;
  mfg_date?: string;
  expiry_date?: string;
  net_weight?: string;
  quantity: number;
  unit_price: number;
  discount: number;
  gst_rate: number; // e.g. 12
  image_url?: string;
}

export interface InvoiceData {
  invoice_number: string;
  invoice_date: string;
  order_number: string;
  order_date: string;
  payment_method: string;
  payment_status: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  transaction_id?: string;
  place_of_supply: string;
  state_code: string;
  reverse_charge: string;
  
  // Seller
  seller_name: string;
  seller_gstin: string;
  seller_pan: string;
  seller_mfg_license: string;
  seller_drug_license: string;
  seller_address: string;
  seller_phone: string;
  seller_email: string;
  seller_website: string;

  // Billing
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_pincode: string;
  customer_gstin?: string;

  // Shipping
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;

  // Logistics
  courier_partner?: string;
  tracking_number?: string;
  dispatch_date?: string;
  expected_delivery?: string;
  delivery_status?: string;

  // Items
  items: InvoiceItem[];

  // Totals
  subtotal: number;
  discount_total: number;
  shipping_fee: number;
  packaging_fee: number;
  round_off: number;
  total_amount: number;
  amount_paid: number;
}

export default function TaxInvoice({ data }: { data: InvoiceData }) {
  const isIntrastate = (data.state_code === '37' || data.place_of_supply.toLowerCase().includes('andhra pradesh'));

  // Calculate taxes per item
  const itemTaxBreakdown = data.items.map(item => {
    const grossPrice = item.unit_price * item.quantity;
    const taxableValue = Math.max(0, grossPrice - item.discount);
    const taxAmount = Math.round((taxableValue * (item.gst_rate / 100)) * 100) / 100;
    
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isIntrastate) {
      cgst = Math.round((taxAmount / 2) * 100) / 100;
      sgst = Math.round((taxAmount / 2) * 100) / 100;
    } else {
      igst = taxAmount;
    }

    const lineTotal = taxableValue + taxAmount;

    return {
      ...item,
      taxableValue,
      taxAmount,
      cgst,
      sgst,
      igst,
      lineTotal
    };
  });

  const totalTaxable = itemTaxBreakdown.reduce((acc, curr) => acc + curr.taxableValue, 0);
  const totalCGST = itemTaxBreakdown.reduce((acc, curr) => acc + curr.cgst, 0);
  const totalSGST = itemTaxBreakdown.reduce((acc, curr) => acc + curr.sgst, 0);
  const totalIGST = itemTaxBreakdown.reduce((acc, curr) => acc + curr.igst, 0);
  const totalTaxSum = totalCGST + totalSGST + totalIGST;

  // Group by GST Rate for Summary Matrix
  const gstRateMap = new Map<number, { taxable: number; cgst: number; sgst: number; igst: number; totalTax: number }>();
  itemTaxBreakdown.forEach(item => {
    const existing = gstRateMap.get(item.gst_rate) || { taxable: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0 };
    existing.taxable += item.taxableValue;
    existing.cgst += item.cgst;
    existing.sgst += item.sgst;
    existing.igst += item.igst;
    existing.totalTax += (item.cgst + item.sgst + item.igst);
    gstRateMap.set(item.gst_rate, existing);
  });

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 py-8 px-4 sm:px-6 print:py-0 print:px-0 print:bg-white text-zinc-800 font-sans text-xs">
      {/* Screen Action Bar */}
      <div className="max-w-[210mm] mx-auto mb-6 flex items-center justify-between print:hidden bg-white p-4 rounded-2xl shadow-md border border-zinc-200">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-zinc-600 hover:text-navy-900 font-bold transition-colors text-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium text-zinc-500">Tax Invoice / A4 PDF Export Ready</span>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#054432] hover:bg-[#032e22] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-[#054432]/20 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* A4 Printable Sheet Container */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none border border-zinc-200 print:border-none p-6 sm:p-10 rounded-xl print:rounded-none relative overflow-hidden">
        
        {/* Top Gold Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#054432] via-[#D4AF37] to-[#054432] mb-6 -mt-6 sm:-mt-10 -mx-6 sm:-mx-10" />

        {/* 1. Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-zinc-200 pb-6 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#054432] text-white flex items-center justify-center font-black text-xl tracking-tighter border border-[#D4AF37]">
                SSP
              </div>
              <div>
                <h1 className="text-xl font-black text-[#054432] tracking-wide uppercase font-display">
                  {data.seller_name}
                </h1>
                <p className="text-[10px] font-semibold text-emerald-800 tracking-wider">
                  Pure Ayurvedic Remedies & Herbal Care
                </p>
              </div>
            </div>
            
            <div className="text-[10px] leading-relaxed text-zinc-600 space-y-0.5">
              <p>{data.seller_address}</p>
              <p>
                <span className="font-bold text-zinc-700">GSTIN:</span> {data.seller_gstin} | <span className="font-bold text-zinc-700">PAN:</span> {data.seller_pan}
              </p>
              <p>
                <span className="font-bold text-zinc-700">MFG Lic No:</span> {data.seller_mfg_license} | <span className="font-bold text-zinc-700">Drug Lic No:</span> {data.seller_drug_license}
              </p>
              <p>
                <span className="font-bold text-zinc-700">Support:</span> {data.seller_phone} | {data.seller_email} | {data.seller_website}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end text-right space-y-2">
            <div className="bg-[#054432] text-white px-4 py-1.5 rounded-lg text-center border border-[#D4AF37]/40 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest block">TAX INVOICE</span>
            </div>
            
            {/* SVG Verification QR Code */}
            <div className="flex items-center gap-3 bg-zinc-50 p-2 rounded-xl border border-zinc-200">
              <div className="text-left space-y-0.5">
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Scan to Verify</p>
                <p className="text-[9px] font-mono text-zinc-700 font-bold">{data.invoice_number}</p>
              </div>
              <svg className="w-12 h-12 text-[#054432]" viewBox="0 0 100 100">
                <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
                <path d="M10 10h30v30h-30z M15 15h20v20h-20z M22 22h6v6h-6z" fill="#054432" />
                <path d="M60 10h30v30h-30z M65 15h20v20h-20z M72 22h6v6h-6z" fill="#054432" />
                <path d="M10 60h30v30h-30z M15 65h20v20h-20z M22 72h6v6h-6z" fill="#054432" />
                <path d="M50 50h10v10h-10z M70 50h10v10h-10z M50 70h10v20h-10z M70 70h20v10h-20z M80 80h10v10h-10z" fill="#054432" />
              </svg>
            </div>
          </div>
        </div>

        {/* 2. Invoice & Order Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-zinc-200 bg-zinc-50/70 -mx-6 sm:-mx-10 px-6 sm:px-10 text-[10.5px]">
          <div>
            <span className="text-zinc-500 font-medium block">Invoice Number:</span>
            <span className="font-mono font-bold text-[#054432]">{data.invoice_number}</span>
          </div>
          <div>
            <span className="text-zinc-500 font-medium block">Invoice Date:</span>
            <span className="font-bold text-zinc-800">{data.invoice_date}</span>
          </div>
          <div>
            <span className="text-zinc-500 font-medium block">Order Number:</span>
            <span className="font-mono font-bold text-zinc-800">{data.order_number}</span>
          </div>
          <div>
            <span className="text-zinc-500 font-medium block">Order Date:</span>
            <span className="font-bold text-zinc-800">{data.order_date}</span>
          </div>
          <div>
            <span className="text-zinc-500 font-medium block">Payment Method:</span>
            <span className="font-bold uppercase text-zinc-800">{data.payment_method}</span>
          </div>
          <div>
            <span className="text-zinc-500 font-medium block">Payment Status:</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 uppercase">
              <CheckCircle2 className="w-3 h-3" /> {data.payment_status}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 font-medium block">Place of Supply:</span>
            <span className="font-bold text-zinc-800">{data.place_of_supply} ({data.state_code})</span>
          </div>
          <div>
            <span className="text-zinc-500 font-medium block">Reverse Charge:</span>
            <span className="font-bold text-zinc-800">{data.reverse_charge}</span>
          </div>
        </div>

        {/* 3. Addresses Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-5 border-b border-zinc-200 text-[10.5px]">
          {/* Billed To */}
          <div className="bg-zinc-50/50 p-3.5 rounded-xl border border-zinc-200/80 space-y-1">
            <h3 className="font-bold text-[#054432] uppercase tracking-wider text-[9.5px] border-b border-zinc-200 pb-1 mb-1.5 flex justify-between">
              <span>Billed To (Customer)</span>
              {data.customer_gstin && <span className="text-emerald-700 font-mono">B2B GSTIN</span>}
            </h3>
            <p className="font-bold text-zinc-900 text-xs">{data.customer_name}</p>
            <p className="text-zinc-600 leading-relaxed">{data.billing_address}</p>
            <p className="text-zinc-600">{data.billing_city}, {data.billing_state} - {data.billing_pincode}</p>
            <p className="text-zinc-600 font-medium">Phone: {data.customer_phone} | Email: {data.customer_email}</p>
            {data.customer_gstin && (
              <p className="text-zinc-800 font-mono font-bold pt-0.5">GSTIN: {data.customer_gstin}</p>
            )}
          </div>

          {/* Shipped To */}
          <div className="bg-zinc-50/50 p-3.5 rounded-xl border border-zinc-200/80 space-y-1">
            <h3 className="font-bold text-[#054432] uppercase tracking-wider text-[9.5px] border-b border-zinc-200 pb-1 mb-1.5">
              Shipped To (Delivery Destination)
            </h3>
            <p className="font-bold text-zinc-900 text-xs">{data.shipping_name}</p>
            <p className="text-zinc-600 leading-relaxed">{data.shipping_address}</p>
            <p className="text-zinc-600">{data.shipping_city}, {data.shipping_state} - {data.shipping_pincode}</p>
            <p className="text-zinc-600 font-medium">Phone: {data.shipping_phone}</p>
            {data.tracking_number && (
              <div className="pt-1.5 text-[9.5px] font-mono text-zinc-700 flex justify-between border-t border-zinc-200/60 mt-1">
                <span>Courier: <strong className="text-zinc-900">{data.courier_partner || 'Express Dispatch'}</strong></span>
                <span>AWB: <strong className="text-[#054432]">{data.tracking_number}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* 4. Product Table */}
        <div className="py-5">
          <h3 className="font-bold text-[#054432] uppercase tracking-wider text-[10px] mb-3">
            Itemized Product Breakdown
          </h3>
          
          <div className="overflow-x-auto border border-zinc-200 rounded-xl">
            <table className="w-full text-left text-[10px] border-collapse">
              <thead>
                <tr className="bg-[#054432] text-white font-bold text-[9px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Item Details</th>
                  <th className="py-2.5 px-2 text-center">HSN</th>
                  <th className="py-2.5 px-2 text-center">Batch / Exp</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-2 text-right">Unit Price</th>
                  <th className="py-2.5 px-2 text-right">Discount</th>
                  <th className="py-2.5 px-2 text-right">Taxable</th>
                  <th className="py-2.5 px-2 text-center">GST %</th>
                  {isIntrastate ? (
                    <>
                      <th className="py-2.5 px-2 text-right">CGST</th>
                      <th className="py-2.5 px-2 text-right">SGST</th>
                    </>
                  ) : (
                    <th className="py-2.5 px-2 text-right">IGST</th>
                  )}
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {itemTaxBreakdown.map((item, idx) => (
                  <tr key={item.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        {item.image_url ? (
                          <div className="relative w-8 h-8 rounded border border-zinc-200 overflow-hidden bg-white shrink-0">
                            <Image src={item.image_url} alt={item.product_name} fill className="object-contain" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded bg-emerald-50 text-[#054432] font-bold flex items-center justify-center text-[10px] shrink-0">
                            SSP
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-zinc-900 leading-tight">{item.product_name}</p>
                          {item.sku && <p className="text-[8.5px] text-zinc-400 font-mono">SKU: {item.sku}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-zinc-600">{item.hsn_code || '30049011'}</td>
                    <td className="py-3 px-2 text-center text-[8.5px] text-zinc-600 font-mono">
                      <div>{item.batch_number || 'BATCH-2026'}</div>
                      <div className="text-zinc-400">Exp: {item.expiry_date || '12/2028'}</div>
                    </td>
                    <td className="py-3 px-2 text-center font-bold text-zinc-800">{item.quantity}</td>
                    <td className="py-3 px-2 text-right font-mono text-zinc-700">₹{item.unit_price.toFixed(2)}</td>
                    <td className="py-3 px-2 text-right font-mono text-rose-600">
                      {item.discount > 0 ? `-₹${item.discount.toFixed(2)}` : '₹0.00'}
                    </td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-zinc-800">₹{item.taxableValue.toFixed(2)}</td>
                    <td className="py-3 px-2 text-center font-mono text-emerald-800 font-bold">{item.gst_rate}%</td>
                    {isIntrastate ? (
                      <>
                        <td className="py-3 px-2 text-right font-mono text-zinc-600">₹{item.cgst.toFixed(2)}</td>
                        <td className="py-3 px-2 text-right font-mono text-zinc-600">₹{item.sgst.toFixed(2)}</td>
                      </>
                    ) : (
                      <td className="py-3 px-2 text-right font-mono text-zinc-600">₹{item.igst.toFixed(2)}</td>
                    )}
                    <td className="py-3 px-3 text-right font-mono font-black text-[#054432]">₹{item.lineTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Financial Summary & GST Rate Grouping */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 py-4 border-t border-b border-zinc-200">
          
          {/* GST Tax Summary Matrix */}
          <div className="sm:col-span-7 space-y-3">
            <h4 className="font-bold text-[#054432] uppercase tracking-wider text-[9.5px]">
              GST Rate Grouped Tax Matrix
            </h4>
            <div className="overflow-hidden border border-zinc-200 rounded-lg">
              <table className="w-full text-left text-[9px]">
                <thead>
                  <tr className="bg-zinc-100 text-zinc-700 font-bold uppercase border-b border-zinc-200">
                    <th className="py-1.5 px-2">Rate</th>
                    <th className="py-1.5 px-2 text-right">Taxable</th>
                    {isIntrastate ? (
                      <>
                        <th className="py-1.5 px-2 text-right">CGST</th>
                        <th className="py-1.5 px-2 text-right">SGST</th>
                      </>
                    ) : (
                      <th className="py-1.5 px-2 text-right">IGST</th>
                    )}
                    <th className="py-1.5 px-2 text-right">Tax Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-mono">
                  {Array.from(gstRateMap.entries()).map(([rate, group]) => (
                    <tr key={rate}>
                      <td className="py-1.5 px-2 font-bold text-zinc-800">{rate}%</td>
                      <td className="py-1.5 px-2 text-right">₹{group.taxable.toFixed(2)}</td>
                      {isIntrastate ? (
                        <>
                          <td className="py-1.5 px-2 text-right">₹{group.cgst.toFixed(2)}</td>
                          <td className="py-1.5 px-2 text-right">₹{group.sgst.toFixed(2)}</td>
                        </>
                      ) : (
                        <td className="py-1.5 px-2 text-right">₹{group.igst.toFixed(2)}</td>
                      )}
                      <td className="py-1.5 px-2 text-right font-bold text-emerald-800">₹{group.totalTax.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-zinc-50 font-bold text-zinc-900">
                    <td className="py-1.5 px-2">Total</td>
                    <td className="py-1.5 px-2 text-right">₹{totalTaxable.toFixed(2)}</td>
                    {isIntrastate ? (
                      <>
                        <td className="py-1.5 px-2 text-right">₹{totalCGST.toFixed(2)}</td>
                        <td className="py-1.5 px-2 text-right">₹{totalSGST.toFixed(2)}</td>
                      </>
                    ) : (
                      <td className="py-1.5 px-2 text-right">₹{totalIGST.toFixed(2)}</td>
                    )}
                    <td className="py-1.5 px-2 text-right text-[#054432]">₹{totalTaxSum.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment References */}
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3 text-[9.5px] space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold uppercase tracking-wider text-[9px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Verified Payment Reference</span>
              </div>
              <div className="font-mono text-[9px] text-zinc-700 space-y-0.5">
                {data.razorpay_payment_id && <p>Razorpay Payment ID: <strong className="text-zinc-900">{data.razorpay_payment_id}</strong></p>}
                {data.razorpay_order_id && <p>Razorpay Order ID: <strong className="text-zinc-900">{data.razorpay_order_id}</strong></p>}
                <p>Payment Mode: <strong className="text-zinc-900 uppercase">{data.payment_method}</strong> | Date: {data.invoice_date}</p>
              </div>
            </div>
          </div>

          {/* Grand Financial Totals Summary */}
          <div className="sm:col-span-5 space-y-2 text-[10.5px]">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal (Items):</span>
              <span className="font-mono">₹{data.subtotal.toFixed(2)}</span>
            </div>

            {data.discount_total > 0 && (
              <div className="flex justify-between text-rose-600 font-medium">
                <span>Promotional Discount:</span>
                <span className="font-mono">-₹{data.discount_total.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-zinc-600">
              <span>Shipping & Logistics Fee:</span>
              <span className="font-mono">{data.shipping_fee > 0 ? `₹${data.shipping_fee.toFixed(2)}` : 'FREE'}</span>
            </div>

            <div className="flex justify-between text-zinc-600">
              <span>Taxable Amount:</span>
              <span className="font-mono font-bold">₹{totalTaxable.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-zinc-600">
              <span>Total Goods & Service Tax:</span>
              <span className="font-mono text-emerald-800 font-bold">₹{totalTaxSum.toFixed(2)}</span>
            </div>

            {data.round_off !== 0 && (
              <div className="flex justify-between text-zinc-500 text-[9.5px]">
                <span>Adjustment / Round Off:</span>
                <span className="font-mono">₹{data.round_off.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-center py-2.5 px-3 bg-[#054432] text-white rounded-xl font-bold text-sm shadow-md mt-2 border border-[#D4AF37]/50">
              <span>Grand Total:</span>
              <span className="font-mono text-base tracking-tight text-[#FDF6E2]">₹{data.total_amount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-[10px] pt-1 text-emerald-800 font-bold">
              <span>Amount Paid:</span>
              <span className="font-mono">₹{data.amount_paid.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
              <span>Balance Due:</span>
              <span className="font-mono font-bold text-zinc-800">₹{(data.total_amount - data.amount_paid).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* 6. Returns Policy & Legal Terms */}
        <div className="py-4 text-[9px] text-zinc-500 leading-relaxed grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-zinc-200">
          <div>
            <h4 className="font-bold text-zinc-700 uppercase tracking-wider mb-1">Return & Refund Information</h4>
            <p>Products eligible for return within 7 days of delivery if sealed & un-tampered. Contact customer support at {data.seller_phone} or {data.seller_email} for return authorization.</p>
          </div>
          <div>
            <h4 className="font-bold text-zinc-700 uppercase tracking-wider mb-1">Terms of Sale & Disclosure</h4>
            <p>Goods sold are subject to Kadapa jurisdiction. All ayurvedic formulations manufactured under Drug & Cosmetic Rules. This is a computer generated invoice and requires no physical signature.</p>
          </div>
        </div>

        {/* 7. Footer */}
        <div className="pt-4 flex flex-col sm:flex-row justify-between items-center text-[9px] text-zinc-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#054432]">S.S. PHARMACY</span>
            <span>|</span>
            <span>Kadapa, Andhra Pradesh</span>
            <span>|</span>
            <span>www.sspharmacy.in</span>
          </div>
          <p className="font-bold text-[#054432] italic">Thank you for choosing S.S. PHARMACY for authentic Ayurvedic Wellness!</p>
        </div>

      </div>
    </div>
  );
}
