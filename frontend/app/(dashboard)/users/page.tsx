import type { Metadata } from 'next';
import { UsersPage } from '@/components/dashboard/UsersPage';

export const metadata: Metadata = { title: 'Users & Admins' };

export default function Page() {
  return <UsersPage />;
}
