'use client';

import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import Image from 'next/image';

export default function AboutTeaser() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 py-16 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-[46%_54%] gap-14 items-center">
        {/* Left Side: About Image Column */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="hidden md:block relative rounded-[20px] overflow-hidden border border-[#1A5C5E]/12 shadow-[0_12px_32px_rgba(0,0,0,0.06)]"
        >
          <Image 
            src="/products/moon-light/moon-cream-hero-section.webp" 
            alt="Authentic Ayurvedic herbal formulation" 
            className="w-full min-h-[380px] max-h-[440px] object-cover block"
            width={600}
            height={440}
            sizes="50vw"
          />
        </motion.div>

        {/* Right Side: Content Column */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="max-w-[580px] space-y-5 text-left"
        >
          <div className="flex items-center gap-2">
            <span className="w-8 h-[1px] bg-[#C9943E]" />
            <span className="text-[12px] font-bold text-[#2A7B7E] uppercase tracking-[0.14em] block">ABOUT AYU S.S. PHARMACY</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#1A5C5E] font-bold leading-tight">Rooted in Tradition, Committed to Quality</h2>
          
          <p className="text-[15px] font-sans font-normal text-[#404040] leading-[1.7] my-3">
            Established with a vision to make authentic Ayurvedic healing reliable and accessible, AYU S.S. PHARMACY manufactures proprietary herbal healthcare remedies designed around everyday wellness needs.
          </p>
          <p className="text-[15px] font-sans font-normal text-[#404040] leading-[1.7] my-3">
            Operating out of Yerraguntla, Andhra Pradesh under official license code <strong>R-1970/Ayur</strong>, our team enforces strict quality standards from botanical raw herb inspection to final packaging.
          </p>

          <div className="flex items-center gap-4 mt-6 p-4 bg-[#EDF5F5] border border-[#1A5C5E]/15 rounded-[14px]">
            <div className="text-[#1A5C5E] shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="font-bold text-[#1A5C5E] block text-[13px] font-sans">Government Licensed Facility</span>
              <span className="text-[11px] text-[#55785f] block font-sans">License No. R-1970/Ayur | YSR Kadapa Dist., A.P.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
