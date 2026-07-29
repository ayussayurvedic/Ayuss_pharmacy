import ExpirationsClient from './ExpirationsClient';

export const metadata = {
  title: 'Batch Expirations & Shelf Life | S.S. Pharmacy Admin Portal',
  description: 'Monitor manufactured batch shelf life countdowns, near-expiry warnings, and batch isolation logs.'
};

export default function ExpirationsPage() {
  return <ExpirationsClient />;
}
