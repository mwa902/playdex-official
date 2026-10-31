import type { Metadata } from 'next';
import { AdminSettingsPage } from '@/components/admin/AdminSettingsPage';

export const metadata: Metadata = {
  title: 'Settings — Playdex Admin',
};

export default function AdminSettingsRoute() {
  return <AdminSettingsPage />;
}
