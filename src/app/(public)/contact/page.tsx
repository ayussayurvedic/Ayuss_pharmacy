import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact Us | S.S. PHARMACY',
  description: 'Contact S.S. PHARMACY for general inquiries, retail purchases, wholesale supply, or manufacturing partnerships in Yerraguntla, Kadapa District, Andhra Pradesh.',
  keywords: [
    'Contact S.S. Pharmacy',
    'Ayurvedic inquiries',
    'Yerraguntla phone number',
    'Wholesale Ayurvedic inquiry'
  ],
  openGraph: {
    title: 'Contact Us | S.S. PHARMACY',
    description: 'Contact S.S. PHARMACY for general inquiries, retail purchases, or wholesale manufacturing requirements.',
    url: 'https://sspharmacy.com/contact',
    siteName: 'S.S. PHARMACY',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
