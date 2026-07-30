'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Factory, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Sparkles 
} from 'lucide-react';

import PartnershipCard from '@/components/sections/PartnershipCard';

export default function ManufacturingClient() {
  const [activeCert, setActiveCert] = useState(0);

  const pillars = [
    {
      id: "01",
      title: "Authentic Formulation Sourcing",
      desc: "Our formulations adhere strictly to classic Ayurvedic recipes and time-tested herbal ratios. Every raw herb undergoes physical, identity, and moisture checks before entering processing to ensure uniform batch strength.",
      image: "/products/why_choose_us_image.webp",
      badge: "Botanical Raw Material QA"
    },
    {
      id: "02",
      title: "Hygienic Production Process",
      desc: "Our facility operates in sanitized, climate-controlled environments. Equipment and processing vessels undergo mandatory cleaning and sterilization checks between batches to maintain statutory purity standards.",
      image: "/products/chemist_lab.webp",
      badge: "Sanitized Cleanroom Processing"
    },
    {
      id: "03",
      title: "Quality Assurance & Lab Validation",
      desc: "We enforce multi-tiered validation checks. From raw botanical extraction to final bottle seals, every batch is tested to confirm identification metrics, safety, and consistent therapeutic support.",
      image: "/products/moon-light/moon-cream-hero-section.webp",
      badge: "Physico-Chemical Testing"
    }
  ];

  const certificates = [
    {
      title: "Government Ayurvedic Drug License",
      authority: "Licensing Authority of Andhra Pradesh",
      desc: "Official statutory code R-1970/Ayur authorizing the manufacture of proprietary Ayurvedic medicines and external applications.",
      ref: "AYUSH Department State Registration"
    },
    {
      title: "Good Manufacturing Practices (GMP)",
      authority: "Quality Control Audited Unit",
      desc: "Complies with Schedule T Ayurvedic sanitary protocols, cleanroom air filtering, equipment sterilization, and staff hygiene rules.",
      ref: "Schedule T Ayurvedic Compliance"
    },
    {
      title: "Physico-Chemical Quality Testing",
      authority: "Botanical QA & Standardization Board",
      desc: "Every batch undergoes rigorous quality assurance checks verifying botanical identity, heavy metal limits, and moisture parameters.",
      ref: "Purity & Safety Verified"
    }
  ];

  const handleNextCert = () => {
    setActiveCert((prev) => (prev + 1) % certificates.length);
  };

  const handlePrevCert = () => {
    setActiveCert((prev) => (prev - 1 + certificates.length) % certificates.length);
  };

  return (
    <div suppressHydrationWarning className="bg-[#FDF8F0] text-slate-800 pt-24 pb-16 min-h-[100dvh] font-sans">
      {/* 1. Hero Header */}
      <section className="border-b border-[#C9D5D5]/60 pb-6 pt-2">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[11px] text-[#2A7B7E] font-medium mb-4 uppercase tracking-wider">
            <Link href="/" className="hover:text-[#1A5C5E] transition-colors">Home</Link>
            <span>•</span>
            <span className="text-slate-400">Manufacturing</span>
          </div>

          <div className="max-w-3xl">
            <span className="text-[11px] font-bold text-[#C9943E] uppercase tracking-wider block mb-2">Facility Standards & Protocol</span>
            <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-serif text-[#1A5C5E] font-semibold leading-snug uppercase mb-4">
              Licensed Manufacturing & Quality Assurance
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl font-light">
              S.S. Pharmacy operates under government manufacturing code R-1970/Ayur in Andhra Pradesh, enforcing strict hygiene and quality management practices.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Process Grid: Alternating Staggered Rows */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto px-6 space-y-20">
          {pillars.map((pillar, idx) => (
            <motion.div 
              key={pillar.id}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ${
                idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Text block */}
              <motion.div 
                initial={{ opacity: 0, x: idx % 2 === 1 ? 25 : -25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`lg:col-span-7 space-y-4 ${idx % 2 === 1 ? 'lg:order-2' : 'lg:order-1'}`}
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A5C5E]/5 text-[#1A5C5E] border border-[#1A5C5E]/15 text-[10px] font-bold uppercase tracking-wider">
                  Pillar {pillar.id}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl md:text-3xl text-[#1A5C5E] font-semibold uppercase leading-snug">
                  {pillar.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed font-light">
                  {pillar.desc}
                </p>

                {idx === 1 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white p-4.5 rounded-xl border border-[#C9D5D5]/50 flex items-center gap-3.5 mt-5 shadow-sm max-w-[560px]"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#1A5C5E] text-[#C9943E] flex items-center justify-center shrink-0 border border-[#C9943E]/20 shadow-sm">
                      <Factory size={18} />
                    </div>
                    <div>
                      <h5 className="font-serif font-bold text-[#1A5C5E] text-xs uppercase tracking-wide">Govt. Approved Ayurvedic Facility</h5>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-light">Mfg. Lic. R-1970/Ayur guarantees strict statutory compliance and batch safety.</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Visual block */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className={`lg:col-span-5 ${idx % 2 === 1 ? 'lg:order-1' : 'lg:order-2'}`}
              >
                <motion.div 
                  whileHover={{ scale: 1.025 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="relative rounded-2xl overflow-hidden border border-[#C9D5D5] shadow-md bg-white group aspect-[4/3] max-h-[320px] cursor-pointer"
                >
                  <Image
                    src={pillar.image || ''}
                    alt={pillar.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-end p-4">
                    <span className="inline-flex items-center gap-1 bg-[#FDF8F0]/95 backdrop-blur-sm border border-[#C9943E]/30 rounded-md px-2.5 py-1 text-[9px] font-bold text-[#1A5C5E] uppercase tracking-wide">
                      <Sparkles size={10} className="text-[#C9943E]" />
                      <span>{pillar.badge}</span>
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. Certificate Carousel */}
      <section className="bg-[#FEFCF8] border-t border-b border-[#C9D5D5] py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-12 text-center max-w-xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9943E]/10 text-[#C9943E] border border-[#C9943E]/20 text-[10px] font-bold uppercase tracking-wider">
              Statutory Compliance
            </span>
            <h2 className="text-2xl md:text-3xl font-serif text-[#1A5C5E] font-semibold uppercase">Licensing & Quality Certifications</h2>
            <p className="text-slate-500 text-xs font-light">
              Our Yerraguntla plant is registered and audited under State Licensing Authority regulations.
            </p>
          </div>

          <div className="relative max-w-xl mx-auto">
            {/* Slide region */}
            <div className="overflow-hidden rounded-2xl border border-[#C9D5D5] bg-white p-8 shadow-sm text-center min-h-[280px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCert}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="w-14 h-14 rounded-full bg-[#1A5C5E]/5 text-[#C9943E] flex items-center justify-center mx-auto border border-[#C9943E]/20 shadow-inner">
                    <Award size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-[#1A5C5E] uppercase tracking-wide">
                      {certificates[activeCert].title}
                    </h3>
                    <span className="inline-block bg-[#1A5C5E]/5 text-[#1A5C5E] text-[9px] font-bold px-2.5 py-0.5 rounded-full border border-[#1A5C5E]/15 uppercase tracking-wider mt-1.5">
                      {certificates[activeCert].authority}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed font-light max-w-md mx-auto">
                    {certificates[activeCert].desc}
                  </p>
                </motion.div>
              </AnimatePresence>
              
              <div className="pt-4 border-t border-slate-100 mt-6">
                <span className="text-[10px] font-mono font-bold text-[#C9943E] uppercase tracking-wider">
                  {certificates[activeCert].ref}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-3 mt-8">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={handlePrevCert}
                  className="w-10 h-10 rounded-full border border-[#C9D5D5] bg-white text-[#1A5C5E] hover:bg-[#1A5C5E] hover:text-white transition-all shadow-sm flex items-center justify-center cursor-pointer"
                  aria-label="Previous Certificate"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-1.5 px-4 py-1.5 bg-white rounded-full border border-[#C9D5D5] text-[10px] font-bold text-[#1A5C5E] shadow-sm">
                  <span>Certificate {activeCert + 1} of {certificates.length}</span>
                </div>

                <button
                  type="button"
                  onClick={handleNextCert}
                  className="w-10 h-10 rounded-full border border-[#C9D5D5] bg-white text-[#1A5C5E] hover:bg-[#1A5C5E] hover:text-white transition-all shadow-sm flex items-center justify-center cursor-pointer"
                  aria-label="Next Certificate"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Dots */}
              <div className="flex items-center gap-1.5 mt-1">
                {certificates.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveCert(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      activeCert === idx ? 'bg-[#1A5C5E] w-5' : 'bg-slate-300 hover:bg-slate-400 w-2'
                    }`}
                    aria-label={`Go to certificate ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Partnership Card */}
      <PartnershipCard />
    </div>
  );
}
