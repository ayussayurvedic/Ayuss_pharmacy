import RecallsClient from './RecallsClient';

export const metadata = {
  title: 'Quality Recalls & Audit Logs | S.S. Pharmacy Admin Portal',
  description: 'Manage batch quality holds, state AYUSH inspector audits, and resolution logs.'
};

export default function RecallsPage() {
  return <RecallsClient />;
}
