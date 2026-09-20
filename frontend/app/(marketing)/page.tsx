import type { Metadata } from 'next';
import { LandingPage } from '@/components/marketing/LandingPage';

export const metadata: Metadata = { title: 'Playdex — Sports Event Operations Platform' };

export default function HomePage() {
  return <LandingPage />;
}
