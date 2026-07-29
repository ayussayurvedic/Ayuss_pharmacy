'use client';

import { useState } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Search, 
  Calendar, 
  Package, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface BatchExpiration {
  id: string;
  batchNumber: string;
  productName: string;
  mfgDate: string;
  expDate: string;
  unitsInStock: number;
  shelfLifeRemainingMonths: number;
  status: 'Healthy' | 'Near Expiry' | 'Expired / Isolated';
}

export default function ExpirationsClient() {
  const [searchTerm, setSearchTerm] = useState('');

  const mockBatches: BatchExpiration[] = [
    {
      id: 'EXP-01',
      batchNumber: 'DRL-PC-2026-04',
      productName: 'Dr. Lion Pain Cream (50g Container)',
      mfgDate: '2026-04-10',
      expDate: '2029-03-31',
      unitsInStock: 2400,
      shelfLifeRemainingMonths: 32,
      status: 'Healthy'
    },
    {
      id: 'EXP-02',
      batchNumber: 'DRL-PP-2026-02',
      productName: 'Dr. Lion Pain Pills (60 Tablets)',
      mfgDate: '2026-02-15',
      expDate: '2029-01-31',
      unitsInStock: 1800,
      shelfLifeRemainingMonths: 30,
      status: 'Healthy'
    },
    {
      id: 'EXP-03',
      batchNumber: 'MLC-2023-11',
      productName: 'Moon Light Cream (25g Tube)',
      mfgDate: '2023-11-01',
      expDate: '2026-10-31',
      unitsInStock: 350,
      shelfLifeRemainingMonths: 3,
      status: 'Near Expiry'
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-[#134547] text-white p-6 rounded-2xl border border-[#1A5C5E] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#C9943E]" />
            <h1 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-wide">
              Batch Expirations & Shelf-Life Tracker
            </h1>
          </div>
          <p className="text-slate-300 text-xs font-light">
            Monitor the 36-month AYUSH statutory shelf life for manufactured products and receive early warning alerts.
          </p>
        </div>
      </div>

      {/* Expirations Table */}
      <div className="bg-white rounded-2xl border border-[#C9D5D5]/60 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#C9D5D5]/40 flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search batch code or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#C9D5D5] text-xs focus:outline-none focus:border-[#1A5C5E]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#FDF8F0] border-b border-[#C9D5D5]/60 uppercase text-[10px] text-[#1A5C5E] font-bold tracking-wider">
              <tr>
                <th className="p-4">Batch Ref & Product</th>
                <th className="p-4">Mfg / Expiry Date</th>
                <th className="p-4">Units in Stock</th>
                <th className="p-4">Remaining Shelf Life</th>
                <th className="p-4 text-right">Quarantine Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9D5D5]/40">
              {mockBatches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <span className="font-mono text-[10px] font-bold text-[#C9943E] block">{b.batchNumber}</span>
                    <span className="font-bold text-[#1A5C5E] block">{b.productName}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <Calendar size={12} className="text-[#1A5C5E]" />
                      <span>{b.mfgDate} → <strong className="text-slate-800">{b.expDate}</strong></span>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-slate-800">
                    {b.unitsInStock.toLocaleString('en-IN')} units
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-[#1A5C5E]">{b.shelfLifeRemainingMonths} Months</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      b.status === 'Healthy'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {b.status === 'Healthy' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                      <span>{b.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
