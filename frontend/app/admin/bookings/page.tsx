import type { Metadata } from 'next';
import { AdminBookingsPage } from '@/components/admin/AdminBookingsPage';

export const metadata: Metadata = {
  title: 'Bookings — Playdex Admin',
};

export default function AdminBookingsRoute() {
  return <AdminBookingsPage />;
}