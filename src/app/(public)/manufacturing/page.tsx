import type { Metadata } from 'next';
import ManufacturingClient from './ManufacturingClient';

export const metadata: Metadata = {
  title: 'Manufacturing & Quality',
  description: 'Licensed Ayurvedic manufacturing facility operating under License R-1970/Ayur in Andhra Pradesh. Cleanroom processing, chemical assays, and Schedule T quality standards.',
  alternates: {
    canonical: '/manufacturing',
  },
  keywords: [
    'Ayurvedic manufacturing',
    'GMP facility',
    'Schedule T compliance',
    'Cleanroom processing',
    'R-1970/Ayur'
  ],
  openGraph: {
    title: 'Manufacturing & Quality',
    description: 'Licensed Ayurvedic manufacturing facility operating under License R-1970/Ayur in Andhra Pradesh.',
    url: 'https://sspharmacy.com/manufacturing',
    siteName: 'S.S. PHARMACY',
  },
};

import SchemaMarkup from '@/components/layout/SchemaMarkup';
import { generateBreadcrumbSchema } from '@/lib/seo';

export default function ManufacturingPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Manufacturing & Quality', path: '/manufacturing' },
  ]);

  return (
    <>
      <SchemaMarkup schema={breadcrumbSchema} />
      <ManufacturingClient />
    </>
  );
}
