'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Factory, Leaf } from 'lucide-react';

export default function ManufacturingTeaser() {
  return (
    <section className="bg-[#slate-50] border-t border-b py-16 font-sans">
      <div className="max-w-[1280px] mx-auto px-6 space-y-12">
        <div className="text-center space-y-2.5 max-w-[800px] mx-auto">
          <div className="flex items-center justify-center gap-2">
            <span className="w-8 h-[1px] bg-[#C9943E]" />
            <span className="text-[12px] font-bold text-[#2A7B7E] uppercase tracking-[0.14em]">MANUFACTURING EXCELLENCE</span>
            <span className="w-8 h-[1px] bg-[#C9943E]" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#1A5C5E] font-bold leading-tight uppercase">Licensed Facilities &amp; Rigorous Quality Controls</h2>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            Our plant maintains clean, controlled production floors and stainless-steel processing systems to ensure every batch meets Schedule T Ayurvedic standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[54%_46%] gap-11 items-center">
          {/* Left Side: Compact Facility Photo Panel */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-[18px] overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.05)] bg-[#E2E8F0] border border-[#1A5C5E]/10"
          >
            <img 
              src="/products/chemist_lab.webp" 
              alt="Controlled Ayurvedic pharmaceutical processing facility at S.S. Pharmacy" 
              className="w-full h-auto aspect-[16/10] max-h-[380px] object-cover block transition-transform duration-500 hover:scale-[1.02]"
              width={800}
              height={500}
            />
            <div className="absolute bottom-4 left-4 bg-[#FDF8F0]/94 text-slate-800 px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-bold backdrop-blur-sm shadow border border-[#1A5C5E]/10">
              <ShieldCheck className="w-4 h-4 text-[#C9943E]" />
              <span>GMP Compliant | Schedule T</span>
            </div>
          </motion.div>

          {/* Right Side: Manufacturing Points Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6 text-xs text-slate-650 pl-0 md:pl-4"
          >
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded bg-[#1A5C5E]/5 text-[#C9943E] flex items-center justify-center shrink-0 border border-[#C9943E]/15">
                <Leaf className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#C9943E]">01</span>
                  <h3 className="font-bold text-[#1A5C5E] text-sm">Authentic Sourcing</h3>
                </div>
                <p className="text-slate-500 leading-relaxed text-[11px]">Herbs sourced from local growers and checked for active phytochemical potency and pesticide compliance.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded bg-[#1A5C5E]/5 text-[#C9943E] flex items-center justify-center shrink-0 border border-[#C9943E]/15">
                <Factory className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#C9943E]">02</span>
                  <h3 className="font-bold text-[#1A5C5E] text-sm">Hygienic Facility</h3>
                </div>
                <p className="text-slate-500 leading-relaxed text-[11px]">Licensed under R-1970/Ayur with controlled batch-processing and manufacturing environments.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded bg-[#1A5C5E]/5 text-[#C9943E] flex items-center justify-center shrink-0 border border-[#C9943E]/15">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#C9943E]">03</span>
                  <h3 className="font-bold text-[#1A5C5E] text-sm">Standardized Quality</h3>
                </div>
                <p className="text-slate-500 leading-relaxed text-[11px]">Formulation batches undergo quality checks for identity, purity and safety compliance.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
