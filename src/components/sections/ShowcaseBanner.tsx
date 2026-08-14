'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function ShowcaseBanner() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 py-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative w-full min-h-[260px] md:min-h-[300px] rounded-3xl overflow-hidden flex items-center shadow-lg border border-[#C9D5D5]/60 group"
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0 w-full h-full overflow-hidden group-hover:scale-105 transition-transform duration-700">
          <Image 
            src="https://smfeccjfhvcablqfpokn.supabase.co/storage/v1/object/public/products/hero-section/mobile/madebynature-mobile.webp" 
            alt="Ayurveda Herbal Showcase" 
            fill
            className="object-cover object-center md:hidden"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <Image 
            src="https://smfeccjfhvcablqfpokn.supabase.co/storage/v1/object/public/products/hero-section/desktop/madebynature.webp" 
            alt="Ayurveda Herbal Showcase" 
            fill
            className="object-cover object-center hidden md:block"
            sizes="(max-width: 1280px) 100vw, 1280px"
            priority
          />
        </div>

        {/* Dark Gradient Overlay (Constrained to Left Side Only - Right Side 100% Clear) */}
        <div className="absolute inset-y-0 left-0 w-full md:w-[55%] bg-gradient-to-r from-black/90 via-black/50 to-transparent z-10" />

        {/* Content Box */}
        <div className="relative z-20 max-w-lg p-8 sm:p-10 md:p-12 flex flex-col items-start space-y-3">
          <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#E8C87A] bg-black/40 border border-[#E8C87A]/40 rounded-full backdrop-blur-md">
            Ayurvedic Heritage
          </span>

          <h3
            className="text-xl sm:text-2xl md:text-3xl font-serif font-bold leading-tight uppercase tracking-wide text-white"
            style={{ textShadow: '0 2px 14px rgba(0,0,0,0.85), 0 1px 4px rgba(0,0,0,0.7)' }}
          >
            Made by Nature.<br />
            <span className="text-[#E8C87A] italic">Backed by Ayurveda.</span>
          </h3>

          <p
            className="text-xs sm:text-sm text-slate-100 leading-relaxed font-light max-w-md pb-1"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.85)' }}
          >
            Pure ingredients. Traditional wisdom. Licensed Ayurvedic healthcare remedies for your family.
          </p>

          <Link 
            href="/products" 
            className="inline-flex items-center gap-2 bg-[#C9943E] hover:bg-[#b78332] text-white font-sans text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all border-0 min-h-[44px]"
          >
            <span>Explore Products</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
