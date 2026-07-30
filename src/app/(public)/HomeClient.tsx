'use client';

import HeroCarousel from '@/components/sections/HeroCarousel';
import Highlights from '@/components/sections/Highlights';
import ProductsPortfolio from '@/components/sections/ProductsPortfolio';
import AboutTeaser from '@/components/sections/AboutTeaser';
import ManufacturingTeaser from '@/components/sections/ManufacturingTeaser';
import Mission from '@/components/sections/Mission';
import ShowcaseBanner from '@/components/sections/ShowcaseBanner';

export default function HomeClient() {
  return (
    <div suppressHydrationWarning className="bg-[#FDF8F0] pb-16 min-h-[100dvh]">
      <HeroCarousel />
      <Highlights />
      <ProductsPortfolio />
      <AboutTeaser />
      <ManufacturingTeaser />
      <Mission />
      <ShowcaseBanner />
    </div>
  );
}
