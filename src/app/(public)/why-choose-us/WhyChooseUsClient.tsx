'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
  ShieldCheck, 
  Award, 
  FlaskConical, 
  Leaf, 
  Factory, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';

export default function WhyChooseUsClient() {
  const points = [
    {
      title: "Authentic Sourcing",
      desc: "All botanicals undergo strict chemical potency assays to verify raw herb purity and identify target organic markers.",
      icon: Leaf
    },
    {
      title: "Heavy Metal Safe",
      desc: "Every batch is verified to meet strict pharmacopoeial safety limits, ensuring zero toxic heavy metal contamination.",
      icon: FlaskConical
    },
    {
      title: "Government Monitored",
      desc: "Operating under registration license R-1970/Ayur with regular state AYUSH inspections and quality control audits.",
      icon: ShieldCheck
    },
    {
      title: "Complete Traceability",
      desc: "Every single production batch maps directly to raw material batch sheets, ensuring ultimate product accountability.",
      icon: Award
    }
  ];

  const faqItems = [
    {
      question: "Is S.S. Pharmacy a government licensed manufacturer?",
      answer: "Yes. S.S. Pharmacy operates under Manufacturing License No. R-1970/Ayur, issued by the Licensing Authority of Andhra Pradesh under the AYUSH Department. Our facility is subject to regular government inspections."
    },
    {
      question: "Are S.S. Pharmacy products tested for heavy metal safety?",
      answer: "Every batch is verified to meet strict pharmacopoeial safety limits for heavy metals including lead, mercury, arsenic, and cadmium — ensuring zero toxic heavy metal contamination above permissible levels."
    },
    {
      question: "What is Schedule T compliance?",
      answer: "Schedule T is a set of Good Manufacturing Practice (GMP) standards specifically mandated for Ayurvedic, Siddha, and Unani medicines in India. Our facility adheres to these standards for cleanliness, equipment calibration, raw material testing, and batch documentation."
    },
    {
      question: "Where is S.S. Pharmacy located?",
      answer: "Our manufacturing facility is located at D. No. 1-2-211 & 1-2-212, Prakash Nagar, Yerraguntla Panchayati, YSR Kadapa District, Andhra Pradesh - 516309, India."
    },
    {
      question: "Can I become a wholesale distributor for S.S. Pharmacy?",
      answer: "Yes! We partner with medical shops, clinics, hospitals, and regional wholesale buyers. Contact us through our Contact page or call +91 98485 23295 to apply for regional distribution rights."
    },
  ];

  return (
    <div className="bg-[#FDF8F0] text-slate-800 pt-24 pb-16 min-h-screen font-sans">
      {/* Hero Header */}
      <section className="border-b border-[#C9D5D5]/60 pb-6 pt-2 mb-8">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          {/* Breadcrumbs */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-[#2A7B7E] font-medium mb-4 uppercase tracking-wider">
            <Link href="/" className="hover:text-[#1A5C5E] transition-colors">Home</Link>
            <span>•</span>
            <span className="text-slate-400">Why Choose Us</span>
          </div>

          <div className="max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-bold text-[#C9943E] uppercase tracking-wider block">Foundational Standards</span>
            <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-serif text-[#1A5C5E] font-semibold leading-snug uppercase">
              Why Choose S.S. Pharmacy?
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed font-light">
              Our production philosophy bridges time-tested Ayurvedic insights with rigorous analytical laboratory checks to deliver genuine relief.
            </p>
          </div>
        </div>
      </section>

      {/* Points Grid */}
      <section className="max-w-[1200px] mx-auto px-6 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {points.map((pt, idx) => {
            const Icon = pt.icon;
            return (
              <div 
                key={idx}
                className="bg-white p-6 rounded-2xl border border-[#C9D5D5]/50 hover:border-[#C9943E] hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-[#C9943E]/10 text-[#C9943E] flex items-center justify-center border border-[#C9943E]/25 group-hover:bg-[#1A5C5E] group-hover:text-white transition-all">
                    <Icon size={18} />
                  </div>
                  <h3 className="font-serif text-base font-bold text-[#1A5C5E] uppercase tracking-wide">
                    {pt.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-light">
                    {pt.desc}
                  </p>
                </div>
                
                <div className="pt-4 flex items-center gap-1.5 text-[9px] font-bold text-[#C9943E] uppercase tracking-wider border-t border-slate-100 mt-5">
                  <CheckCircle2 size={11} className="text-[#1A5C5E]" />
                  <span>Quality Standard Verified</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quality Credentials Row */}
      <section className="max-w-[1200px] mx-auto px-6 mb-16">
        <div className="bg-white p-8 rounded-2xl border border-[#C9D5D5] shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A5C5E]/5 text-[#1A5C5E] border border-[#1A5C5E]/15 text-[9px] font-bold uppercase tracking-wider">
              <Factory size={12} className="text-[#C9943E]" />
              <span>Ayush Manufacturing Unit</span>
            </div>
            <h2 className="font-serif text-2xl text-[#1A5C5E] font-semibold uppercase">
              Audited Under Schedule T GMP Standards
            </h2>
            <p className="text-slate-500 text-xs font-light leading-relaxed max-w-2xl">
              S.S. Pharmacy operates out of a custom-designed facility equipped with stainless-steel processing vessels, cleanroom air filters, and batch isolation mechanisms to prevent chemical or heavy metal contamination.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-3 justify-center">
            <div className="p-3 border rounded-xl bg-slate-50/50 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#1A5C5E]" />
              <div>
                <span className="font-bold block text-[10px] text-slate-800 uppercase tracking-wider">License R-1970/Ayur</span>
                <span className="text-[9px] text-slate-400">Govt. Registered Formulation Unit</span>
              </div>
            </div>
            <div className="p-3 border rounded-xl bg-slate-50/50 flex items-center gap-3">
              <Award className="w-5 h-5 text-[#1A5C5E]" />
              <div>
                <span className="font-bold block text-[10px] text-slate-800 uppercase tracking-wider">GMP Certificate</span>
                <span className="text-[9px] text-slate-400">Schedule T Audited & Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="max-w-[1000px] mx-auto px-6 py-16">
        <div className="text-center space-y-3 mb-10">
          <span className="text-[11px] font-bold text-[#C9943E] uppercase tracking-wider block">Common Questions</span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#1A5C5E] font-bold leading-tight uppercase">
            Frequently Asked Questions
          </h2>
          <div className="flex items-center justify-center gap-2" aria-hidden="true">
            <span className="w-10 h-[1px] bg-[#C9943E] opacity-50" />
            <Leaf className="w-3.5 h-3.5 text-[#C9943E]" />
            <span className="w-10 h-[1px] bg-[#C9943E] opacity-50" />
          </div>
        </div>

        <div className="space-y-3">
          {faqItems.map((faq, i) => (
            <details 
              key={i} 
              className="group bg-white border border-[#C9D5D5] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow"
            >
              <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none text-sm font-semibold text-[#1A5C5E] hover:bg-[#F2F7F7] transition-colors select-none">
                <span>{faq.question}</span>
                <ArrowRight className="w-4 h-4 text-[#C9943E] shrink-0 transition-transform group-open:rotate-90" />
              </summary>
              <div className="px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-[#C9D5D5]/50">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-[1200px] mx-auto px-6 pb-16">
        <div className="relative rounded-3xl overflow-hidden min-h-[220px] md:min-h-[280px]">
          <Image
            src="/products/Moon-light/Moon cream Hero_section.webp"
            alt="S.S. Pharmacy Ayurvedic product range"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
          />

          {/* Light Text Scrim Overlay (Left Side Only for High Readability) */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />

          {/* Card Content */}
          <div className="relative z-20 p-8 sm:p-10 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full">
            <div className="space-y-3 max-w-xl">
              <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#E8C87A] bg-black/40 border border-[#E8C87A]/40 rounded-full backdrop-blur-md">
                Authentic Formulation Range
              </span>
              <h3 
                className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wide text-white leading-tight"
                style={{ textShadow: '0 2px 14px rgba(0,0,0,0.85), 0 1px 4px rgba(0,0,0,0.7)' }}
              >
                Explore Our Formulations
              </h3>
              <p 
                className="text-slate-100 text-xs sm:text-sm md:text-base leading-relaxed font-normal max-w-lg"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.85)' }}
              >
                Browse our complete catalog of classical and proprietary Ayurvedic medicines licensed for daily health support.
              </p>
            </div>

            <Link 
              href="/products" 
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#C9943E] hover:bg-[#b78332] text-white font-bold rounded-xl text-xs sm:text-sm uppercase tracking-wider shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all cursor-pointer border-0 shrink-0 min-h-[46px]"
            >
              <span>Browse Products</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
