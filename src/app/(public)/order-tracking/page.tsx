import type { Metadata } from 'next';
import OrderTrackingClient from './OrderTrackingClient';

export const metadata: Metadata = {
  title: 'Track Your Order',
  description: 'Track the real-time shipping status and transit updates of your Ayu S.S. Pharmacy order.',
  alternates: {
    canonical: '/order-tracking',
  },
  keywords: ['Track order', 'SS Pharmacy', 'Ayurvedic products order tracking', 'Dr. Lion', 'Moon Light'],
  openGraph: {
    title: 'Track Your Order',
    description: 'Track the status and transit updates of your Ayu S.S. Pharmacy order.',
    url: 'https://sspharmacy.com/order-tracking',
    siteName: 'Ayu S.S. Pharmacy',
    images: [{ url: '/products/logo/logo.webp', width: 600, height: 600, alt: 'Ayu S.S. Pharmacy Logo' }],
  }
};

export default function OrderTrackingPage() {
  return <OrderTrackingClient />;
}
