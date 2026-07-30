import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: {
    absolute: 'S.S. Pharmacy | Ayurvedic Products & Licensed Manufacturing',
  },
  description: 'Quality-focused Ayurvedic products, licensed manufacturing, product and distributor enquiries. Operating under Mfg. Lic. R-1970/Ayur in Andhra Pradesh.',
  keywords: [
    'S.S. PHARMACY',
    'Ayurvedic products',
    'Ayurvedic medicine manufacturer',
    'Ayurvedic product distributor',
    'Dr. Lion Pain Cream',
    'Dr. Lion Pain Pills',
    'Moon Light Cream',
    'R-1970/Ayur'
  ],
  openGraph: {
    title: 'S.S. PHARMACY | Ayurvedic Products & Licensed Manufacturing',
    description: 'Quality-focused Ayurvedic products, licensed manufacturing, product and distributor enquiries.',
    url: 'https://sspharmacy.com',
    siteName: 'S.S. PHARMACY',
    images: [{ url: '/products/logo/logo.webp', width: 1200, height: 630, alt: 'S.S. Pharmacy' }],
  },
};

export default function HomePage() {
  return <HomeClient />;
}
