# S.S. Pharmacy Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the public storefront homepage of S.S. Pharmacy with a premium, responsive layout using Next.js App Router, Tailwind CSS, Framer Motion, and Lucide icons.

**Architecture:** Decompose the page into modular section components under `src/components/sections/` and assemble them in `src/app/(public)/page.tsx`.

**Tech Stack:** Next.js, Framer Motion, Tailwind CSS, Lucide icons.

## Global Constraints
*   Branding: Use `/products/logo/logo.webp` as the main logo.
*   Theme Colors: Deep forest green (`#1D3A28`), warm cream (`#FEFDF8`), and gold accents (`#D49D42`).
*   Git Commit constraint: Do NOT commit or push to github. Track changes via stage commands.

---

### Task 1: HeroCarousel Component

**Files:**
- Create: `src/components/sections/HeroCarousel.tsx`

**Interfaces:**
- Produces: `HeroCarousel` component handling auto-rotating WebP slides, swipe gestures, and staggered typography transitions.

- [ ] **Step 1: Write HeroCarousel implementation**

Create `src/components/sections/HeroCarousel.tsx`:
```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Leaf } from 'lucide-react';
import Link from 'next/link';

interface Slide {
  id: string;
  desktopImage: string;
  mobileImage: string;
  alt: string;
  eyebrow: string;
  title: string;
  titleLine2?: string;
  subtitle: string;
  description: string;
  productId: string;
}

const slides: Slide[] = [
  {
    id: 'moon-cream',
    desktopImage: '/products/Hero%20section/hero-moon-desktop.webp',
    mobileImage: '/products/Hero%20section/hero-moon-mobile.webp',
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
    desktopImage: '/products/Hero%20section/hero-pain-cream-desktop.webp',
    mobileImage: '/products/Hero%20section/hero-pain-cream-mobile.webp',
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
    desktopImage: '/products/Hero%20section/hero-main-desktop.webp',
    mobileImage: '/products/Hero%20section/hero-main-mobile.webp',
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
    desktopImage: '/products/Hero%20section/hero-pain-pills-desktop.webp',
    mobileImage: '/products/Hero%20section/hero-pain-pills-mobile.webp',
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
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  const activeSlide = slides[current];

  return (
    <section 
      className="relative w-full h-[500px] md:h-[600px] bg-[#122419] overflow-hidden text-white font-sans"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slide Images Fading */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.picture
            key={activeSlide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 block w-full h-full"
          >
            <source media="(max-width: 767px)" srcSet={activeSlide.mobileImage} />
            <img 
              src={activeSlide.desktopImage} 
              alt={activeSlide.alt} 
              className="w-full h-full object-cover object-right-bottom md:object-right" 
            />
          </motion.picture>
        </AnimatePresence>
      </div>

      {/* Scrim Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />

      {/* Slide Text Overlays */}
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="max-w-[1200px] w-full mx-auto px-4">
          <div className="max-w-xl space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="space-y-4 text-left"
              >
                <div className="flex items-center gap-1 text-[#D49D42] text-[10px] font-bold tracking-widest uppercase">
                  <Leaf className="w-3 h-3" />
                  <span>{activeSlide.eyebrow}</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-serif leading-tight">
                  {activeSlide.title} <span className="block text-[#D49D42]">{activeSlide.titleLine2}</span>
                </h2>
                <p className="text-xs md:text-sm text-slate-350 leading-relaxed font-light">
                  {activeSlide.description}
                </p>
                <div className="pt-4">
                  <Link 
                    href={activeSlide.productId === 'all' ? '/products' : `/products/${activeSlide.productId}`} 
                    className="bg-[#D49D42] hover:bg-[#c28f3a] text-white px-5 py-2.5 rounded-lg text-xs font-bold transition-colors uppercase tracking-wider inline-block"
                  >
                    Explore Now
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Arrow Controls */}
      <button 
        type="button" 
        onClick={prev} 
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white cursor-pointer bg-transparent border-0"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button 
        type="button" 
        onClick={next} 
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white cursor-pointer bg-transparent border-0"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </section>
  );
}
```

- [ ] **Step 2: Run build check to verify compilation**

Run: `npm run build`
Expected: Compiled successfully.

---

### Task 2: Rebuilding Teaser Components

**Files:**
- Create: `src/components/sections/Highlights.tsx`
- Create: `src/components/sections/AboutTeaser.tsx`
- Create: `src/components/sections/ManufacturingTeaser.tsx`
- Create: `src/components/sections/Mission.tsx`
- Create: `src/components/sections/ShowcaseBanner.tsx`

- [ ] **Step 1: Create Highlights**

Create `src/components/sections/Highlights.tsx`:
```typescript
'use client';

import { motion } from 'framer-motion';
import { Leaf, ShieldCheck, Award, FlaskConical } from 'lucide-react';

export default function Highlights() {
  return (
    <section className="max-w-[1200px] mx-auto px-4 py-12 -mt-10 relative z-30 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-md flex items-center gap-4 hover:shadow-lg transition-shadow"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center shrink-0">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800">Natural Ingredients</h4>
            <p className="text-[10px] text-slate-400">Carefully selected herbs</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-md flex items-center gap-4 hover:shadow-lg transition-shadow"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800">Ayurvedic Expertise</h4>
            <p className="text-[10px] text-slate-400">Research & tradition</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-md flex items-center gap-4 hover:shadow-lg transition-shadow"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800">GMP Certified</h4>
            <p className="text-[10px] text-slate-400">GMP compliant facility</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="bg-white p-5 rounded-xl border border-slate-100 shadow-md flex items-center gap-4 hover:shadow-lg transition-shadow"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center shrink-0">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-800">No Harmful Chemicals</h4>
            <p className="text-[10px] text-slate-400">Zero steroids or toxins</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create AboutTeaser**

Create `src/components/sections/AboutTeaser.tsx`:
```typescript
'use client';

import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export default function AboutTeaser() {
  return (
    <section className="max-w-[1200px] mx-auto px-4 py-12 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="border-4 border-[#1D3A28]/10 rounded-2xl overflow-hidden p-2"
        >
          <img 
            src="/products/Moon-light/Moon cream Hero_section.webp" 
            alt="Ayurvedic Skincare Formulation" 
            className="w-full h-auto object-cover rounded-xl"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-4 text-xs text-slate-600"
        >
          <span className="text-[10px] font-bold text-[#D49D42] uppercase tracking-wider block">About S.S. Pharmacy</span>
          <h2 className="text-2xl font-serif text-[#1D3A28] font-bold leading-tight">Rooted in Tradition, Committed to Quality</h2>
          <p className="leading-relaxed">
            Established with a vision to make authentic Ayurvedic healing reliable and accessible, S.S. PHARMACY manufactures proprietary herbal healthcare remedies designed around everyday wellness needs.
          </p>
          <p className="leading-relaxed">
            Operating out of Yerraguntla, Andhra Pradesh under official license code <strong>R-1970/Ayur</strong>, our team enforces strict quality standards from botanical raw herb inspection to final packaging.
          </p>

          <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#1D3A28] shrink-0" />
            <div>
              <span className="font-bold text-[#1D3A28] block text-[10px]">Government Licensed Facility</span>
              <span className="text-[9px] text-slate-400">License No. R-1970/Ayur | YSR Kadapa Dist., A.P.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create ManufacturingTeaser**

Create `src/components/sections/ManufacturingTeaser.tsx`:
```typescript
'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Factory, Leaf } from 'lucide-react';

export default function ManufacturingTeaser() {
  return (
    <section className="bg-slate-50 border-t border-b py-16 font-sans">
      <div className="max-w-[1200px] mx-auto px-4 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold text-[#D49D42] uppercase tracking-wider">Manufacturing Excellence</span>
          <h2 className="text-2xl font-serif text-[#1D3A28] font-bold leading-tight">Licensed Facilities &amp; Quality Controls</h2>
          <p className="text-xs text-slate-450 max-w-md mx-auto">Our plant maintains clean, controlled production floors and stainless-steel processing systems to ensure every batch meets Schedule T standards.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6 text-xs text-slate-600"
          >
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded bg-[#1D3A28]/5 text-[#1D3A28] flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#1D3A28] text-sm mb-1">01. Authentic Sourcing</h3>
                <p className="text-slate-500">Herbs sourced from local growers and checked for active phytochemical potency and pesticide compliance.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded bg-[#1D3A28]/5 text-[#1D3A28] flex items-center justify-center shrink-0">
                <Factory className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#1D3A28] text-sm mb-1">02. Hygienic Facility</h3>
                <p className="text-slate-500">Licensed under R-1970/Ayur with controlled batch-processing and manufacturing environments.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded bg-[#1D3A28]/5 text-[#1D3A28] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#1D3A28] text-sm mb-1">03. Standardized Quality</h3>
                <p className="text-slate-500">Formulation batches undergo quality checks for identity, purity and safety compliance.</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative border rounded-2xl overflow-hidden shadow-md"
          >
            <img 
              src="/products/chemist_lab.webp" 
              alt="Quality Lab Inspections" 
              className="w-full h-auto object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-[#1D3A28]/90 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[10px] font-bold backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-[#D49D42]" />
              <span>GMP Compliant | Schedule T Audited</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create Mission**

Create `src/components/sections/Mission.tsx`:
```typescript
'use client';

import { motion } from 'framer-motion';
import { Leaf, ShieldCheck, Handshake } from 'lucide-react';

export default function Mission() {
  return (
    <section className="max-w-[1200px] mx-auto px-4 py-16 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          <span className="text-[10px] font-bold text-[#D49D42] uppercase tracking-wider block">Our Mission</span>
          <h2 className="text-2xl font-serif text-[#1D3A28] font-bold leading-tight">Bringing Authentic Ayurvedic Relief to Every Family</h2>
          <blockquote className="border-l-4 border-[#D49D42] pl-4 italic text-slate-600 text-sm leading-relaxed my-4">
            "To formulate and manufacture trusted, high-potency Ayurvedic remedies that support body comfort and skin health through traditional wisdom."
          </blockquote>
          <p className="text-xs text-slate-500 leading-relaxed">
            We bridge centuries of classical herbal knowledge with modern quality standards to provide reliable health solutions for wholesale distributors, clinics, and families.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-[#1D3A28] text-white p-6 rounded-2xl shadow-lg space-y-6"
        >
          <div>
            <h3 className="font-bold text-sm tracking-wide text-[#D49D42]">OUR COMMITMENT</h3>
            <p className="text-[10px] text-slate-350">Traditional formulation. Modern quality discipline.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex gap-4">
              <Leaf className="w-5 h-5 text-[#D49D42] shrink-0" />
              <div>
                <h4 className="font-bold">100% Herbal Authenticity</h4>
                <p className="text-slate-300 text-[10px] mt-0.5">Standardized botanical extracts prepared according to traditional guidelines.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <ShieldCheck className="w-5 h-5 text-[#D49D42] shrink-0" />
              <div>
                <h4 className="font-bold">Tested Safety &amp; Purity</h4>
                <p className="text-slate-300 text-[10px] mt-0.5">Formulated according to established safety and purity controls.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Handshake className="w-5 h-5 text-[#D49D42] shrink-0" />
              <div>
                <h4 className="font-bold">Reliable Channel Support</h4>
                <p className="text-slate-300 text-[10px] mt-0.5">Dedicated wholesale distributor partnerships and verified documentation support.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create ShowcaseBanner**

Create `src/components/sections/ShowcaseBanner.tsx`:
```typescript
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ShowcaseBanner() {
  return (
    <section className="max-w-[1200px] mx-auto px-4 py-8 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden bg-[#122419] flex items-center text-white"
      >
        <picture className="absolute inset-0 block w-full h-full z-0">
          <source media="(max-width: 767px)" srcSet="/products/Hero%20section/madebynature-mobile.webp" />
          <img 
            src="/products/Hero%20section/madebynature.webp" 
            alt="Ayurveda Herbal Showcase" 
            className="w-full h-full object-cover"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent z-10" />

        <div className="relative z-20 max-w-lg px-8 md:px-12 space-y-4">
          <h3 className="text-2xl md:text-4xl font-serif leading-tight">
            Made by Nature.<br />
            Backed by Ayurveda.
          </h3>
          <p className="text-xs text-slate-350 leading-relaxed font-light">
            Pure ingredients. Traditional wisdom. Licensed Ayurvedic healthcare remedies for your family.
          </p>
          <div className="pt-2">
            <Link 
              href="/products" 
              className="bg-[#D49D42] hover:bg-[#c28f3a] text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors uppercase tracking-wider inline-block"
            >
              Explore Products
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 6: Run build check to verify compilation**

Run: `npm run build`
Expected: Compiled successfully.

---

### Task 3: Main Page Assembly

**Files:**
- Modify: `src/app/(public)/page.tsx`

**Interfaces:**
- Consumes: modular components from Task 1 & 2.
- Produces: Premium responsive S.S. Pharmacy homepage assembling all sub-components.

- [ ] **Step 1: Overwrite page.tsx**

Overwrite `src/app/(public)/page.tsx` to mount the components:
```typescript
'use client';

import HeroCarousel from '@/components/sections/HeroCarousel';
import Highlights from '@/components/sections/Highlights';
import AboutTeaser from '@/components/sections/AboutTeaser';
import ManufacturingTeaser from '@/components/sections/ManufacturingTeaser';
import Mission from '@/components/sections/Mission';
import ShowcaseBanner from '@/components/sections/ShowcaseBanner';

export default function HomePage() {
  return (
    <div className="bg-[#FEFDF8] pb-16">
      <HeroCarousel />
      <Highlights />
      <AboutTeaser />
      <ManufacturingTeaser />
      <Mission />
      <ShowcaseBanner />
    </div>
  );
}
```

- [ ] **Step 2: Run Vitest to check all passes**

Run: `npx vitest run`
Expected: All 81 tests pass.

- [ ] **Step 3: Run build compilation check**

Run: `npm run build`
Expected: Compiled successfully with 0 errors.

---
