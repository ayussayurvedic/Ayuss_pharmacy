import type { Metadata } from 'next';
import ProductsClient from './ProductsClient';
import SchemaMarkup from '@/components/layout/SchemaMarkup';

export const metadata: Metadata = {
  title: 'Ayurvedic Products',
  description: 'Explore Dr. Lion Pain Cream, Dr. Lion Pain Pills, and Moon Light Cream manufactured under AYUSH License R-1970/Ayur in Andhra Pradesh.',
  alternates: {
    canonical: '/products',
  },
  keywords: [
    'Ayurvedic products',
    'Dr. Lion Pain Cream',
    'Dr. Lion Pain Pills',
    'Moon Light Cream',
    'Ayurvedic skincare',
    'Pain relief cream',
    'R-1970/Ayur'
  ],
  openGraph: {
    title: 'Ayurvedic Products',
    description: 'Explore Dr. Lion Pain Cream, Dr. Lion Pain Pills, and Moon Light Cream manufactured under AYUSH License R-1970/Ayur in Andhra Pradesh.',
    url: 'https://sspharmacy.com/products',
    siteName: 'S.S. PHARMACY',
    images: [{ url: '/products/logo/logo.webp', width: 1200, height: 630, alt: 'S.S. Pharmacy Ayurvedic Products' }],
  },
};

const productListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "S.S. Pharmacy Ayurvedic Products",
  "description": "Government-licensed Ayurvedic formulations manufactured under License R-1970/Ayur",
  "numberOfItems": 3,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Product",
        "name": "Dr. Lion Pain Cream",
        "description": "Ayurvedic External Pain Relief Cream with Sarsapa Thila, Thymol, Menthol, and Camphor. Supports joint comfort and helps soothe muscle discomfort.",
        "url": "https://sspharmacy.com/products/dr-lion-pain-cream",
        "image": "https://sspharmacy.com/products/Dr%20lion%20pain%20cream/Pain%20cream%20front%20view.webp",
        "brand": { "@type": "Brand", "name": "Dr. Lion" },
        "offers": {
          "@type": "Offer",
          "price": "199",
          "priceCurrency": "INR",
          "availability": "https://schema.org/InStock",
          "seller": { "@type": "Organization", "name": "S.S. Pharmacy" }
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 2,
      "item": {
        "@type": "Product",
        "name": "Dr. Lion Pain Pills",
        "description": "Ayurvedic Proprietary Medicine with Hingula, Triphala, and Amalaki. Supports joint comfort and musculoskeletal wellness.",
        "url": "https://sspharmacy.com/products/dr-lion-pain-pills",
        "image": "https://sspharmacy.com/products/Dr%20lion%20Pain%20pills/Pain_pills.webp",
        "brand": { "@type": "Brand", "name": "Dr. Lion" },
        "offers": {
          "@type": "Offer",
          "price": "249",
          "priceCurrency": "INR",
          "availability": "https://schema.org/InStock",
          "seller": { "@type": "Organization", "name": "S.S. Pharmacy" }
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 3,
      "item": {
        "@type": "Product",
        "name": "Moon Light Cream",
        "description": "Ayurvedic Skin Care Cream with Manjishta, Chandana, and Bahlika Flower. Supports healthy-looking skin and even-looking tone.",
        "url": "https://sspharmacy.com/products/moon-light-cream",
        "image": "https://sspharmacy.com/products/Moon-light/Moon%20cream%20front%20view.webp",
        "brand": { "@type": "Brand", "name": "Moon Light" },
        "offers": {
          "@type": "Offer",
          "price": "299",
          "priceCurrency": "INR",
          "availability": "https://schema.org/InStock",
          "seller": { "@type": "Organization", "name": "S.S. Pharmacy" }
        }
      }
    }
  ]
};

export default function ProductsPage() {
  return (
    <>
      <SchemaMarkup schema={productListSchema} />
      <ProductsClient />
    </>
  );
}
