import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Contact S.S. PHARMACY for general inquiries, retail purchases, wholesale supply, or manufacturing partnerships in Yerraguntla, Kadapa District, Andhra Pradesh.',
  alternates: {
    canonical: '/contact',
  },
  keywords: [
    'Contact S.S. Pharmacy',
    'Ayurvedic inquiries',
    'Yerraguntla phone number',
    'Wholesale Ayurvedic inquiry'
  ],
  openGraph: {
    title: 'Contact Us',
    description: 'Contact S.S. PHARMACY for general inquiries, retail purchases, or wholesale manufacturing requirements.',
    url: 'https://sspharmacy.com/contact',
    siteName: 'S.S. PHARMACY',
  },
};

import SchemaMarkup from '@/components/layout/SchemaMarkup';
import { generateBreadcrumbSchema } from '@/lib/seo';

export default function ContactPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Contact Us', path: '/contact' },
  ]);

  return (
    <>
      <SchemaMarkup schema={breadcrumbSchema} />
      <ContactClient />
    </>
  );
}
