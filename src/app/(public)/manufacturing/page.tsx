import type { Metadata } from 'next';
import ManufacturingClient from './ManufacturingClient';

export const metadata: Metadata = {
  title: 'Manufacturing & Quality | S.S. PHARMACY',
  description: 'Licensed Ayurvedic manufacturing facility operating under License R-1970/Ayur in Andhra Pradesh. Cleanroom processing, chemical assays, and Schedule T quality standards.',
  keywords: [
    'Ayurvedic manufacturing',
    'GMP facility',
    'Schedule T compliance',
    'Cleanroom processing',
    'R-1970/Ayur'
  ],
  openGraph: {
    title: 'Manufacturing & Quality | S.S. PHARMACY',
    description: 'Licensed Ayurvedic manufacturing facility operating under License R-1970/Ayur in Andhra Pradesh.',
    url: 'https://sspharmacy.com/manufacturing',
    siteName: 'S.S. PHARMACY',
  },
};

export default function ManufacturingPage() {
  return <ManufacturingClient />;
}
