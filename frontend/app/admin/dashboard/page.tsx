import type { Metadata } from 'next';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard — Playdex',
};

export default function AdminDashboardRoute() {
  return <AdminDashboard />;
}
