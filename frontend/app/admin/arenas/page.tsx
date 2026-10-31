import type { Metadata } from 'next';
import { ArenaManagePage } from '@/components/admin/ArenaManagePage';

export const metadata: Metadata = {
  title: 'Arena Management — Playdex Admin',
  description: 'Manage arenas and add booking slots.',
};

export default function AdminArenasRoute() {
  return <ArenaManagePage />;
}
