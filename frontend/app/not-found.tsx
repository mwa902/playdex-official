import type { Metadata } from 'next';
import NotFoundPage from '@/components/marketing/NotFoundPage';

export const metadata: Metadata = { title: '404 — Page not found' };

export default function NotFound() {
  return <NotFoundPage />;
}
