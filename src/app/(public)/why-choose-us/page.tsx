import type { Metadata } from 'next';
import WhyChooseUsClient from './WhyChooseUsClient';

export const metadata: Metadata = {
  title: 'Why Choose Us | S.S. PHARMACY',
  description: 'Why choose S.S. PHARMACY - authentic Ayurvedic sourcing, zero heavy metals, Schedule T compliance, and complete batch traceability.',
  keywords: [
    'Why Choose S.S. Pharmacy',
    'Ayurvedic quality',
    'Zero heavy metals',
    'Schedule T compliance',
    'Authentic herbal sourcing'
  ],
  openGraph: {
    title: 'Why Choose Us | S.S. PHARMACY',
    description: 'Why choose S.S. PHARMACY - authentic Ayurvedic sourcing, zero heavy metals, and Schedule T compliance.',
    url: 'https://sspharmacy.com/why-choose-us',
    siteName: 'S.S. PHARMACY',
  },
};

export default function WhyChooseUsPage() {
  return <WhyChooseUsClient />;
}
