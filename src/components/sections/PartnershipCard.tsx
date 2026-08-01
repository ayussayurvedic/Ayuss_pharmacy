'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Handshake, ArrowRight, Package } from 'lucide-react';

export default function PartnershipCard() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#134547] via-[#1A5C5E] to-[#134547] border border-[#C9943E]/30 p-6 sm:p-8 text-white shadow-lg"
      >
        {/* Glow Effects */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#C9943E]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-[#2A7B7E]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Text Left */}
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8C87A]/10 text-[#E8C87A] border border-[#E8C87A]/25 text-[9px] font-black uppercase tracking-wider font-mono">
              <Handshake size={12} className="text-[#E8C87A]" />
              <span>Partner With S.S. Pharmacy</span>
            </div>

            <h2 className="font-serif text-lg sm:text-xl font-bold uppercase text-white tracking-wide leading-tight">
              Looking for Wholesale or Distributorship?
            </h2>

            <p className="text-slate-200 text-[11px] sm:text-xs leading-relaxed font-light">
              We partner with medical shops, clinics, hospitals, and regional wholesale buyers. Gain exclusive regional distribution rights and full compliance collateral support.
            </p>
          </div>

          {/* Action Right */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-[#C9943E] hover:bg-[#b78332] text-white font-extrabold rounded-lg text-[10.5px] uppercase tracking-wider shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 min-h-[38px] border-0"
            >
              <span>Apply now</span>
              <ArrowRight size={13} />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-white/5 hover:bg-white/12 text-white font-extrabold rounded-lg border border-white/20 text-[10.5px] uppercase tracking-wider transition-all duration-200 min-h-[38px]"
            >
              <Package size={13} className="text-[#E8C87A]" />
              <span>Catalog</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
