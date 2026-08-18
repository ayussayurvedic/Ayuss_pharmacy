import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Confirmed',
  description: 'Thank you for your order with Ayu S.S. Pharmacy. Your authentic Ayurvedic medicines are being prepared for dispatch.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function OrderSuccessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
