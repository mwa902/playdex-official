import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ArenasPage } from '@/components/marketing/ArenasPage';

export const metadata: Metadata = {
  title: 'Find an Arena, Gym or Pool — Lahore',
  description:
    'Browse 135 sports arenas, gyms, and swimming pools in Lahore. Pick a venue, choose an available slot, and book — cash payment on arrival.',
};

export default function ArenasRoute() {
  return (
    <Suspense fallback={<div className="page-loading">Loading venues…</div>}>
      <ArenasPage />
    </Suspense>
  );
}
