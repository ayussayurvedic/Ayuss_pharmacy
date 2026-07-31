'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { 
  Shield, 
  AlertTriangle, 
  Search, 
  CheckCircle2, 
  FileText, 
  Plus, 
  Lock, 
  RefreshCw 
} from 'lucide-react';

interface QualityRecall {
  id: string;
  recallNumber: string;
  batchNumber: string;
  productName: string;
  reason: string;
  affectedQuantity: number;
  isolatedDate: string;
  inspectorNote: string;
  status: 'Investigation Active' | 'Quarantined' | 'Resolved / Cleared';
}

export default function RecallsClient() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const mockRecalls: QualityRecall[] = [
    {
      id: 'REC-2026-01',
      recallNumber: 'RCL/AYUR/26-004',
      batchNumber: 'MLC-2024-08',
      productName: 'Moon Light Cream (25g Tube)',
      reason: 'Packaging Seal Integrity Re-inspection',
      affectedQuantity: 120,
      isolatedDate: '2026-06-12',
      inspectorNote: 'State Inspector sample check request. Seal tightness verified. Resolution pending final report.',
      status: 'Investigation Active'
    },
    {
      id: 'REC-2025-04',
      recallNumber: 'RCL/AYUR/25-012',
      batchNumber: 'DRL-PC-2025-10',
      productName: 'Dr. Lion Pain Cream (50g Container)',
      reason: 'Viscosity Standardization Audit',
      affectedQuantity: 450,
      isolatedDate: '2025-10-18',
      inspectorNote: 'Viscosity re-tested and passed. Released back to general distribution stock.',
      status: 'Resolved / Cleared'
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-[#134547] text-white p-6 rounded-2xl border border-[#1A5C5E] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#C9943E]" />
            <h1 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-wide">
              Batch Quality Recalls & Inspection Log
            </h1>
          </div>
          <p className="text-slate-300 text-xs font-light">
            Trigger quality hold quarantines, log AYUSH State Inspector audit observations, and document corrective resolution events.
          </p>
        </div>
        <button 
          onClick={() => toast.info('Initiate Quality Hold form coming soon.')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C9943E] hover:bg-[#b78332] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Plus size={16} />
          <span>Initiate Quality Hold</span>
        </button>
      </div>

      {/* Recalls List */}
      <div className="grid grid-cols-1 gap-6">
        {mockRecalls.map((r) => (
          <div 
            key={r.id}
            className="bg-white p-6 rounded-2xl border border-[#C9D5D5]/60 shadow-xs hover:shadow-md transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C9D5D5]/40 pb-4">
              <div>
                <span className="text-[10px] font-bold text-[#C9943E] font-mono block">
                  {r.recallNumber} • BATCH: {r.batchNumber}
                </span>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#1A5C5E] uppercase mt-0.5">
                  {r.productName}
                </h3>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
                r.status === 'Resolved / Cleared'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {r.status === 'Resolved / Cleared' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                <span>{r.status}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Reason for Hold</span>
                <span className="font-semibold text-slate-800">{r.reason}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Isolated Quantity</span>
                <span className="font-semibold text-slate-800">{r.affectedQuantity} units</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Quarantine Date</span>
                <span className="font-semibold text-slate-800">{r.isolatedDate}</span>
              </div>
            </div>

            <div className="bg-[#FDF8F0] p-4 rounded-xl border border-[#C9D5D5]/50 space-y-1 text-xs">
              <span className="font-bold text-[#1A5C5E] uppercase text-[10px] tracking-wider block">
                Inspector Observation Log:
              </span>
              <p className="text-slate-600 font-light leading-relaxed">
                {r.inspectorNote}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
