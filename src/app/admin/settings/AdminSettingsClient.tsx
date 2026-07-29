'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { AdminCard, AdminStatusBadge, AdminInput, AdminSelect, AdminTextarea, AdminSkeleton } from '@/components/admin/AdminPrimitives';
import { Save, AlertTriangle, CheckSquare, Settings } from 'lucide-react';

export default function AdminSettingsClient() {
  const { toast } = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [taxSettings, setTaxSettings] = useState<any>({
    id: '',
    tax_mode: 'UNCONFIGURED',
    configuration_status: 'UNCONFIGURED',
    legal_business_name: '',
    trade_name: 'S.S. PHARMACY',
    gstin: '',
    registered_address_line1: '',
    registered_address_line2: '',
    city: '',
    state: '',
    state_code: '',
    postal_code: '',
    country: 'India',
    invoice_prefix: 'SSP',
    credit_note_prefix: 'CN',
    pricing_tax_mode: 'TAX_INCLUSIVE',
    default_hsn_code: '',
    default_gst_rate: 12.00,
    delivery_gst_rate: 18.00,
    invoice_terms: 'Goods once sold are subject to S.S. PHARMACY terms.',
    support_email: 'support@sspharmacy.in',
    support_phone: ''
  });

  const fetchTaxSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_tax_settings')
        .select('*')
        .maybeSingle();

      if (!error && data) {
        setTaxSettings(data);
      }
    } catch (err: any) {
      console.error('Fetch tax settings error:', err);
      toast.error('Failed to load system settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxSettings();
  }, []);

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...taxSettings,
        configuration_status: taxSettings.configuration_status === 'VERIFIED' ? 'VERIFIED' : 'DRAFT',
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('business_tax_settings')
        .upsert(payload);

      if (error) throw error;

      toast.success('System configuration saved as draft.');
      await fetchTaxSettings();
    } catch (err: any) {
      console.error('Save tax settings error:', err);
      toast.error(err.message || 'Failed to save settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!taxSettings.legal_business_name || !taxSettings.registered_address_line1 || !taxSettings.state || !taxSettings.state_code) {
      toast.error('Legal Business Name, Address, State, and State Code are mandatory for verification.');
      return;
    }

    if (taxSettings.tax_mode === 'GST_REGISTERED' && !taxSettings.gstin) {
      toast.error('GSTIN is mandatory when tax mode is set to GST Registered.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();

      const payload = {
        ...taxSettings,
        configuration_status: 'VERIFIED',
        verified_at: new Date().toISOString(),
        verified_by: userData.user?.id || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('business_tax_settings')
        .upsert(payload);

      if (error) throw error;

      toast.success('Configuration verified. Production invoicing active.');
      await fetchTaxSettings();
    } catch (err: any) {
      console.error('Verify settings error:', err);
      toast.error(err.message || 'Verification update failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <AdminSkeleton type="card" />;
  }

  return (
    <div className="space-y-5 pb-12 text-slate-200 font-sans">
      <div className="pb-3 border-b border-slate-800">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">System Settings & Configuration</span>
        <h1 className="text-xl font-bold text-slate-100">Tax Safety Gates</h1>
        <p className="text-xs text-slate-500 margin-0">Ayurvedic manufacturing credentials, business details, tax rates, and document prefixes</p>
      </div>

      {/* Safety Gate Header Card */}
      <AdminCard className="bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C9D5D5]/40 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-[#1A5C5E]" />
            <div>
              <h3 className="font-bold text-sm text-[#134547] m-0">Business Tax Safety Gate</h3>
              <p className="text-xs text-slate-500 m-0">Controls tax calculation rules and document generation for invoices & credit notes</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-bold">Configuration Status:</span>
            <AdminStatusBadge status={taxSettings.configuration_status.toLowerCase()} />
          </div>
        </div>

        {taxSettings.configuration_status === 'UNCONFIGURED' && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-650">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>Tax configuration is incomplete. Production invoice generation is blocked until verified settings are saved.</span>
          </div>
        )}
      </AdminCard>

      {/* Settings Form */}
      <form onSubmit={handleSaveDraft} className="space-y-5 text-xs">
        {/* Section 1: Business Identity */}
        <AdminCard className="space-y-4 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
          <div className="border-b border-[#C9D5D5]/40 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A5C5E]">1. Business Identity & Ayurvedic Licensing</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminInput
              label="Trade Name / Brand"
              type="text"
              value={taxSettings.trade_name || 'S.S. PHARMACY'}
              onChange={(e) => setTaxSettings({ ...taxSettings, trade_name: e.target.value })}
            />

            <AdminInput
              label="Legal Registered Entity Name *"
              type="text"
              placeholder="e.g. S.S. PHARMACY Ayurvedic Pvt Ltd"
              value={taxSettings.legal_business_name || ''}
              onChange={(e) => setTaxSettings({ ...taxSettings, legal_business_name: e.target.value })}
            />
          </div>

          <div className="p-3.5 bg-[#FDF8F0] border border-[#C9D5D5]/60 rounded-xl font-mono">
            <span className="text-[10px] font-bold text-slate-400 uppercase block font-sans">Licensed Manufacturing License</span>
            <span className="font-bold text-[#134547] text-xs">Mfg. Lic. No. R-1970/Ayur (Authoritative Ayush License)</span>
          </div>
        </AdminCard>

        {/* Section 2: Tax Configuration */}
        <AdminCard className="space-y-4 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
          <div className="border-b border-[#C9D5D5]/40 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A5C5E]">2. Tax & GST Accounting Configuration</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdminSelect
              label="GST Registration Mode *"
              value={taxSettings.tax_mode}
              onChange={(e) => setTaxSettings({ ...taxSettings, tax_mode: e.target.value as any })}
              options={[
                { value: 'UNCONFIGURED', label: 'UNCONFIGURED (Blocked)' },
                { value: 'GST_REGISTERED', label: 'GST Registered (Tax Invoice)' },
                { value: 'COMPOSITION', label: 'Composition Scheme (Bill of Supply)' },
                { value: 'NON_GST', label: 'Non-GST / Exempt (Bill of Supply)' },
              ]}
            />

            <AdminSelect
              label="Pricing Tax Mode"
              value={taxSettings.pricing_tax_mode || 'TAX_INCLUSIVE'}
              onChange={(e) => setTaxSettings({ ...taxSettings, pricing_tax_mode: e.target.value as any })}
              options={[
                { value: 'TAX_INCLUSIVE', label: 'TAX INCLUSIVE (MRP includes GST)' },
                { value: 'TAX_EXCLUSIVE', label: 'TAX EXCLUSIVE (GST added on top)' },
              ]}
            />

            <AdminInput
              label="Supplier GSTIN (15 Digits)"
              type="text"
              placeholder="e.g. 37AAAAA0000A1Z5"
              value={taxSettings.gstin || ''}
              onChange={(e) => setTaxSettings({ ...taxSettings, gstin: e.target.value })}
              className="font-mono uppercase text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AdminInput
              label="Default HSN Code"
              type="text"
              placeholder="e.g. 30049011"
              value={taxSettings.default_hsn_code || ''}
              onChange={(e) => setTaxSettings({ ...taxSettings, default_hsn_code: e.target.value })}
              className="font-mono text-slate-800"
            />

            <AdminInput
              label="Default Product GST Rate (%)"
              type="number"
              step="0.01"
              value={taxSettings.default_gst_rate}
              onChange={(e) => setTaxSettings({ ...taxSettings, default_gst_rate: parseFloat(e.target.value) || 0 })}
              className="font-mono text-slate-800"
            />

            <AdminInput
              label="Default Shipping GST Rate (%)"
              type="number"
              step="0.01"
              value={taxSettings.delivery_gst_rate}
              onChange={(e) => setTaxSettings({ ...taxSettings, delivery_gst_rate: parseFloat(e.target.value) || 0 })}
              className="font-mono text-slate-800"
            />
          </div>
        </AdminCard>

        {/* Section 3: Registered Address */}
        <AdminCard className="space-y-4 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
          <div className="border-b border-[#C9D5D5]/40 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A5C5E]">3. Registered Office Address</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminInput
              label="Address Line 1 *"
              type="text"
              value={taxSettings.registered_address_line1 || ''}
              onChange={(e) => setTaxSettings({ ...taxSettings, registered_address_line1: e.target.value })}
            />

            <AdminInput
              label="Address Line 2"
              type="text"
              value={taxSettings.registered_address_line2 || ''}
              onChange={(e) => setTaxSettings({ ...taxSettings, registered_address_line2: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AdminInput
              label="City *"
              type="text"
              value={taxSettings.city || ''}
              onChange={(e) => setTaxSettings({ ...taxSettings, city: e.target.value })}
            />

            <AdminInput
              label="State / Union Territory *"
              type="text"
              value={taxSettings.state || ''}
              onChange={(e) => setTaxSettings({ ...taxSettings, state: e.target.value })}
            />

            <AdminInput
              label="State Numeric Code *"
              type="text"
              placeholder="e.g. 37 for Andhra Pradesh"
              value={taxSettings.state_code || ''}
              onChange={(e) => setTaxSettings({ ...taxSettings, state_code: e.target.value })}
            />

            <AdminInput
              label="Postal PIN Code *"
              type="text"
              value={taxSettings.postal_code || ''}
              onChange={(e) => setTaxSettings({ ...taxSettings, postal_code: e.target.value })}
            />
          </div>
        </AdminCard>

        {/* Section 4: Document Terms & Support */}
        <AdminCard className="space-y-4 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
          <div className="border-b border-[#C9D5D5]/40 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A5C5E]">4. Documents prefix & invoice terms</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AdminInput
              label="Invoice Number prefix"
              type="text"
              value={taxSettings.invoice_prefix || 'SSP'}
              onChange={(e) => setTaxSettings({ ...taxSettings, invoice_prefix: e.target.value })}
            />

            <AdminInput
              label="Credit Note prefix"
              type="text"
              value={taxSettings.credit_note_prefix || 'CN'}
              onChange={(e) => setTaxSettings({ ...taxSettings, credit_note_prefix: e.target.value })}
            />
          </div>

          <AdminTextarea
            label="Standard Invoice Terms & Declarations"
            value={taxSettings.invoice_terms || ''}
            onChange={(e) => setTaxSettings({ ...taxSettings, invoice_terms: e.target.value })}
            className="text-slate-800 focus:outline-none"
          />
        </AdminCard>

        {/* Action Footer */}
        <div className="flex justify-end gap-3 pt-3 border-t border-[#C9D5D5]/40 font-sans">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Save size={14} />
            <span>Save Settings Draft</span>
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleVerify}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1A5C5E] hover:bg-[#134547] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <CheckSquare size={14} />
            <span>Verify & Authorize</span>
          </button>
        </div>
      </form>
    </div>
  );
}
