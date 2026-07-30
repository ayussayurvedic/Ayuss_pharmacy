import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about S.S. PHARMACY\'s legacy, government approved Ayurvedic manufacturing License R-1970/Ayur, and our core principles of authenticity and quality in Yerraguntla, Andhra Pradesh.',
  keywords: [
    'About S.S. Pharmacy',
    'Ayurvedic history',
    'R-1970/Ayur license',
    'Yerraguntla facility',
    'Ayurvedic heritage'
  ],
  openGraph: {
    title: 'About Us',
    description: 'Learn about S.S. PHARMACY\'s legacy, government approved Ayurvedic manufacturing License R-1970/Ayur in Yerraguntla, Andhra Pradesh.',
    url: 'https://sspharmacy.com/about',
    siteName: 'S.S. PHARMACY',
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
