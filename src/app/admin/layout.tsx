import type { Metadata } from 'next';
import AdminLayoutClient from './AdminLayoutClient';

export const metadata: Metadata = {
  title: 'Admin Portal | S.S. Pharmacy',
  manifest: '/manifest-admin.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SS Pharmacy Admin',
  },
};

const getPendingCountOnly = async () => 0;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pendingCountPromise = getPendingCountOnly().catch(() => 0);
  return <AdminLayoutClient pendingCountPromise={pendingCountPromise}>{children}</AdminLayoutClient>;
}
