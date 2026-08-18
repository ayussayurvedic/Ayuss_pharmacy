import { describe, it, expect } from 'vitest';
import { 
  generateBreadcrumbSchema, 
  generateProductSchema, 
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateFAQSchema,
  CANONICAL_DOMAIN 
} from '@/lib/seo';

describe('SEO Schema Utilities (seo.ts)', () => {
  it('should generate valid BreadcrumbList schema with 1-based indexing', () => {
    const breadcrumbs = [
      { name: 'Home', path: '/' },
      { name: 'Products', path: '/products' },
      { name: 'Dr. Lion Pain Relief Cream', path: '/products/dr-lion-pain-cream' },
    ];

    const schema = generateBreadcrumbSchema(breadcrumbs);

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('BreadcrumbList');
    expect(schema.itemListElement).toHaveLength(3);
    expect(schema.itemListElement[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `${CANONICAL_DOMAIN}/`,
    });
    expect(schema.itemListElement[2]).toEqual({
      '@type': 'ListItem',
      position: 3,
      name: 'Dr. Lion Pain Relief Cream',
      item: `${CANONICAL_DOMAIN}/products/dr-lion-pain-cream`,
    });
  });

  it('should generate valid Product & Offer Schema for Google Rich Snippets', () => {
    const product = {
      id: 'dr-lion-pain-cream',
      name: 'Dr. Lion Pain Relief Cream',
      category: 'Pain Relief',
      composition: 'Mahanarayana Taila, Gandhapura, Pudina Satva',
      image: '/products/dr-lion-pain-cream.webp',
      mrp: 299,
      sellingPrice: 249,
      packSize: '100g Jar',
    };

    const schema = generateProductSchema(product);

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Product');
    expect(schema.name).toBe('Dr. Lion Pain Relief Cream');
    expect(schema.sku).toBe('dr-lion-pain-cream');
    expect(schema.mpn).toBe('SSP-DR-LION-PAIN-CREAM');
    expect(schema.category).toBe('Pain Relief');
    expect(schema.brand).toEqual({
      '@type': 'Brand',
      name: 'S.S. Pharmacy',
    });
    expect(schema.aggregateRating).toBeDefined();
    expect(schema.aggregateRating.ratingValue).toBe('4.8');
    expect(schema.image).toBe(`${CANONICAL_DOMAIN}/products/dr-lion-pain-cream.webp`);
    expect(schema.description).toContain('Mahanarayana Taila');
    expect(schema.description).toContain('R-1970/Ayur');

    expect(schema.offers.price).toBe(249);
    expect(schema.offers.priceCurrency).toBe('INR');
    expect(schema.offers.itemCondition).toBe('https://schema.org/NewCondition');
    expect(schema.offers.availability).toBe('https://schema.org/InStock');
    expect(schema.offers.hasMerchantReturnPolicy).toBeDefined();
  });

  it('should handle missing optional fields and fallback to MRP and default logo', () => {
    const product = {
      id: 'herbal-oil',
      name: 'Herbal Massage Oil',
      mrp: 199,
    };

    const schema = generateProductSchema(product);

    expect(schema.name).toBe('Herbal Massage Oil');
    expect(schema.offers.price).toBe(199);
    expect(schema.offers.priceCurrency).toBe('INR');
    expect(schema.image).toBe(`${CANONICAL_DOMAIN}/products/logo/logo.webp`);
    expect(schema.category).toBe('Ayurvedic Medicine');
  });

  it('should generate valid Organization and MedicalBusiness schema', () => {
    const org = generateOrganizationSchema('+91 99669 64340');
    expect(org['@context']).toBe('https://schema.org');
    expect(org['@type']).toBe('MedicalBusiness');
    expect(org.license).toBe('R-1970/Ayur');
    expect(org.telephone).toBe('+91 99669 64340');
    expect(org.address.postalCode).toBe('516309');
  });

  it('should generate valid WebSite schema with Sitelinks searchbox', () => {
    const website = generateWebSiteSchema();
    expect(website['@type']).toBe('WebSite');
    expect(website.potentialAction['@type']).toBe('SearchAction');
  });

  it('should generate valid FAQPage schema', () => {
    const faqs = [
      { question: 'Is this Ayurvedic?', answer: 'Yes, 100% natural.' }
    ];
    const faqSchema = generateFAQSchema(faqs);
    expect(faqSchema['@type']).toBe('FAQPage');
    expect(faqSchema.mainEntity).toHaveLength(1);
    expect(faqSchema.mainEntity[0].name).toBe('Is this Ayurvedic?');
  });
});
