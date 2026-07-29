'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  HeartHandshake, 
  ArrowRight, 
  FileCheck, 
  Award, 
  FileText, 
  FlaskConical 
} from 'lucide-react';
import PartnershipCard from '@/components/sections/PartnershipCard';

export default function AboutClient() {
  return (
    <div className="bg-[#FDF8F0] text-slate-800 pt-24 pb-16 min-h-screen font-sans">
      {/* 1. Hero Header & Trust Badges */}
      <section className="border-b border-[#C9D5D5]/60 pb-8 pt-2">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[11px] text-[#2A7B7E] font-medium mb-4 uppercase tracking-wider">
            <Link href="/" className="hover:text-[#1A5C5E] transition-colors">Home</Link>
            <span>•</span>
            <span className="text-slate-400">About Us</span>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="text-[11px] font-bold text-[#C9943E] uppercase tracking-wider block mb-2">Our Heritage & Vision</span>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif text-[#1A5C5E] font-semibold leading-snug uppercase mb-3">
              Rooted in Ayurvedic Tradition,<br />
              <span className="text-[#C9943E] italic">Driven by Quality</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl font-light">
              S.S. Pharmacy manufactures authentic Ayurvedic formulations and herbal remedies designed to support long-term health, joint mobility, and skin comfort.
            </p>
          </motion.div>

          {/* Credentials Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#C9D5D5]/50"
          >
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#C9D5D5]/40 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-[#C9943E]/10 border border-[#C9943E]/20 text-[#C9943E] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="font-bold text-[11px] text-[#1A5C5E] uppercase block">AYUSH Approved</span>
                <span className="text-[9px] text-slate-400 font-medium">Govt. Registered</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#C9D5D5]/40 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-[#C9943E]/10 border border-[#C9943E]/20 text-[#C9943E] flex items-center justify-center shrink-0">
                <Award className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="font-bold text-[11px] text-[#1A5C5E] uppercase block">GMP Standard</span>
                <span className="text-[9px] text-slate-400 font-medium">Quality Certified</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#C9D5D5]/40 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-[#C9943E]/10 border border-[#C9943E]/20 text-[#C9943E] flex items-center justify-center shrink-0">
                <FileCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="font-bold text-[11px] text-[#1A5C5E] uppercase block">Schedule T</span>
                <span className="text-[9px] text-slate-400 font-medium">Compliance Audited</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#C9D5D5]/40 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-[#C9943E]/10 border border-[#C9943E]/20 text-[#C9943E] flex items-center justify-center shrink-0">
                <FlaskConical className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="font-bold text-[11px] text-[#1A5C5E] uppercase block">100% Herbal</span>
                <span className="text-[9px] text-slate-400 font-medium">Potent Bio-extracts</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Brand Story / Detailed Credentials */}
      <section className="py-14 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Story Visual Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-5"
            >
              <div className="relative rounded-2xl overflow-hidden border border-[#C9D5D5] shadow-md bg-white group aspect-[4/5] max-h-[460px]">
                <img
                  src="/products/Moon-light/Moon cream Hero_section.webp"
                  alt="Ayurvedic herbs and formulation process at S.S. Pharmacy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A5C5E]/90 via-[#1A5C5E]/30 to-transparent flex items-end p-6 md:p-8">
                  <div className="space-y-1.5">
                    <span className="inline-block px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#C9943E] bg-[#1A5C5E]/80 border border-[#C9943E]/30 rounded-md backdrop-blur-sm">
                      Ayurvedic Manufacturing Facility
                    </span>
                    <h4 className="font-serif text-lg text-white font-semibold tracking-wide">Yerraguntla Unit, Andhra Pradesh</h4>
                    <p className="text-[10px] text-slate-200 font-mono">Mfg. License Code: R-1970/Ayur</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Story Text Content */}
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A5C5E]/5 text-[#1A5C5E] border border-[#1A5C5E]/15 text-[11px] font-semibold uppercase tracking-wider">
                <FileCheck size={14} className="text-[#C9943E]" />
                <span>Statutory Credentials & Compliance</span>
              </div>

              <h2 className="font-serif text-xl sm:text-2xl md:text-3xl text-[#1A5C5E] leading-snug font-semibold uppercase">
                One-Stop Solution for Authentic Ayurvedic Remedies
              </h2>
              
              <p className="text-slate-650 text-sm leading-relaxed font-light">
                Established with a firm commitment to making the healing benefits of classical Ayurveda reliable and accessible, S.S. Pharmacy formulates proprietary Ayurvedic preparations tailored to everyday wellness needs. From joint pain relief to skin vitality, our products are crafted under strict quality parameters.
              </p>

              <p className="text-slate-650 text-sm leading-relaxed font-light">
                Operating out of our licensed facility in Yerraguntla, Kadapa District, Andhra Pradesh (License No. <strong>R-1970/Ayur</strong>), we strictly monitor raw botanical sourcing, batch processing, hygiene, and safe packaging standards.
              </p>

              {/* Statutory License Card */}
              <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#C9D5D5]/40 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-[#C9943E]/10 text-[#C9943E] flex items-center justify-center shrink-0 border border-[#C9943E]/30">
                  <ShieldCheck size={22} />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif font-bold text-[#1A5C5E] text-base">Government Licensed Ayurvedic Unit</h3>
                    <span className="bg-[#C9943E]/10 text-[#C9943E] text-[8px] font-bold px-2 py-0.5 rounded border border-[#C9943E]/30 uppercase tracking-wider">
                      Approved
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Mfg. License No. <strong className="text-[#1A5C5E]">R-1970/Ayur</strong> | Issued by the Licensing Authority of Andhra Pradesh for Ayurvedic Proprietary Medicines.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Core Values Grid */}
      <section className="py-14 md:py-20 bg-[#FEFCF8] border-y border-[#C9D5D5]">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-xl mx-auto mb-14"
          >
            <span className="text-[11px] font-bold text-[#C9943E] uppercase tracking-wider block mb-2">Foundational Principles</span>
            <h2 className="text-2xl md:text-3xl font-serif text-[#1A5C5E] font-semibold uppercase">Our Guiding Core Values</h2>
            <p className="text-xs text-slate-500 mt-2 font-light">The fundamental pillars steering research, batch processing, and distribution across India.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
              whileHover={{ y: -3 }}
              className="bg-[#FDF8F0] p-6 rounded-2xl border border-[#C9D5D5]/60 hover:border-[#C9943E] transition-all duration-300 shadow-xs hover:shadow-md group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#C9943E]/10 text-[#C9943E] flex items-center justify-center mb-5 border border-[#C9943E]/25 group-hover:bg-[#1A5C5E] group-hover:text-white transition-all">
                <Sparkles size={20} />
              </div>
              <h3 className="font-serif text-lg text-[#1A5C5E] font-bold uppercase mb-2">Authenticity</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-light">
                We strictly source genuine herbal raw materials and utilize traditional Ayurvedic formulation rules to maintain batch strength and purity.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              whileHover={{ y: -3 }}
              className="bg-[#FDF8F0] p-6 rounded-2xl border border-[#C9D5D5]/60 hover:border-[#C9943E] transition-all duration-300 shadow-xs hover:shadow-md group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#C9943E]/10 text-[#C9943E] flex items-center justify-center mb-5 border border-[#C9943E]/25 group-hover:bg-[#1A5C5E] group-hover:text-white transition-all">
                <FileText size={20} />
              </div>
              <h3 className="font-serif text-lg text-[#1A5C5E] font-bold uppercase mb-2">Quality Assurance</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-light">
                Every production lot undergoes rigorous hygiene checks, sterile packaging protocols, and standardized quality validation before distribution.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              whileHover={{ y: -3 }}
              className="bg-[#FDF8F0] p-6 rounded-2xl border border-[#C9D5D5]/60 hover:border-[#C9943E] transition-all duration-300 shadow-xs hover:shadow-md group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#C9943E]/10 text-[#C9943E] flex items-center justify-center mb-5 border border-[#C9943E]/25 group-hover:bg-[#1A5C5E] group-hover:text-white transition-all">
                <HeartHandshake size={20} />
              </div>
              <h3 className="font-serif text-lg text-[#1A5C5E] font-bold uppercase mb-2">Responsible Wording</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-light">
                We practice honest communication. We avoid unverified medical claims and present wellness benefits accurately according to regulations.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Geography / Facility Details */}
      <section className="py-14 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 space-y-5"
            >
              <span className="inline-block px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#C9943E] bg-[#C9943E]/10 border border-[#C9943E]/30 rounded-md">
                Facility Headquarters
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#1A5C5E] font-semibold uppercase">Manufacturing Base in Andhra Pradesh</h2>
              <p className="text-slate-650 text-sm leading-relaxed font-light">
                Our state-approved manufacturing plant is located in Yerraguntla, Kadapa District, Andhra Pradesh. This hub manages raw material processing, quality control testing, batch bottling, and regional distribution dispatch.
              </p>
              
              <div className="mt-6 p-5 rounded-2xl bg-white border border-[#C9D5D5] flex items-start space-x-4 shadow-xs">
                <div className="p-2.5 rounded-xl bg-[#C9943E]/10 text-[#C9943E] shrink-0 mt-0.5 border border-[#C9943E]/20">
                  <MapPin size={20} />
                </div>
                <address className="not-italic">
                  <h3 className="font-serif text-base font-bold text-[#1A5C5E] uppercase">S.S. Pharmacy Unit</h3>
                  <p className="text-slate-550 text-xs mt-1.5 leading-relaxed font-sans">
                    D. No. 1-2-211 and 1-2-212, Prakash Nagar,<br />
                    Yerraguntla Panchayati, YSR Kadapa District,<br />
                    Andhra Pradesh - 516309, India
                  </p>
                </address>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-6"
            >
              <div className="w-full rounded-2xl overflow-hidden border border-[#C9D5D5] shadow-xs bg-white flex flex-col">
                <div className="relative w-full h-[240px] md:h-[280px] overflow-hidden bg-slate-100">
                  <img
                    src="https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=900&height=420&center=lonlat:78.571027,14.755504&zoom=14&marker=lonlat:78.571027,14.755504;color:%231a5c5e;size:medium&apiKey=34036dd1e9ed4badb10aed72da04affb"
                    alt="S.S. Pharmacy Manufacturing Facility Map"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 sm:p-5 bg-white border-t border-[#C9D5D5]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-[#1A5C5E] animate-pulse shrink-0" />
                    <div>
                      <h3 className="font-serif text-xs font-bold text-[#1A5C5E] uppercase">Registered Unit Location</h3>
                      <p className="text-[10px] text-slate-500 font-sans">Yerraguntla, Kadapa Dist, AP - 516309</p>
                    </div>
                  </div>
                  <a
                    href="https://maps.app.goo.gl/UwgF81SSMDMUAEFV8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1A5C5E] hover:bg-[#134547] text-white text-xs font-bold rounded-xl shadow-xs transition-all duration-200 min-h-[40px] w-full sm:w-auto uppercase tracking-wider"
                  >
                    <MapPin size={14} className="text-[#C9943E]" />
                    <span>Open Maps Directions</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Partnership Card */}
      <PartnershipCard />
    </div>
  );
}
