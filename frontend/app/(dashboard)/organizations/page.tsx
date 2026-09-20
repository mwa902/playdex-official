import type { Metadata } from 'next';
import { OrganizationsPage } from '@/components/dashboard/OrganizationsPage';

export const metadata: Metadata = { title: 'Organizations' };

export default function Page() {
  return <OrganizationsPage />;
}
