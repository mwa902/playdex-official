import type { Metadata } from 'next';
import { EventDetailPage } from '@/components/dashboard/EventDetailPage';

export const metadata: Metadata = { title: 'Event Detail' };

// Next.js 15: params is a Promise in server components
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EventDetailPage id={id} />;
}
