import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Checkout | S.S. Pharmacy Ayurvedic Formulations',
  description: 'Complete your Ayurvedic order securely. Cash on Delivery (COD) and fast shipping across India.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
