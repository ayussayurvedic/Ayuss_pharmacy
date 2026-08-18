'use client';

import dynamic from 'next/dynamic';
import HeroCarousel from '@/components/sections/HeroCarousel';
import Highlights from '@/components/sections/Highlights';
import ProductsPortfolio from '@/components/sections/ProductsPortfolio';

const AboutTeaser = dynamic(() => import('@/components/sections/AboutTeaser'));
const ManufacturingTeaser = dynamic(() => import('@/components/sections/ManufacturingTeaser'));
const Mission = dynamic(() => import('@/components/sections/Mission'));
const ShowcaseBanner = dynamic(() => import('@/components/sections/ShowcaseBanner'));

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
