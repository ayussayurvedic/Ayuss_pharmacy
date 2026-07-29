'use client';

import { motion } from 'framer-motion';
import { Leaf, ShieldCheck, Handshake, Award } from 'lucide-react';

export default function Mission() {
  return (
    <section className="max-w-[1200px] mx-auto px-6 py-16 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Mission Statement */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-6 space-y-4"
        >
          <span className="text-[11px] font-bold text-[#C9943E] uppercase tracking-wider block">Our Core Mission</span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#1A5C5E] font-semibold leading-snug uppercase">
            Bringing Authentic Ayurvedic Relief to Every Family
          </h2>
          
          <blockquote className="border-l-4 border-[#C9943E] pl-4 italic text-slate-700 text-sm md:text-base leading-relaxed my-5 font-serif">
            "To formulate and manufacture trusted, high-potency Ayurvedic remedies that support body comfort and skin health through traditional wisdom."
          </blockquote>
          
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
            We bridge centuries of classical herbal knowledge with modern quality standards to provide reliable health solutions for wholesale distributors, clinics, and families.
          </p>
        </motion.div>

        {/* Right Side: Our Commitment Card (Redesigned) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="lg:col-span-6 bg-white border border-[#C9D5D5] p-7 sm:p-8 rounded-3xl shadow-md hover:shadow-lg transition-all space-y-6"
        >
          <div className="border-b border-[#C9D5D5]/50 pb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#C9943E] bg-[#C9943E]/10 border border-[#C9943E]/25 mb-2">
              <Award size={12} className="text-[#C9943E]" />
              <span>Our Quality Pledge</span>
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A5C5E] uppercase tracking-wide">
              OUR COMMITMENT
            </h3>
            <p className="text-xs text-slate-500 font-light mt-1">Traditional formulation. Modern quality discipline.</p>
          </div>

          <div className="space-y-5">
            {/* Item 1 */}
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-[#C9943E]/10 text-[#C9943E] border border-[#C9943E]/25 flex items-center justify-center shrink-0 mt-0.5">
                <Leaf size={20} />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-[#1A5C5E] uppercase tracking-wide">100% Herbal Authenticity</h4>
                <p className="text-slate-500 text-xs leading-relaxed font-light">
                  Standardized botanical extracts prepared according to traditional guidelines.
                </p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-[#C9943E]/10 text-[#C9943E] border border-[#C9943E]/25 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck size={20} />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-[#1A5C5E] uppercase tracking-wide">Tested Safety & Purity</h4>
                <p className="text-slate-500 text-xs leading-relaxed font-light">
                  Formulated according to established safety and purity controls.
                </p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-[#C9943E]/10 text-[#C9943E] border border-[#C9943E]/25 flex items-center justify-center shrink-0 mt-0.5">
                <Handshake size={20} />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-[#1A5C5E] uppercase tracking-wide">Reliable Channel Support</h4>
                <p className="text-slate-500 text-xs leading-relaxed font-light">
                  Dedicated wholesale distributor partnerships and verified documentation support.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
