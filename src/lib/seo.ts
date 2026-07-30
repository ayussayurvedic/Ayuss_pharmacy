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

