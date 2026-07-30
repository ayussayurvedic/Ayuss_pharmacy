'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { env } from '@/lib/env';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Send 
} from 'lucide-react';

export default function ContactClient() {
  const { toast } = useToast();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', note: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.note) {
      toast.error('Name, phone and message details are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('distributor_applications')
        .insert([{
          company_name: `Enquiry: ${form.name}`,
          contact_person: form.name,
          phone: form.phone,
          email: form.email || 'no-email@contact.in',
          city: 'Contact Enquiry',
          state: 'Andhra Pradesh',
          notes: form.note,
          status: 'new'
        }]);

      if (error) throw error;
      toast.success('Thank you. Your message has been sent.');
      setForm({ name: '', email: '', phone: '', note: '' });
    } catch (err) {
      toast.error('Unable to send inquiry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FDF8F0] text-slate-800 pt-24 pb-16 min-h-screen font-sans">
      {/* Page Header */}
      <section className="border-b border-[#C9D5D5]/60 pb-6 pt-2 mb-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center gap-2 text-[11px] text-[#2A7B7E] font-medium mb-4 uppercase tracking-wider">
            <Link href="/" className="hover:text-[#1A5C5E] transition-colors">Home</Link>
            <span>•</span>
            <span className="text-slate-400">Contact</span>
          </div>

          <div className="max-w-3xl">
            <span className="text-[11px] font-bold text-[#C9943E] uppercase tracking-wider block mb-2">Get In Touch</span>
            <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-serif text-[#1A5C5E] font-semibold leading-snug uppercase mb-4">
              Contact SS Pharmacy
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl font-light">
              Reach out directly for general queries, retail purchase assistance, wholesale distribution partnerships, or clinical inquiries.
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-[1200px] mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="font-serif text-2xl text-[#1A5C5E] font-semibold uppercase tracking-wide">
              Direct Channels
            </h2>
            <p className="text-xs text-slate-500 font-light leading-relaxed">
              Connect directly with our administrative team or visit our licensed manufacturing headquarters in Kadapa district.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 pt-2">
              {/* Phone card */}
              <div className="bg-white p-5 rounded-2xl border border-[#C9D5D5]/50 flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#1A5C5E]/5 text-[#C9943E] flex items-center justify-center shrink-0 border border-[#C9943E]/20">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Call Details</span>
                  <a href="tel:+919848523295" className="text-xs font-bold text-[#1A5C5E] hover:underline mt-0.5 block">+91 98485 23295</a>
                  <span className="text-[9px] text-slate-400 block font-light mt-0.5">Mon–Sat, 9:00 AM–6:00 PM</span>
                </div>
              </div>

              {/* Email card */}
              <div className="bg-white p-5 rounded-2xl border border-[#C9D5D5]/50 flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#1A5C5E]/5 text-[#C9943E] flex items-center justify-center shrink-0 border border-[#C9943E]/20">
                  <Mail size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Inquiries</span>
                  <a href="mailto:info@sspharmacy.co.in" className="text-xs font-bold text-[#1A5C5E] hover:underline mt-0.5 block">info@sspharmacy.co.in</a>
                  <span className="text-[9px] text-slate-400 block font-light mt-0.5">Response within 24 hours</span>
                </div>
              </div>

              {/* Address card */}
              <div className="bg-white p-5 rounded-2xl border border-[#C9D5D5]/50 flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#1A5C5E]/5 text-[#C9943E] flex items-center justify-center shrink-0 border border-[#C9943E]/20">
                  <MapPin size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Headquarters</span>
                  <address className="not-italic text-xs font-medium text-slate-650 leading-relaxed mt-1">
                    D. No. 1-2-211 & 1-2-212, Prakash Nagar,<br />
                    Yerraguntla, YSR Kadapa District,<br />
                    Andhra Pradesh - 516309
                  </address>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-[#C9D5D5] p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
              <div>
                <h3 className="font-serif text-xl text-[#1A5C5E] font-bold uppercase tracking-wider">Send an Inquiry</h3>
                <p className="text-[11px] text-slate-400 font-light mt-0.5">Complete this form and our compliance officer will contact you shortly.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 mb-1 font-bold uppercase tracking-wider text-[9px]">Your Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={form.name} 
                      onChange={e => setForm({ ...form, name: e.target.value })} 
                      className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#1A5C5E] focus:ring-1 focus:ring-[#1A5C5E] bg-slate-50/50" 
                      placeholder="e.g. Rajesh Kumar"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-bold uppercase tracking-wider text-[9px]">Phone Contact *</label>
                    <input 
                      type="tel" 
                      required 
                      value={form.phone} 
                      onChange={e => setForm({ ...form, phone: e.target.value })} 
                      className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#1A5C5E] focus:ring-1 focus:ring-[#1A5C5E] bg-slate-50/50" 
                      placeholder="e.g. +91 99887 76655"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-bold uppercase tracking-wider text-[9px]">Email Address (Optional)</label>
                  <input 
                    type="email" 
                    value={form.email} 
                    onChange={e => setForm({ ...form, email: e.target.value })} 
                    className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#1A5C5E] focus:ring-1 focus:ring-[#1A5C5E] bg-slate-50/50" 
                    placeholder="e.g. rajesh@email.com"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-bold uppercase tracking-wider text-[9px]">Message Details *</label>
                  <textarea 
                    required 
                    rows={4} 
                    value={form.note} 
                    onChange={e => setForm({ ...form, note: e.target.value })} 
                    className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#1A5C5E] focus:ring-1 focus:ring-[#1A5C5E] bg-slate-50/50 leading-relaxed" 
                    placeholder="Describe your inquiry (retail, wholesale purchase, or partnership specs)..."
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full bg-[#1A5C5E] hover:bg-[#134547] disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer border-0 mt-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Sending Enquiry...' : 'Submit Inquiry'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Map Section */}
      <section className="max-w-[1200px] mx-auto px-6">
        <div className="w-full rounded-2xl overflow-hidden border border-[#C9D5D5] shadow-sm bg-white flex flex-col">
          <div className="relative w-full h-[260px] md:h-[340px] overflow-hidden bg-slate-100">
            <Image
              src={`https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=1200&height=420&center=lonlat:78.571027,14.755504&zoom=14&marker=lonlat:78.571027,14.755504;color:%231a5c5e;size:medium&apiKey=${env.NEXT_PUBLIC_GEOAPIFY_API_KEY || ''}`}
              alt="S.S. Pharmacy Facility Map"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="p-4 sm:p-5 bg-white border-t border-[#C9D5D5]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-3.5 h-3.5 rounded-full bg-[#1A5C5E] animate-pulse shrink-0" />
              <div>
                <h3 className="font-serif text-xs font-bold text-[#1A5C5E] uppercase">Administrative Headquarters</h3>
                <p className="text-[10px] text-slate-500 font-sans">Yerraguntla, Kadapa District, Andhra Pradesh - 516309</p>
              </div>
            </div>
            <a
              href="https://maps.app.goo.gl/UwgF81SSMDMUAEFV8"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1A5C5E] hover:bg-[#134547] text-white text-xs font-bold rounded-xl shadow-sm transition-all duration-200 min-h-[40px] w-full sm:w-auto uppercase tracking-wider"
            >
              <MapPin size={14} className="text-[#C9943E]" />
              <span>Get Directions</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
