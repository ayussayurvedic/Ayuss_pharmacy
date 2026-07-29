'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Handshake, ArrowRight, Package } from 'lucide-react';

export default function PartnershipCard() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#134547] via-[#1A5C5E] to-[#0f3436] border-2 border-[#C9943E]/40 p-8 sm:p-10 md:p-14 text-white shadow-xl"
      >
        {/* Decorative Gold Radial Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C9943E]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#2A7B7E]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Text Column */}
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8C87A]/10 text-[#E8C87A] border border-[#E8C87A]/30 text-[10px] font-bold uppercase tracking-wider">
              <Handshake size={14} className="text-[#E8C87A]" />
              <span>Partner With S.S. Pharmacy</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold uppercase text-white leading-tight tracking-wide">
              Looking for Wholesale or Distributorship?
            </h2>

            <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed font-light">
              We partner with medical shops, clinics, hospitals, and regional wholesale buyers. Gain exclusive regional distribution rights and full compliance collateral support.
            </p>
          </div>

          {/* Right Action Buttons Column */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 shrink-0 pt-2 lg:pt-0">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#C9943E] hover:bg-[#b78332] text-white font-bold rounded-xl text-xs sm:text-sm uppercase tracking-wider shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 min-h-[46px]"
            >
              <span>Apply for Distributorship</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/30 text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 min-h-[46px]"
            >
              <Package size={16} className="text-[#E8C87A]" />
              <span>View Product Range</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
