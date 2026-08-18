'use client';

import { useState, useEffect } from 'react';
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
import { fetchSiteSettings, formatDisplayPhone, type SiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';

export default function ContactClient() {
  const { toast } = useToast();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', note: '' });
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    async function loadSettings() {
      const data = await fetchSiteSettings();
      setSettings(data);
    }
    loadSettings();
  }, []);

  const displayPhone = formatDisplayPhone(settings.supportPhone);
  const telHref = settings.supportPhone ? `tel:+${settings.supportPhone.replace(/\D/g, '')}` : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.note) {
      toast.error('Name, phone and message details are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('inquiries')
        .insert([{
          name: form.name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim(),
          message: form.note.trim(),
          status: 'new'
        }]);

      if (error) {
        await supabase
          .from('distributor_applications')
          .insert([{
            company_name: `Contact Inquiry: ${form.name}`,
            contact_person: form.name,
            phone: form.phone,
            email: form.email || null,
            notes: form.note,
            status: 'pending'
          }]);
      }

      toast.success('Your message has been received! Our team will respond shortly.');
      setForm({ name: '', email: '', phone: '', note: '' });
    } catch (err: any) {
      console.error('Contact submission error:', err);
      toast.error('Failed to submit message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FDF8F0] text-slate-800 pt-20 md:pt-24 pb-16 min-h-[100dvh] font-sans">
      <div className="max-w-[1200px] mx-auto px-6 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A5C5E]/10 border border-[#1A5C5E]/20 text-[#1A5C5E] text-[11px] font-bold uppercase tracking-wider">
            <Mail className="w-3.5 h-3.5 text-[#C9943E]" />
            <span>Connect with AYU S.S. Pharmacy</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-[#1A5C5E] font-bold uppercase tracking-tight">
            Contact & Operations
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-light leading-relaxed">
            Have questions about our classical Ayurvedic formulations, bulk procurement, or state licensing? Reach out to our operational team.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="font-serif text-2xl text-[#1A5C5E] font-semibold uppercase tracking-wide">
              Direct Channels
            </h2>
            <p className="text-xs text-slate-500 font-light leading-relaxed">
              Connect directly with our administrative team or visit our licensed manufacturing headquarters.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 pt-2">
              {/* Phone card */}
              <div className="bg-white p-5 rounded-2xl border border-[#C9D5D5]/50 flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#1A5C5E]/5 text-[#C9943E] flex items-center justify-center shrink-0 border border-[#C9943E]/20">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Call Details</span>
                  {displayPhone && telHref ? (
                    <a href={telHref} className="text-xs font-bold text-[#1A5C5E] hover:underline mt-0.5 block">{displayPhone}</a>
                  ) : (
                    <span className="text-xs font-bold text-[#1A5C5E] mt-0.5 block">Customer Support Active</span>
                  )}
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
                  <a href={`mailto:${settings.supportEmail}`} className="text-xs font-bold text-[#1A5C5E] hover:underline mt-0.5 block">{settings.supportEmail}</a>
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
                    {settings.address}
                  </address>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#C9D5D5]/60 shadow-sm space-y-6">
              <div>
                <h2 className="font-serif text-2xl text-[#1A5C5E] font-semibold uppercase tracking-wide">
                  Send a Message
                </h2>
                <p className="text-xs text-slate-500 font-light mt-1">
                  Fill out the form below and our operations coordinator will get in touch.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="contact-name" className="block text-slate-600 mb-1 font-bold uppercase tracking-wider text-[9px]">Your Name *</label>
                  <input 
                    id="contact-name"
                    type="text" 
                    required 
                    autoComplete="name"
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#1A5C5E] focus:ring-1 focus:ring-[#1A5C5E] text-xs bg-slate-50/50" 
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-email" className="block text-slate-600 mb-1 font-bold uppercase tracking-wider text-[9px]">Email Address</label>
                    <input 
                      id="contact-email"
                      type="email" 
                      autoComplete="email"
                      value={form.email} 
                      onChange={e => setForm({ ...form, email: e.target.value })} 
                      className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#1A5C5E] focus:ring-1 focus:ring-[#1A5C5E] text-xs bg-slate-50/50" 
                      placeholder="ramesh@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-phone" className="block text-slate-600 mb-1 font-bold uppercase tracking-wider text-[9px]">Mobile Phone *</label>
                    <input 
                      id="contact-phone"
                      type="tel" 
                      required 
                      autoComplete="tel"
                      value={form.phone} 
                      onChange={e => setForm({ ...form, phone: e.target.value })} 
                      className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#1A5C5E] focus:ring-1 focus:ring-[#1A5C5E] text-xs bg-slate-50/50" 
                      placeholder="e.g. 9876543210"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-slate-600 mb-1 font-bold uppercase tracking-wider text-[9px]">Message Details *</label>
                  <textarea 
                    id="contact-message"
                    required 
                    rows={4} 
                    value={form.note} 
                    onChange={e => setForm({ ...form, note: e.target.value })} 
                    className="w-full border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-[#1A5C5E] focus:ring-1 focus:ring-[#1A5C5E] bg-slate-50/50 leading-relaxed text-xs" 
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

        {/* Embedded Map Section */}
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

      </div>
    </div>
  );
}
