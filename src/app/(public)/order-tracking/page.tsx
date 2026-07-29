import type { Metadata } from 'next';
import OrderTrackingClient from './OrderTrackingClient';

export const metadata: Metadata = {
  title: 'Track Your Order | S.S. PHARMACY',
  description: 'Track the status and transit updates of your S.S. Pharmacy order.',
  keywords: ['Track order', 'SS Pharmacy', 'Ayurvedic products order tracking', 'Dr. Lion', 'Moon Light'],
  openGraph: {
    title: 'Track Your Order | S.S. PHARMACY',
    description: 'Track the status and transit updates of your S.S. Pharmacy order.',
    images: [{ url: '/products/logo/logo.webp', width: 600, height: 600, alt: 'S.S. Pharmacy Logo' }],
  }
};

export default function OrderTrackingPage() {
  return <OrderTrackingClient />;
}
