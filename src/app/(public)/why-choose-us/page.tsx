import type { Metadata } from 'next';
import WhyChooseUsClient from './WhyChooseUsClient';
import SchemaMarkup from '@/components/layout/SchemaMarkup';

export const metadata: Metadata = {
  title: 'Why Choose Us',
  description: 'Why choose Ayu S.S. Pharmacy - authentic Ayurvedic sourcing, heavy metal safety limits compliance, Schedule T compliance, and complete batch traceability.',
  alternates: {
    canonical: '/why-choose-us',
  },
  keywords: [
    'Why Choose Ayu S.S. Pharmacy',
    'Ayurvedic quality',
    'Heavy metal safety',
    'Schedule T compliance',
    'Authentic herbal sourcing'
  ],
  openGraph: {
    title: 'Why Choose Us',
    description: 'Why choose AYU S.S. PHARMACY - authentic Ayurvedic sourcing, zero heavy metals, and Schedule T compliance.',
    url: 'https://sspharmacy.com/why-choose-us',
    siteName: 'AYU S.S. PHARMACY',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is Ayu S.S. Pharmacy a government licensed manufacturer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Ayu S.S. Pharmacy operates under Manufacturing License No. R-1970/Ayur, issued by the Licensing Authority of Andhra Pradesh under the AYUSH Department. Our facility is subject to regular government inspections."
      }
    },
    {
      "@type": "Question",
      "name": "Are Ayu S.S. Pharmacy products tested for heavy metal safety?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Every batch is verified to meet strict pharmacopoeial safety limits for heavy metals including lead, mercury, arsenic, and cadmium — ensuring zero toxic heavy metal contamination above permissible levels."
      }
    },
    {
      "@type": "Question",
      "name": "What is Schedule T compliance?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Schedule T is a set of Good Manufacturing Practice (GMP) standards specifically mandated for Ayurvedic, Siddha, and Unani medicines in India. Our facility adheres to these standards for cleanliness, equipment calibration, raw material testing, and batch documentation."
      }
    },
    {
      "@type": "Question",
      "name": "Where is Ayu S.S. Pharmacy located?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our manufacturing facility is located at D. No. 1-2-211 & 1-2-212, Prakash Nagar, Yerraguntla Panchayati, YSR Kadapa District, Andhra Pradesh - 516309, India."
      }
    },
    {
      "@type": "Question",
      "name": "Can I become a wholesale distributor for Ayu S.S. Pharmacy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! We partner with medical shops, clinics, hospitals, and regional wholesale buyers. Contact us through our Contact page or WhatsApp support to apply for regional distribution rights."
      }
    }
  ]
};

import { generateBreadcrumbSchema } from '@/lib/seo';

export default function WhyChooseUsPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Why Choose Us', path: '/why-choose-us' },
  ]);

  return (
    <>
      <SchemaMarkup schema={faqSchema} />
      <SchemaMarkup schema={breadcrumbSchema} />
      <WhyChooseUsClient />
    </>
  );
}
