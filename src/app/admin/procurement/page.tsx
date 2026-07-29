import ProcurementClient from './ProcurementClient';

export const metadata = {
  title: 'Procurement & Purchase Orders | S.S. Pharmacy Admin Portal',
  description: 'Raise purchase orders for raw botanical materials, track deliveries, and log batch release statuses.'
};

export default function ProcurementPage() {
  return <ProcurementClient />;
}
