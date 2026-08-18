'use client';

import { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  ExternalLink,
  X
} from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  category: 'Botanicals' | 'Fixed Oils' | 'Packaging' | 'Extracts';
  contactPerson: string;
  phone: string;
  email: string;
  location: string;
  licenseNo: string;
  status: 'Active' | 'Under Audit' | 'Inactive';
  rating: number;
  lastSupplied: string;
}

export default function SuppliersClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    category: 'Botanicals' as const,
    contactPerson: '',
    phone: '',
    email: '',
    location: '',
    licenseNo: ''
  });

  const mockSuppliers: Supplier[] = [
    {
      id: 'SUP-101',
      name: 'Deccan Herbal Botanical Farms',
      category: 'Botanicals',
      contactPerson: 'K. Ramanathan',
      phone: '+91 98480 12345',
      email: 'sales@deccanherbals.in',
      location: 'Chittoor, Andhra Pradesh',
      licenseNo: 'AP-HERB-2021-09',
      status: 'Active',
      rating: 4.9,
      lastSupplied: '2026-07-20'
    },
    {
      id: 'SUP-102',
      name: 'Rayalaseema Til Oil Mills',
      category: 'Fixed Oils',
      contactPerson: 'S. Govindappa',
      phone: '+91 94401 67890',
      email: 'info@rayalaseemaoils.com',
      location: 'Kadapa, Andhra Pradesh',
      licenseNo: 'AP-OIL-2019-44',
      status: 'Active',
      rating: 4.8,
      lastSupplied: '2026-07-15'
    },
    {
      id: 'SUP-103',
      name: 'South India Glass & Packaging',
      category: 'Packaging',
      contactPerson: 'M. Venkat',
      phone: '+91 91770 45678',
      email: 'orders@siglasspack.co.in',
      location: 'Tirupati, Andhra Pradesh',
      licenseNo: 'AP-PKG-2020-12',
      status: 'Active',
      rating: 4.7,
      lastSupplied: '2026-07-10'
    },
    {
      id: 'SUP-104',
      name: 'Western Ghats Organic Extracts',
      category: 'Extracts',
      contactPerson: 'Dr. Anand Kumar',
      phone: '+91 94800 33445',
      email: 'anand@wghatsextracts.org',
      location: 'Shimoga, Karnataka',
      licenseNo: 'KA-EXT-2022-88',
      status: 'Under Audit',
      rating: 4.5,
      lastSupplied: '2026-06-28'
    }
  ];

  const filteredSuppliers = mockSuppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-[#134547] text-white p-6 rounded-2xl border border-[#1A5C5E] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-[#C9943E]" />
            <h1 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-wide">
              Suppliers & Vendor Directory
            </h1>
          </div>
          <p className="text-slate-300 text-xs font-light">
            Manage raw botanical growers, herbal extract distillers, fixed oil pressers, and glass container vendors.
          </p>
        </div>
        <button 
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C9943E] hover:bg-[#b78332] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Supplier</span>
        </button>
      </div>

      {/* Add Supplier Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#C9D5D5]/80 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#C9D5D5]/60 pb-3">
              <div className="flex items-center gap-2 text-[#134547]">
                <Building2 className="w-5 h-5 text-[#C9943E]" />
                <h3 className="font-serif font-bold text-lg">Add New Vendor / Supplier</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setIsAddModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Supplier Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g., Nilgiri Botanicals Co." 
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[#C9D5D5] rounded-xl focus:outline-none focus:border-[#1A5C5E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select 
                    value={newSupplier.category}
                    onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[#C9D5D5] rounded-xl focus:outline-none focus:border-[#1A5C5E] bg-white"
                  >
                    <option value="Botanicals">Botanicals</option>
                    <option value="Fixed Oils">Fixed Oils</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Extracts">Extracts</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Person</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Ramesh Verma" 
                    value={newSupplier.contactPerson}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 border border-[#C9D5D5] rounded-xl focus:outline-none focus:border-[#1A5C5E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+91 98765 43210" 
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-[#C9D5D5] rounded-xl focus:outline-none focus:border-[#1A5C5E]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    placeholder="vendor@example.com" 
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    className="w-full px-3 py-2 border border-[#C9D5D5] rounded-xl focus:outline-none focus:border-[#1A5C5E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location / State</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Ooty, Tamil Nadu" 
                    value={newSupplier.location}
                    onChange={(e) => setNewSupplier({ ...newSupplier, location: e.target.value })}
                    className="w-full px-3 py-2 border border-[#C9D5D5] rounded-xl focus:outline-none focus:border-[#1A5C5E]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">AYUSH / Drug License No.</label>
                  <input 
                    type="text" 
                    placeholder="e.g., TN-MED-2023-45" 
                    value={newSupplier.licenseNo}
                    onChange={(e) => setNewSupplier({ ...newSupplier, licenseNo: e.target.value })}
                    className="w-full px-3 py-2 border border-[#C9D5D5] rounded-xl focus:outline-none focus:border-[#1A5C5E]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#C9D5D5]/60">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#134547] hover:bg-[#1A5C5E] text-white rounded-xl font-bold shadow-md transition-all cursor-pointer"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#C9D5D5]/60 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search suppliers by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#C9D5D5] text-xs focus:outline-none focus:border-[#1A5C5E]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'Botanicals', 'Fixed Oils', 'Packaging', 'Extracts'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#1A5C5E] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSuppliers.map((s) => (
          <div 
            key={s.id}
            className="bg-white p-6 rounded-2xl border border-[#C9D5D5]/60 shadow-xs hover:shadow-md transition-all space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[9px] font-bold text-[#C9943E] uppercase tracking-wider block mb-0.5">
                  {s.id} • {s.category}
                </span>
                <h3 className="font-serif text-base font-bold text-[#1A5C5E] uppercase">{s.name}</h3>
              </div>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                s.status === 'Active' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {s.status === 'Active' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                <span>{s.status}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-[#C9D5D5]/40 text-slate-600">
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-[#1A5C5E] shrink-0" />
                <span className="truncate">{s.contactPerson}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-[#1A5C5E] shrink-0" />
                <span>{s.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#1A5C5E] shrink-0" />
                <span className="truncate">{s.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#1A5C5E] shrink-0" />
                <span className="truncate">{s.location}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#C9D5D5]/40 text-[11px]">
              <div className="flex items-center gap-1 text-slate-500 font-mono">
                <ShieldCheck size={14} className="text-[#C9943E]" />
                <span>License: {s.licenseNo}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400">Last Supply: </span>
                <span className="font-semibold text-slate-700">{s.lastSupplied}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
