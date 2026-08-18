import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order History & Lookup',
  description: 'View your previous Ayurvedic medicine orders and tracking status with Ayu S.S. Pharmacy.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function OrderHistoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
