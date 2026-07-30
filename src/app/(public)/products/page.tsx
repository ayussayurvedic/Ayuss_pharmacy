import type { Metadata } from 'next';
import ProductsClient from './ProductsClient';

export const metadata: Metadata = {
  title: 'Ayurvedic Products',
  description: 'Explore Dr. Lion Pain Cream, Dr. Lion Pain Pills, and Moon Light Cream manufactured under AYUSH License R-1970/Ayur in Andhra Pradesh.',
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
  },
};

export default function ProductsPage() {
  return <ProductsClient />;
}
