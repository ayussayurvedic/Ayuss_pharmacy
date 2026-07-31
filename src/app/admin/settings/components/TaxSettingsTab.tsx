'use client';

import React from 'react';
import { 
  AdminCard, 
  AdminStatusBadge, 
  AdminInput, 
  AdminSelect, 
  AdminTextarea 
} from '@/components/admin/AdminPrimitives';
import { Settings, Save, CheckSquare } from 'lucide-react';

interface TaxSettingsTabProps {
  taxSettings: any;
  setTaxSettings: React.Dispatch<React.SetStateAction<any>>;
  isSubmitting: boolean;
  onSaveDraft: (e: React.FormEvent) => Promise<void>;
  onVerify: () => Promise<void>;
}

export function TaxSettingsTab({
  taxSettings,
  setTaxSettings,
  isSubmitting,
  onSaveDraft,
  onVerify
}: TaxSettingsTabProps) {
  return (
    <form onSubmit={onSaveDraft} className="space-y-5">
      <AdminCard className="bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C9D5D5]/40 pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-[#1A5C5E]" />
            <div>
              <h3 className="font-bold text-sm text-[#134547] m-0">Business Tax Safety Gate</h3>
              <p className="text-xs text-slate-500 m-0">Controls tax calculation rules and document generation for invoices & credit notes</p>
            </div>
          </div>
          <AdminStatusBadge 
            status={taxSettings.configuration_status === 'VERIFIED' ? 'active' : 'draft'} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminSelect
            label="Invoicing Tax Mode *"
            value={taxSettings.tax_mode || 'UNCONFIGURED'}
            onChange={(e: any) => setTaxSettings({ ...taxSettings, tax_mode: e.target.value })}
            options={[
              { value: 'UNCONFIGURED', label: 'Unconfigured (Disable Taxes)' },
              { value: 'GST_REGISTERED', label: 'GST Registered (Indian Goods & Services Tax)' },
              { value: 'COMPOSITION_SCHEME', label: 'GST Composition Scheme' }
            ]}
          />

          <AdminSelect
            label="Pricing Base Mode *"
            value={taxSettings.pricing_tax_mode || 'TAX_INCLUSIVE'}
            onChange={(e: any) => setTaxSettings({ ...taxSettings, pricing_tax_mode: e.target.value })}
            options={[
              { value: 'TAX_INCLUSIVE', label: 'Tax Inclusive Pricing (Standard retail)' },
              { value: 'TAX_EXCLUSIVE', label: 'Tax Exclusive Pricing' }
            ]}
          />
        </div>
      </AdminCard>

      <AdminCard className="space-y-4 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
        <div className="border-b border-[#C9D5D5]/40 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A5C5E]">2. Legal Business registration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminInput
            label="Legal Business Name *"
            type="text"
            placeholder="e.g. S.S. PHARMACY INC"
            value={taxSettings.legal_business_name || ''}
            onChange={(e) => setTaxSettings({ ...taxSettings, legal_business_name: e.target.value })}
          />

          <AdminInput
            label="GSTIN (Tax Registration Number) *"
            type="text"
            placeholder="e.g. 37AAAAA0000A1Z1"
            value={taxSettings.gstin || ''}
            onChange={(e) => setTaxSettings({ ...taxSettings, gstin: e.target.value })}
          />
        </div>
      </AdminCard>

      <AdminCard className="space-y-4 bg-white border border-[#C9D5D5]/60 p-6 rounded-2xl shadow-xs">
        <div className="border-b border-[#C9D5D5]/40 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A5C5E]">3. Registered Address Details</h3>
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

          <AdminInput
            label="City *"
            type="text"
            value={taxSettings.city || ''}
            onChange={(e) => setTaxSettings({ ...taxSettings, city: e.target.value })}
          />

          <AdminSelect
            label="State / Union Territory *"
            value={taxSettings.state || ''}
            onChange={(e: any) => setTaxSettings({ ...taxSettings, state: e.target.value })}
            options={[
              { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
              { value: 'Telangana', label: 'Telangana' },
              { value: 'Tamil Nadu', label: 'Tamil Nadu' },
              { value: 'Karnataka', label: 'Karnataka' },
              { value: 'Maharashtra', label: 'Maharashtra' }
            ]}
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

      <div className="flex justify-end gap-3 pt-3 border-t border-[#C9D5D5]/40">
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
          onClick={onVerify}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1A5C5E] hover:bg-[#134547] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <CheckSquare size={14} />
          <span>Verify & Authorize</span>
        </button>
      </div>
    </form>
  );
}
