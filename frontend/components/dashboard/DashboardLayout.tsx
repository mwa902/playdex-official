'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from './Sidebar';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/events':        'Events',
  '/venues':        'Venues',
  '/bookings':      'Bookings',
  '/organizations': 'Organizations',
  '/users':         'Users & Admins',
  '/event-types':   'Event Types',
};

/* ── Layout ───────────────────────────────────────────────── */
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isSuperAdmin } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && user) {
      const superAdminRoutes = ['/users', '/event-types'];
      if (superAdminRoutes.some(r => pathname.startsWith(r)) && !isSuperAdmin) {
        router.replace('/dashboard');
      }
    }
  }, [loading, user, isSuperAdmin, pathname, router]);

  if (loading || !user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
      }}>
        <div style={{ textAlign: 'center', display: 'grid', gap: 14 }}>
          <span className="spinner spinner-primary" style={{ width: 36, height: 36, margin: '0 auto', borderWidth: 4 }} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Loading…</p>
        </div>
      </div>
    );
  }

  const title =
    Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] ?? 'Dashboard';

  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  return (
    <div className="dash-layout">
      <Sidebar />
      <div className="dash-main">

        {/* ── Top bar ── */}
        <header className="dash-topbar">
          {/* Left — page title */}
          <span className="dash-topbar-title">{title}</span>

          {/* Right — user info */}
          <div className="dash-topbar-actions">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ lineHeight: 1.3 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                  {user.role}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="dash-content">{children}</main>
      </div>
    </div>
  );
}
