'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Truck, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Building2,
  Calendar,
  IndianRupee
} from 'lucide-react';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  itemDescription: string;
  quantity: string;
  totalCost: number;
  orderDate: string;
  expectedDelivery: string;
  status: 'Draft' | 'Sent' | 'In Transit' | 'QC Inspection' | 'Received & Released';
}

export default function ProcurementClient() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const mockPOs: PurchaseOrder[] = [
    {
      id: 'PO-2026-001',
      poNumber: 'SSP/PO/26-089',
      supplierName: 'Deccan Herbal Botanical Farms',
      itemDescription: 'Raw Turmeric Rhizomes (Curcuma Longa) - Grade A',
      quantity: '500 kg',
      totalCost: 145000,
      orderDate: '2026-07-22',
      expectedDelivery: '2026-07-30',
      status: 'In Transit'
    },
    {
      id: 'PO-2026-002',
      poNumber: 'SSP/PO/26-090',
      supplierName: 'Rayalaseema Til Oil Mills',
      itemDescription: 'Cold Pressed Sesame Oil (Til Oil) - Batch Grade',
      quantity: '300 Liters',
      totalCost: 96000,
      orderDate: '2026-07-24',
      expectedDelivery: '2026-08-01',
      status: 'Sent'
    },
    {
      id: 'PO-2026-003',
      poNumber: 'SSP/PO/26-088',
      supplierName: 'South India Glass & Packaging',
      itemDescription: '100ml Glass Ointment Jars with Gold Metal Caps',
      quantity: '5,000 Units',
      totalCost: 75000,
      orderDate: '2026-07-15',
      expectedDelivery: '2026-07-25',
      status: 'Received & Released'
    }
  ];

  const getStatusBadge = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'Received & Released':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Transit':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'QC Inspection':
        return 'bg-[#C9943E]/10 text-[#C9943E] border-[#C9943E]/30';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-[#134547] text-white p-6 rounded-2xl border border-[#1A5C5E] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-[#C9943E]" />
            <h1 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-wide">
              Procurement & Purchase Orders
            </h1>
          </div>
          <p className="text-slate-300 text-xs font-light">
            Raise POs for botanical raw ingredients, track shipment transit, and monitor analytical quality releases.
          </p>
        </div>
        <button 
          onClick={() => toast.info('New Purchase Order creation form coming soon.')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C9943E] hover:bg-[#b78332] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Plus size={16} />
          <span>Raise Purchase Order</span>
        </button>
      </div>

      {/* PO Table Container */}
      <div className="bg-white rounded-2xl border border-[#C9D5D5]/60 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#C9D5D5]/40 flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search PO number or item..."
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
                <th className="p-4">PO Ref / Supplier</th>
                <th className="p-4">Item & Quantity</th>
                <th className="p-4">Total Cost</th>
                <th className="p-4">Order / Delivery Date</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9D5D5]/40">
              {mockPOs.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <span className="font-mono text-[10px] font-bold text-[#C9943E] block">{po.poNumber}</span>
                    <span className="font-bold text-[#1A5C5E] block">{po.supplierName}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-slate-800 block">{po.itemDescription}</span>
                    <span className="text-[10px] text-slate-400">Qty: {po.quantity}</span>
                  </td>
                  <td className="p-4 font-semibold text-slate-800">
                    ₹{po.totalCost.toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 text-slate-500">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Calendar size={12} className="text-[#1A5C5E]" />
                      <span>{po.orderDate} → {po.expectedDelivery}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(po.status)}`}>
                      {po.status === 'Received & Released' ? <CheckCircle2 size={12} /> : <Truck size={12} />}
                      <span>{po.status}</span>
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
