'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#134547] text-[#FDF8F0] border-t-2 border-[#C9943E] font-sans pt-12 pb-6">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-xs">
        
        {/* Brand column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Image 
              src="/products/logo/logo.webp" 
              alt="S.S. Pharmacy Logo" 
              className="h-9 w-auto" 
              width={96}
              height={36}
            />
            <span className="font-bold text-white tracking-widest text-sm font-serif">S.S. PHARMACY</span>
          </div>
          <p className="text-[#FDF8F0]/80 leading-relaxed font-light">
            Government-licensed Ayurvedic manufacturer located in Yerraguntla, Kadapa District, Andhra Pradesh. We formulate authentic preparations using potent botanical bio-extracts.
          </p>
        </div>

        {/* Formulations / Navigation */}
        <div className="space-y-4">
          <h4 className="font-bold text-white uppercase tracking-wider text-[10px] border-b border-[#1A5C5E] pb-2">Formulations</h4>
          <div className="flex flex-col gap-2.5">
            <Link href="/products" className="text-[#FDF8F0]/80 hover:text-[#E8C87A] transition-colors flex items-center gap-1">
              <span>Products</span>
            </Link>
            <Link href="/order-tracking" className="text-[#FDF8F0]/80 hover:text-[#E8C87A] transition-colors">
              Order Tracking
            </Link>
            <Link href="/products" className="text-[#FDF8F0]/80 hover:text-[#E8C87A] transition-colors">
              Skin Care Creams
            </Link>
            <Link href="/products" className="text-[#FDF8F0]/80 hover:text-[#E8C87A] transition-colors">
              Pain Relief Creams & Pills
            </Link>
            <Link href="/why-choose-us" className="text-[#FDF8F0]/80 hover:text-[#E8C87A] transition-colors">
              Quality Assurance
            </Link>
          </div>
        </div>

        {/* Compliance Registry */}
        <div className="space-y-4">
          <h4 className="font-bold text-white uppercase tracking-wider text-[10px] border-b border-[#1A5C5E] pb-2">Compliance Registry</h4>
          <div className="space-y-3 text-[#FDF8F0]/80 font-light">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C9943E] shrink-0 mt-0.5" />
              <p>
                Mfg Lic No: <strong className="text-white font-semibold">R-1970/Ayur</strong><br />
                <span className="text-[10px] text-[#FDF8F0]/60">AYUSH Dept. Govt of Andhra Pradesh</span>
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
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#C9943E] shrink-0" />
              <a href="tel:+919848523295" className="hover:text-[#E8C87A] transition-colors">+91 98485 23295</a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#C9943E] shrink-0" />
              <a href="mailto:info@sspharmacy.co.in" className="hover:text-[#E8C87A] transition-colors">info@sspharmacy.co.in</a>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#C9943E] shrink-0 mt-0.5" />
              <address className="not-italic leading-relaxed">
                Prakash Nagar, Yerraguntla,<br />
                YSR Kadapa Dist., A.P. - 516309
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
            <Link href="/privacy" className="hover:text-[#E8C87A] transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#E8C87A] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
