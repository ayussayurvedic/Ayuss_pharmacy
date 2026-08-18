'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, ShieldCheck, X } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('ss_cookie_consent');
      if (!consent) {
        // Show after a brief delay so page paints smoothly
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Storage unavailable or disabled
    }
  }, []);

  const acceptCookies = () => {
    try {
      localStorage.setItem('ss_cookie_consent', 'accepted');
    } catch {}
    setIsVisible(false);
  };

  const declineCookies = () => {
    try {
      localStorage.setItem('ss_cookie_consent', 'declined');
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside aria-label="Cookie consent" className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/95 backdrop-blur-md border border-[#C9D5D5] p-4 sm:p-5 rounded-2xl shadow-xl shadow-slate-900/10 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#1A5C5E]/10 flex items-center justify-center shrink-0 border border-[#C9943E]/20">
            <Cookie className="w-4 h-4 text-[#C9943E]" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1A5C5E] text-xs">Privacy & Cookies</span>
              <button 
                type="button" 
                onClick={declineCookies} 
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg border-0 bg-transparent cursor-pointer"
                aria-label="Close cookie banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed font-light">
              We use essential cookies to secure your shopping cart and analyze site performance. Learn more in our{' '}
              <Link href="/privacy" className="text-[#1A5C5E] font-semibold underline hover:text-[#134547]">
                Privacy Policy
              </Link>.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={acceptCookies}
                className="bg-[#1A5C5E] hover:bg-[#134547] text-white px-3.5 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer border-0 shadow-xs flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9943E]" />
                <span>Accept</span>
              </button>
              <button
                type="button"
                onClick={declineCookies}
                className="border border-[#C9D5D5] hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg font-medium text-[11px] transition-all cursor-pointer bg-white"
              >
                Essential Only
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
