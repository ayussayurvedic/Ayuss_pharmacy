# Design Specification: S.S. Pharmacy Homepage Redesign

We are redesigning the public storefront homepage of S.S. Pharmacy using Next.js, Tailwind CSS, Framer Motion, and Lucide icons.

## 1. Structure & Modular Layout
The homepage is decomposed into 6 independent sub-components:

1.  **HeroCarousel** (`src/components/sections/HeroCarousel.tsx`):
    - Smooth opacity cross-fades using Framer Motion.
    - Staggered text entrances for eyebrows, titles, and descriptions.
    - Swipe gesture handlers on touchscreens.
2.  **Highlights** (`src/components/sections/Highlights.tsx`):
    - 3-card grid (Organic Herbs, License R-1970/Ayur, GMP).
3.  **AboutTeaser** (`src/components/sections/AboutTeaser.tsx`):
    - 2-column description with the `/products/Moon-light/Moon cream Hero_section.webp` image.
4.  **ManufacturingTeaser** (`src/components/sections/ManufacturingTeaser.tsx`):
    - Uses `/products/chemist_lab.webp` alongside 3 quality points.
5.  **Mission** (`src/components/sections/Mission.tsx`):
    - Quote card and commitment lists (100% Herbal, Safety & Purity, Channel Support).
6.  **ShowcaseBanner** (`src/components/sections/ShowcaseBanner.tsx`):
    - Large full-width picture banner (`/products/Hero section/madebynature.webp`) and CTA.

---

## 2. Dynamic Slide Data Map
*   `moon-cream` -> `Moon Light Cream` (`/products/Hero section/hero-moon-desktop.webp` / `hero-moon-mobile.webp`)
*   `pain-cream` -> `Dr. Lion Pain Cream` (`/products/Hero section/hero-pain-cream-desktop.webp` / `hero-pain-cream-mobile.webp`)
*   `brand-main` -> `Ayurvedic Solutions` (`/products/Hero section/hero-main-desktop.webp` / `hero-main-mobile.webp`)
*   `pain-pills` -> `Dr. Lion Pain Pills` (`/products/Hero section/hero-pain-pills-desktop.webp` / `hero-pain-pills-mobile.webp`)

---

## 3. Compliance & Verification
*   Pre-render validation: Pre-renders successfully.
*   TypeScript checks: 100% compiled.
*   Unit tests: Run Vitest to check passes.
