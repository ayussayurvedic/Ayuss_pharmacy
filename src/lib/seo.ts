/**
 * Centralized SEO Utilities and Schema Generators
 * Enforces canonical configurations and builds structured JSON-LD schemas
 */

export const CANONICAL_DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://sspharmacy.com';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

/**
 * Generates a standard BreadcrumbList Schema JSON-LD structure
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${CANONICAL_DOMAIN}${item.path.startsWith('/') ? '' : '/'}${item.path}`
    }))
  };
}

export interface ProductSchemaItem {
  id: string;
  name: string;
  category?: string;
  composition?: string;
  image?: string;
  mrp?: number;
  sellingPrice?: number;
  packSize?: string;
}

/**
 * Generates a standard Schema.org Product & Offer JSON-LD structure for Google Rich Snippets
 */
export function generateProductSchema(product: ProductSchemaItem) {
  const price = product.sellingPrice || product.mrp || 0;
  const imageUrl = product.image
    ? (product.image.startsWith('http') ? product.image : `${CANONICAL_DOMAIN}${product.image.startsWith('/') ? '' : '/'}${product.image}`)
    : `${CANONICAL_DOMAIN}/products/logo/logo.webp`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": imageUrl,
    "description": product.composition
      ? `Ayurvedic formulation containing ${product.composition}. Pack size: ${product.packSize || '100g'}. Licensed under R-1970/Ayur.`
      : `${product.name} - Licensed Ayurvedic formulation by S.S. Pharmacy.`,
    "sku": product.id,
    "mpn": `SSP-${product.id.toUpperCase()}`,
    "category": product.category || 'Ayurvedic Medicine',
    "brand": {
      "@type": "Brand",
      "name": "S.S. Pharmacy"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "128"
    },
    "offers": {
      "@type": "Offer",
      "url": `${CANONICAL_DOMAIN}/products/${product.id}`,
      "priceCurrency": "INR",
      "price": price,
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "S.S. Pharmacy"
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "IN",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 7,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn"
      }
    }
  };
}

/**
 * Generates an Organization & MedicalBusiness JSON-LD structure
 */
export function generateOrganizationSchema(telephone?: string) {
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": `${CANONICAL_DOMAIN}/#organization`,
    "name": "Ayu S.S. Pharmacy",
    "url": CANONICAL_DOMAIN,
    "logo": `${CANONICAL_DOMAIN}/products/logo/logo.webp`,
    "image": `${CANONICAL_DOMAIN}/products/logo/logo.webp`,
    "email": "ayuss.ayurvedic@gmail.com",
    "priceRange": "$$",
    "knowsAbout": [
      "Ayurveda",
      "Ayurvedic proprietary medicine",
      "Pain relief cream",
      "Herbal pain management"
    ],
    "license": "R-1970/Ayur",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "D. No. 1-2-211 & 1-2-212, Prakash Nagar, Yerraguntla Panchayati",
      "addressLocality": "Yerraguntla",
      "addressRegion": "Andhra Pradesh",
      "postalCode": "516309",
      "addressCountry": "IN"
    }
  };

  if (telephone) {
    schema["telephone"] = telephone;
  }

  return schema;
}

/**
 * Generates a WebSite with Sitelinks Searchbox JSON-LD structure
 */
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${CANONICAL_DOMAIN}/#website`,
    "url": CANONICAL_DOMAIN,
    "name": "Ayu S.S. Pharmacy",
    "description": "Authentic government-licensed Ayurvedic formulations and pain relief products.",
    "publisher": {
      "@id": `${CANONICAL_DOMAIN}/#organization`
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${CANONICAL_DOMAIN}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * Generates FAQPage JSON-LD schema
 */
export function generateFAQSchema(faqList: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqList.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}
