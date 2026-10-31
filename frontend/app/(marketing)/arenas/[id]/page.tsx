import type { Metadata } from 'next';
import { ArenaDetailPage } from '@/components/marketing/ArenaDetailPage';

export const metadata: Metadata = {
  title: 'Venue Details — Playdex',
  description: 'View available slots and book at this Lahore sports venue.',
};

export default async function ArenaDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ArenaDetailPage id={id} />;
}
