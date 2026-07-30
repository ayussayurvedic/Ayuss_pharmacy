import type { Metadata } from 'next';
import { Leaf, Package, FlaskConical, Award } from 'lucide-react';
import CTASection from '@/components/sections/CTASection';
import SchemaMarkup from '@/components/layout/SchemaMarkup';
import { generateBreadcrumbSchema, CANONICAL_DOMAIN } from '@/lib/seo';

const path = '/services';

export const metadata: Metadata = {
  title: 'Ayurvedic Manufacturing & Wholesale Supply | S.S. Pharmacy',
  description:
    'GMP-certified Ayurvedic proprietary medicine manufacturing, contract packaging, wholesale distribution, and custom formulation development under AYUSH License R-1970/Ayur.',
  alternates: {
    canonical: `${CANONICAL_DOMAIN}${path}`,
  },
};

const manufacturingServices = [
  {
    icon: <Leaf className="w-6 h-6" />,
    title: 'Ayurvedic Wholesale Supply',
    desc: 'Bulk supply of government-approved formulations, including pain relief creams, capsules, and herbal skincare solutions, with complete batch laboratory test certificates.'
  },
  {
    icon: <Package className="w-6 h-6" />,
    title: 'Third-Party Contract Manufacturing',
    desc: 'Scale your brand with our state-of-the-art manufacturing facility. We handle large-scale production, packaging, and custom labeling under GMP standards.'
  },
  {
    icon: <FlaskConical className="w-6 h-6" />,
    title: 'Custom Formulation Development',
    desc: 'Collaborate with our formulation experts to develop custom herbal extracts, medicated oils, or proprietary recipes adapted to your business goals.'
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: 'AYUSH Compliance & Licensing Support',
    desc: 'End-to-end guidance on obtaining AYUSH manufacturing approvals, formulation approvals, license renewals, and batch laboratory purity analysis reporting.'
  }
];

const productDomains = [
  'Analgesic Creams & Oils',
  'Herbal Skincare & Ointments',
  'Ayurvedic Proprietary Medicine',
  'Classical Ayurvedic Formulations',
  'Immunity & Wellness Capsules',
  'Custom Liquid Extracts'
];

const tableCategories = [
  { domain: 'Pain Relief', roles: 'Dr. Lion Pain Cream, Dr. Lion Pain Pills' },
  { domain: 'Skincare', roles: 'Moon Light Cream, Ayurvedic Skin Ointments' },
  { domain: 'Classical Herbs', roles: 'Ashwagandha, Triphala, Dashmoola Extracts' },
  { domain: 'Custom Proprietary', roles: 'Private-label capsule lines, custom essential oils' }
];

const steps = [
  {
    num: '01',
    title: 'Consultation & Recipe Finalization',
    desc: 'Share your target formulation, ingredients, and pack size requirements with our manufacturing team.'
  },
  {
    num: '02',
    title: 'Compliance & Quality Testing',
    desc: 'We verify formulation compliance under AYUSH guidelines and perform heavy metal and purity analysis.'
  },
  {
    num: '03',
    title: 'Bulk Production & Shipping',
    desc: 'We execute batch manufacturing under Schedule T guidelines, package with your branding, and deliver.'
  }
];

export default function ServicesPage() {
  const servicesSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: 'Ayurvedic Manufacturing & Wholesale Supply',
        provider: {
          '@type': 'MedicalBusiness',
          name: 'S.S. Pharmacy',
          url: 'https://sspharmacy.com',
        },
        description:
          'GMP-certified Ayurvedic proprietary medicine manufacturing, contract packaging, wholesale distribution, and custom formulation development in Andhra Pradesh.',
        areaServed: 'IN',
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Manufacturing & Distribution Services',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Ayurvedic Wholesale Supply',
                description: 'Bulk supply of premium government-approved Ayurvedic formulations.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Third-Party Contract Manufacturing',
                description: 'Large-scale GMP-compliant contract production and custom packaging.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Custom Formulation R&D',
                description: 'Custom recipe scaling, extraction, and proprietary formulation development.',
              },
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'AYUSH Regulatory Support',
                description: 'Full-service compliance, laboratory certification, and licensing coordination.',
              },
            },
          ],
        },
      },
    ],
  };

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
  ];

  return (
    <>
      <SchemaMarkup schema={servicesSchema} />
      <SchemaMarkup schema={generateBreadcrumbSchema(breadcrumbs)} />

      {/* Hero (Dark Green Theme) */}
      <section className="pt-32 pb-20 bg-surface-dark text-white relative">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <span className="inline-block text-[#C9943E] font-semibold text-xs uppercase tracking-wider mb-3">
            Services
          </span>
          <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-[-1.5px] leading-tight mb-5 max-w-3xl mx-auto">
            Manufacturing & Wholesale Services
          </h1>
          <p className="text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            State-of-the-art Ayurvedic proprietary medicine contract manufacturing and wholesale supply.
          </p>
        </div>
      </section>

      {/* Services Models (White Canvas) */}
      <section className="py-24 bg-white" id="services">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-sm font-semibold tracking-wider text-teal-primary uppercase block mb-3">
              WHAT WE OFFER
            </span>
            <h2 className="text-3xl md:text-5xl font-semibold text-ink tracking-[-1.5px] leading-[1.1]">
              Our Offerings
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {manufacturingServices.map((model) => (
              <div key={model.title} className="bg-surface-card rounded-[12px] p-8 border border-hairline flex flex-col justify-between h-full group hover:border-teal-primary/30 transition-colors">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-teal-primary/5 text-teal-primary flex items-center justify-center mb-6">
                    {model.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-ink mb-3">{model.title}</h3>
                  <p className="text-sm text-body-text leading-relaxed">{model.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories (Surface Card) */}
      <section className="py-24 bg-surface-card border-y border-hairline" id="categories">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-sm font-semibold tracking-wider text-teal-primary uppercase block mb-3">
              CATEGORIES
            </span>
            <h2 className="text-3xl md:text-5xl font-semibold text-ink tracking-[-1.5px] leading-[1.1] mb-4">
              Formulation Categories
            </h2>
          </div>

          {/* Tags Cloud */}
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto mb-16">
            {productDomains.map((domain) => (
              <span
                key={domain}
                className="px-5 py-2.5 rounded-full bg-teal-primary text-white text-sm font-semibold shadow-sm"
              >
                {domain}
              </span>
            ))}
          </div>

          {/* Structured Category Table */}
          <div className="max-w-3xl mx-auto bg-white border border-hairline rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-card border-b border-hairline">
                  <th className="px-6 py-4 text-sm font-semibold text-ink">Category</th>
                  <th className="px-6 py-4 text-sm font-semibold text-ink">Typical Formulations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {tableCategories.map((row) => (
                  <tr key={row.domain} className="hover:bg-surface-card/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-ink">{row.domain}</td>
                    <td className="px-6 py-4 text-sm text-body-text">{row.roles}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How We Work (White Canvas) */}
      <section className="py-24 bg-white" id="process">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-sm font-semibold tracking-wider text-teal-primary uppercase block mb-3">
              WORKFLOW
            </span>
            <h2 className="text-3xl md:text-5xl font-semibold text-ink tracking-[-1.5px] leading-[1.1]">
              How We Work
            </h2>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="hidden md:block absolute top-[52px] left-[10%] right-[10%] h-[2px] bg-hairline z-0" />
            {steps.map((step) => (
              <div key={step.num} className="relative z-10 flex flex-col h-full bg-surface-card rounded-xl border border-hairline p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="text-4xl font-semibold text-teal-primary tracking-tight z-10 bg-surface-card pr-2">
                    {step.num}
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-primary shrink-0 z-10" />
                </div>
                <h3 className="text-lg font-semibold text-ink mb-2">{step.title}</h3>
                <p className="text-sm text-body-text leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
