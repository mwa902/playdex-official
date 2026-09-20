import type { Metadata } from 'next';
import { EventTypesPage } from '@/components/dashboard/EventTypesPage';

export const metadata: Metadata = { title: 'Event Types' };

export default function Page() {
  return <EventTypesPage />;
}
