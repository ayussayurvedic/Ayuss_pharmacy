import type { Metadata } from 'next';
import { Store, HeartPulse, Building2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import CTASection from '@/components/sections/CTASection';
import SchemaMarkup from '@/components/layout/SchemaMarkup';
import { generateBreadcrumbSchema, CANONICAL_DOMAIN } from '@/lib/seo';

const path = '/industries';

export const metadata: Metadata = {
  title: 'Industries We Serve | Pharmacies, Clinics, Private Label | S.S. Pharmacy',
  description:
    'S.S. Pharmacy supplies premium Ayurvedic formulations to retail pharmacies, medical stores, wellness clinics, and private labels under government manufacturing licenses.',
  alternates: {
    canonical: `${CANONICAL_DOMAIN}${path}`,
  },
};

const industries = [
  {
    icon: <Store className="w-6 h-6" />,
    title: 'Retail Pharmacies & Stores',
    desc: 'Supply chains, pharmacy networks, and local medicine stores looking to stock fast-moving, high-quality Ayurvedic pain relief creams and ointments.',
    areas: ['OTC Products', 'Retail Distribution', 'Medical Stores', 'Local Chemist Outlets']
  },
  {
    icon: <HeartPulse className="w-6 h-6" />,
    title: 'Ayurvedic Clinics & Doctors',
    desc: 'Practitioners and clinics seeking premium, standard-compliant Ayurvedic medicine (capsules, pain pills, classical oils) for direct patient treatments.',
    areas: ['Clinical Supply', 'Ayurvedic Doctors', 'Treatment Centers', 'Wellness Resorts']
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    title: 'Wellness Brands & Private Labels',
    desc: 'B2B partnerships for contract-manufacturing custom formulations. We develop, label, and package proprietary brands under GMP compliance.',
    areas: ['Private Labeling', 'Contract Manufacturing', 'Brand Packaging', 'Custom Extract Supply']
  }
];

export default function IndustriesPage() {
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Industries', path: '/industries' },
  ];

  const industriesListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Sectors Served by S.S. Pharmacy',
    numberOfItems: industries.length,
    itemListElement: industries.map((industry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: industry.title,
      description: industry.desc,
    })),
  };

  return (
    <>
      <SchemaMarkup schema={industriesListSchema} />
      <SchemaMarkup schema={generateBreadcrumbSchema(breadcrumbs)} />

      {/* Hero (Dark Navy) */}
      <section className="pt-32 pb-20 bg-surface-dark text-white relative">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <span className="inline-block text-[#C9943E] font-semibold text-xs uppercase tracking-wider mb-3">
            Industries
          </span>
          <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-[-1.5px] leading-tight mb-5 max-w-3xl mx-auto">
            Sectors We Serve
          </h1>
          <p className="text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            We provide Ayurvedic distribution, wholesale manufacturing, and contract branding support.
          </p>
        </div>
      </section>

      {/* Industries (White Canvas) */}
      <section className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {industries.map((ind) => (
              <div key={ind.title} className="bg-surface-card rounded-xl border border-hairline p-8 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-teal-primary/5 text-teal-primary flex items-center justify-center mb-6">
                    {ind.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-ink mb-3">{ind.title}</h3>
                  <p className="text-sm text-body-text leading-relaxed mb-6">{ind.desc}</p>
                </div>
 
                <div className="border-t border-hairline pt-4 mt-auto">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Key Areas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ind.areas.map((area) => (
                      <span
                        key={area}
                        className="px-2.5 py-1 text-xs font-medium rounded-full bg-white text-body-text border border-hairline"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Expanding note card */}
          <div className="bg-white border-l-4 border-l-teal-primary border border-hairline rounded-r-xl p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-4xl mx-auto">
            <div>
              <h4 className="text-base font-semibold text-ink mb-1">Looking for wholesale collaboration?</h4>
              <p className="text-sm text-body-text leading-relaxed">
                If you are a licensed distributor or wellness brand representative, reach out to us directly.
              </p>
            </div>
            <Link href="/contact" className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-primary hover:text-teal-active shrink-0">
              Apply as Distributor <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
