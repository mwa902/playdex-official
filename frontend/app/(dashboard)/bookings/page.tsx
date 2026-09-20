import type { Metadata } from 'next';
import { BookingsPage } from '@/components/dashboard/BookingsPage';

export const metadata: Metadata = { title: 'Bookings' };

export default function Page() {
  return <BookingsPage />;
}
