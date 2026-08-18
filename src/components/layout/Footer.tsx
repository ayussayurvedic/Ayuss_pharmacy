'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  PackageCheck
} from 'lucide-react';
import { fetchSiteSettings, formatDisplayPhone, type SiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';

export default function Footer() {
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

  return (
    <footer className="bg-[#134547] text-[#FDF8F0] border-t-2 border-[#C9943E] font-sans pt-12 pb-6">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-xs">
        
        {/* Brand column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Image 
              src="/products/logo/logo.webp" 
              alt="Ayu S.S. Pharmacy Logo" 
              className="h-9 w-auto" 
              width={96}
              height={36}
            />
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-white tracking-widest text-sm font-serif leading-none">AYU S.S. PHARMACY</span>
              <span className="text-[10px] font-semibold text-[#E8C87A] tracking-normal leading-none mt-1">One Stop Solution</span>
            </div>
          </div>
          <p className="text-[#FDF8F0]/80 leading-relaxed font-light">
            Government-licensed Ayurvedic manufacturer located in Yerraguntla, Kadapa District, Andhra Pradesh. We formulate authentic preparations using potent botanical bio-extracts.
          </p>
        </div>

        {/* Formulations & Navigation */}
        <div className="space-y-4">
          <h4 className="font-bold text-white uppercase tracking-wider text-[10px] border-b border-[#1A5C5E] pb-2">Navigation & Quick Links</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="hover:text-[#E8C87A] transition-colors">Home Page</Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-[#E8C87A] transition-colors">Ayurvedic Formulations</Link>
            </li>
            <li>
              <Link href="/why-choose-us" className="hover:text-[#E8C87A] transition-colors">Why Choose Us</Link>
            </li>
            <li>
              <Link href="/manufacturing" className="hover:text-[#E8C87A] transition-colors">Manufacturing & Quality</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-[#E8C87A] transition-colors">About S.S. Pharmacy</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[#E8C87A] transition-colors">Contact Us</Link>
            </li>
          </ul>
        </div>

        {/* Quality & Licensing */}
        <div className="space-y-4">
          <h4 className="font-bold text-white uppercase tracking-wider text-[10px] border-b border-[#1A5C5E] pb-2">Licensing & Quality</h4>
          <div className="space-y-3 text-[#FDF8F0]/80 font-light">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C9943E] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>AYUSH License:</strong><br />
                R-1970/Ayur (Govt. of A.P.)
              </p>
            </div>
            <div className="flex items-start gap-2">
              <PackageCheck className="w-4 h-4 text-[#C9943E] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Standard Quality:</strong><br />
                GMP Certified Ayurvedic Facility
              </p>
            </div>
            <p className="leading-relaxed">
              Formulated under strict Schedule T GMP guidelines with zero added synthetic steroids.
            </p>
          </div>
        </div>

        {/* Direct Connect */}
        <div className="space-y-4">
          <h4 className="font-bold text-white uppercase tracking-wider text-[10px] border-b border-[#1A5C5E] pb-2">Direct Connect</h4>
          <div className="space-y-3 text-[#FDF8F0]/80 font-light">
            {displayPhone && telHref && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C9943E] shrink-0" />
                <a href={telHref} className="hover:text-[#E8C87A] transition-colors">{displayPhone}</a>
              </div>
            )}
            {settings.supportEmail && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C9943E] shrink-0" />
                <a href={`mailto:${settings.supportEmail}`} className="hover:text-[#E8C87A] transition-colors">{settings.supportEmail}</a>
              </div>
            )}
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#C9943E] shrink-0 mt-0.5" />
              <address className="not-italic leading-relaxed">
                {settings.address || 'Prakash Nagar, Yerraguntla, YSR Kadapa Dist., A.P. - 516309'}
              </address>
            </div>
          </div>
        </div>

      </div>

      {/* Sub Footer */}
      <div className="border-t border-[#1A5C5E] mt-10 pt-6">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-[#FDF8F0]/60">
          <p>© {new Date().getFullYear()} S.S. PHARMACY. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/order-tracking" className="hover:text-[#E8C87A] transition-colors font-medium">Track Order</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-[#E8C87A] transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#E8C87A] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
