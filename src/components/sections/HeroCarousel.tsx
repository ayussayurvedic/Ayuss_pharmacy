'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Slide {
  id: string;
  desktopImage: string;
  mobileImage: string;
  alt: string;
  eyebrow: string;
  title: string;
  titleLine2?: string;
  subtitle?: string;
  description: string;
  productId: string;
}

const slides: Slide[] = [
  {
    id: 'moon-cream',
    desktopImage: '',
    mobileImage: '',
    alt: 'Moon Light Cream – Pure Ayurvedic Skin Care',
    eyebrow: 'TRADITIONAL HEALING • MODERN WELLNESS',
    title: 'Moon Light',
    titleLine2: 'Cream',
    subtitle: 'Natural Care for Radiant Skin',
    description: 'Pure Ayurvedic herbal skincare remedy formulated with Manjishta, Chandana, and Kumkuma for pimples, dark spots, tan removal, and natural glow.',
    productId: 'moon-light-cream'
  },
  {
    id: 'pain-cream',
    desktopImage: '',
    mobileImage: '',
    alt: 'Dr. Lion Pain Relief Cream – S.S. Pharmacy',
    eyebrow: 'TRADITIONAL HEALING • MODERN WELLNESS',
    title: 'Dr. Lion',
    titleLine2: 'Pain Cream',
    subtitle: 'Soothing Relief for Every Move',
    description: 'An Ayurvedic pain relief cream formulated with powerful natural ingredients that help relieve joint pain, muscle pain, back pain, headache and body discomfort.',
    productId: 'dr-lion-pain-cream'
  },
  {
    id: 'brand-main',
    desktopImage: '',
    mobileImage: '',
    alt: 'Ayurvedic Solutions for Modern Wellness – S.S. Pharmacy',
    eyebrow: 'TRADITIONAL HEALING • MODERN WELLNESS',
    title: 'Ayurvedic Solutions for',
    titleLine2: 'Modern Wellness',
    description: 'S.S. Pharmacy manufactures licensed, quality-focused Ayurvedic medicines and herbal healthcare formulations designed to support musculoskeletal comfort and healthy-looking skin.',
    subtitle: 'Pure Ayurveda, Pure Life',
    productId: 'all'
  },
  {
    id: 'pain-pills',
    desktopImage: '',
    mobileImage: '',
    alt: 'Dr. Lion Pain Pills – Traditional Herbal Remedy',
    eyebrow: 'TRADITIONAL HEALING • MODERN WELLNESS',
    title: 'Dr. Lion',
    titleLine2: 'Pain Pills',
    subtitle: 'Relief from Within, Strength for Life',
    description: 'Traditional Ayurvedic proprietary medicine formulated with purified herbal extracts for deep joint mobility, muscular comfort, and natural strength.',
    productId: 'dr-lion-pain-pills'
  }
];

export default function HeroCarousel() {
  const [carouselSlides, setCarouselSlides] = useState<Slide[]>(slides);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % carouselSlides.length);
  }, [carouselSlides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  }, [carouselSlides.length]);

  useEffect(() => {
    async function loadBanners() {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Database fetch timed out')), 3500)
      );

      try {
        const supabase = createClient();
        const dbPromise = supabase
          .from('page_assets')
          .select('*')
          .eq('section_name', 'hero_carousel')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        const result: any = await Promise.race([dbPromise, timeoutPromise]);
        const { data, error } = result;

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped: Slide[] = data.map((dbS: any) => {
            const desktop = dbS.desktop_image_url || '';
            const mobile = dbS.mobile_image_url || desktop;

            return {
              id: dbS.id,
              desktopImage: desktop,
              mobileImage: mobile,
              alt: dbS.title || 'S.S. Pharmacy Banner',
              eyebrow: 'TRADITIONAL HEALING • MODERN WELLNESS',
              title: dbS.title || '',
              titleLine2: '',
              subtitle: dbS.subtitle || '',
              description: dbS.description || '',
              productId: dbS.link_url || 'all'
            };
          });

          // Only update if array actually changed to prevent initial hydration blinking
          setCarouselSlides((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(mapped)) return prev;
            return mapped;
          });
          return;
        }

        throw new Error('Database returned empty banner assets');
      } catch (err) {
        console.error('Failed to load page assets from Supabase. Trying GitHub Raw fallback...', err);
        try {
          const githubSlides: Slide[] = slides.map(s => {
            const desktopFilename = s.desktopImage.split('/').pop();
            const mobileFilename = s.mobileImage.split('/').pop();
            return {
              ...s,
              desktopImage: `https://raw.githubusercontent.com/janakirao07/Ss_pharmacy/main/public/products/hero-section/hero_section_desktop_image's/${desktopFilename}`,
              mobileImage: `https://raw.githubusercontent.com/janakirao07/Ss_pharmacy/main/public/products/hero-section/hero_section_mobile_image's/${mobileFilename}`
            };
          });
          setCarouselSlides((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(githubSlides)) return prev;
            return githubSlides;
          });
        } catch (gitErr) {
          console.error('GitHub Raw fallback failed. Loading local public assets...', gitErr);
          setCarouselSlides(slides);
        }
      }
    }
    loadBanners();
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  const activeSlide = carouselSlides[current] || slides[0];

  if (isMobile === null) {
    return (
      <section className="relative w-full bg-[#FDFBF7] pt-20">
        <div className="w-full h-[320px] md:h-[620px] lg:h-[680px] bg-slate-100/50 animate-pulse" />
      </section>
    );
  }

  return (
    <section 
      className="relative w-full bg-[#FDFBF7] overflow-hidden font-sans select-none pt-20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {isMobile ? (
        /* Mobile View: No Text, height is natural image height. Renders ONLY the mobile image. */
        <div className="w-full relative">
          <AnimatePresence mode="popLayout">
            <motion.img
              key={activeSlide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'linear' }}
              src={activeSlide.mobileImage}
              alt={activeSlide.alt}
              className="w-full h-auto object-cover block m-0 p-0"
            />
          </AnimatePresence>
        </div>
      ) : (
        /* Desktop View: Text overlays, standard fixed height. Renders ONLY the desktop image. */
        <div className="relative w-full h-[620px] lg:h-[680px]">
          {/* Desktop Image with Smooth Synchronized Crossfade */}
          <div className="absolute inset-0 z-0">
            <AnimatePresence mode="popLayout">
              <motion.img
                key={activeSlide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                src={activeSlide.desktopImage}
                alt={activeSlide.alt}
                className="w-full h-full object-cover object-right"
              />
            </AnimatePresence>
          </div>

          {/* Scrim Overlay */}
          <div 
            className="absolute inset-0 pointer-events-none z-10" 
            style={{
              background: 'linear-gradient(90deg, rgba(253, 248, 240, 0.65) 0%, rgba(253, 248, 240, 0.25) 32%, rgba(253, 248, 240, 0) 55%)'
            }}
          />

          {/* Text content */}
          <div className="absolute inset-0 z-20 flex items-center">
            <div className="max-w-[1280px] w-full mx-auto px-6 pointer-events-none">
              <div className="w-[42%] max-w-[540px] flex flex-col items-start text-left pointer-events-auto">
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={activeSlide.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2.5 mb-2.5 w-full">
                      <span className="flex-1 max-w-[32px] h-[1px] bg-[#C9943E] opacity-65" />
                      <span className="text-[13px] font-semibold tracking-[0.14em] text-[#2A7B7E] uppercase shrink-0 font-sans">{activeSlide.eyebrow}</span>
                      <span className="flex-1 max-w-[32px] h-[1px] bg-[#C9943E] opacity-65" />
                    </div>

                    <h1 className="text-[#1A5C5E] font-semibold leading-[1.15] tracking-[-0.02em] font-serif text-2xl sm:text-[34px] lg:text-[54px]">
                      {activeSlide.title}
                      {activeSlide.titleLine2 && (
                        <>
                          <br />
                          <span className="italic font-medium text-[#C9943E]">{activeSlide.titleLine2}</span>
                        </>
                      )}
                    </h1>

                    {activeSlide.subtitle && (
                      <h2 className="italic font-normal text-[#C9943E] leading-[1.2] font-serif text-[18px] lg:text-[26px]">{activeSlide.subtitle}</h2>
                    )}

                    <p className="text-slate-600 font-light leading-[1.65] max-w-[500px] font-sans text-[14px] lg:text-[16px]">
                      {activeSlide.description}
                    </p>

                    <div className="flex items-center gap-3 pt-2">
                      <Link 
                        href={activeSlide.productId === 'all' ? '/products' : `/products/${activeSlide.productId}`} 
                        className="inline-flex items-center justify-center gap-2 bg-[#1A5C5E] hover:bg-[#134547] hover:-translate-y-0.5 text-white font-sans text-[14px] font-semibold tracking-[0.01em] px-6 py-2.5 rounded-full border border-[#1A5C5E] cursor-pointer shadow-md transition-all min-h-[44px]"
                      >
                        <span>Explore Products</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link 
                        href="/about" 
                        className="inline-flex items-center justify-center bg-[#FDFBF7] hover:bg-[#F2F7F7] hover:-translate-y-0.5 text-[#1A5C5E] font-sans text-[14px] font-semibold tracking-[0.01em] px-6 py-2.5 rounded-full border border-[#C9D5D5] hover:border-[#C9943E] cursor-pointer transition-all min-h-[44px]"
                      >
                        Learn More
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Arrow Navigation (shows only on desktop) */}
      {!isMobile && (
        <div>
          <button 
            type="button" 
            onClick={prev} 
            className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white text-[#1A5C5E] border border-[#1A5C5E]/15 flex items-center justify-center cursor-pointer z-30 shadow hover:scale-110 transition-all hover:text-[#1A5C5E]"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            type="button" 
            onClick={next} 
            className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white text-[#1A5C5E] border border-[#1A5C5E]/15 flex items-center justify-center cursor-pointer z-30 shadow hover:scale-110 transition-all hover:text-[#1A5C5E]"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Navigation Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {carouselSlides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer border-0 ${i === current ? 'bg-[#C9943E] w-6' : 'bg-slate-400/50'}`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
