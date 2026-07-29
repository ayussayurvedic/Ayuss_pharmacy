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
    <div className="space-y-6 pb-12 font-sans text-slate-700">
      <div className="flex items-center justify-between border-b border-[#C9D5D5]/60 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/returns" className="inline-flex items-center justify-center w-9 h-9 bg-white border border-[#C9D5D5] hover:bg-slate-50 text-[#1A5C5E] rounded-xl transition-all cursor-pointer shadow-xs" aria-label="Back to returns">
            <ChevronLeft size={16} />
          </Link>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Return Request Review</span>
            <h2 className="text-xl font-bold text-[#134547]">{returnRecord.return_number}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AdminStatusBadge status={returnRecord.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Return Items & Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Info */}
          <AdminCard className="space-y-4 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A5C5E]">Request Reason Details</h3>
            <div className="text-xs grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 font-bold block mb-0.5">Reason Category</span>
                <span className="font-bold text-slate-800">{returnRecord.reason_code?.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-0.5">Payout Preference</span>
                <span className="font-bold text-[#134547] uppercase">{returnRecord.refund_payment_method || 'CREDIT_NOTE'}</span>
              </div>
              {returnRecord.customer_note && (
                <div className="col-span-2">
                  <span className="text-slate-400 font-bold block mb-1">Customer Explanation Note</span>
                  <p className="bg-[#FDF8F0] border border-[#C9D5D5]/60 p-3.5 rounded-xl text-slate-800 font-semibold m-0 leading-relaxed">
                    {returnRecord.customer_note}
                  </p>
                </div>
              )}
            </div>
          </AdminCard>

          {/* Return Items */}
          <AdminCard className="space-y-4 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A5C5E]">Merchandise Line Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="border-b border-[#C9D5D5]/60 uppercase text-[9px] text-[#1A5C5E] font-bold tracking-wider">
                    <th className="py-2 text-left">Product</th>
                    <th className="py-2 text-right">Requested Qty</th>
                    <th className="py-2 text-right">Price Paid</th>
                    <th className="py-2 text-right">Eligible Refund</th>
                    <th className="py-2 text-left">Warehouse Condition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C9D5D5]/40 font-semibold text-slate-750">
                  {returnItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="font-bold text-slate-800 py-3">{item.products?.name || item.product_id}</td>
                      <td className="text-right font-mono text-slate-800 py-3">{item.quantity}</td>
                      <td className="text-right font-mono text-slate-400 py-3 font-semibold">₹{item.price_paid}</td>
                      <td className="text-right font-mono font-bold text-[#134547] py-3">₹{item.refund_eligible_amount}</td>
                      <td className="py-3">
                        {item.condition_status ? (
                          <span className="font-bold text-slate-700 uppercase">{item.condition_status}</span>
                        ) : (
                          <span className="text-slate-400 italic">Pending Inspection</span>
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
        <div className="space-y-6">
          {/* Returns Totals Panel */}
          <AdminCard className="space-y-4 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A5C5E]">Financial Summary</h3>
            <div className="text-xs space-y-2.5 text-slate-700 font-mono font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold font-sans">Grand Total Refund</span>
                <span className="font-bold text-[#134547] text-sm font-mono">₹{totalEligibleRefund}</span>
              </div>
            </div>
          </AdminCard>

          {/* Return Processing Actions */}
          <AdminCard className="space-y-4 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A5C5E]">Reverse Fulfillment Actions</h3>
            <div className="flex flex-col gap-2">
              {returnRecord.status === 'requested' && (
                <>
                  <button 
                    type="button" 
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 bg-[#1A5C5E] hover:bg-[#134547] text-white rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 border-0 shadow-sm"
                  >
                    <Check size={14} />
                    <span>Approve Request</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={handleReject}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 bg-red-50 hover:bg-red-105/50 border border-red-200 text-red-650 rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <X size={14} />
                    <span>Reject Request</span>
                  </button>
                </>
              )}

              {returnRecord.status === 'received' && (
                <button 
                  type="button" 
                  onClick={() => setIsInspectModalOpen(true)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-[#1A5C5E] hover:bg-[#134547] text-white rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 border-0 shadow-sm"
                >
                  <Clipboard size={14} />
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
                      className="w-full px-4 py-2.5 bg-[#1A5C5E] hover:bg-[#134547] text-white rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 border-0 shadow-sm"
                    >
                      <CreditCard size={14} />
                      <span>Issue Cash Payout</span>
                    </button>
                  )}
                  {(returnRecord.refund_payment_method !== 'cod_cash' || codPayout) && (
                    <button 
                      type="button" 
                      onClick={handleCompleteReturn}
                      disabled={isSubmitting}
                      className="w-full px-4 py-2.5 bg-[#1A5C5E] hover:bg-[#134547] text-white rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 border-0 shadow-sm"
                    >
                      <Check size={14} />
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
                <div key={item.id} className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg space-y-3 font-sans">
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
              <h3 className="font-semibold text-sm text-slate-100 font-sans">
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
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800 font-sans">
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
