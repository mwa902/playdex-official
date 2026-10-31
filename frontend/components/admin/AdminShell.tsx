'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useData } from '@/hooks/useData';
import { api, type User } from '@/lib/api-client';

const SESSION_KEY = 'playdex_user';

interface AdminShellProps {
  children: React.ReactNode;
}

// ─── Icon helper ─────────────────────────────────────────────────────────────
const I = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

// ─── Shell ───────────────────────────────────────────────────────────────────
export function AdminShell({ children }: AdminShellProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser]           = useState<User | null>(null);
  const [authChecked, setChecked] = useState(false);
  const [venueOpen, setVenueOpen] = useState(true);

  // Auth restore + back-button guard
  useEffect(() => {
    const check = () => {
      try {
        const stored = localStorage.getItem(SESSION_KEY);
        if (stored) {
          const u = JSON.parse(stored) as User;
          if (u.role === 'superadmin' || u.role === 'admin' || u.role === 'Admin') {
            setUser(u); setChecked(true); return;
          }
        }
      } catch { /* noop */ }
      // No valid session — hard redirect to login, replacing history
      window.location.replace('/login');
    };

    check();

    // Re-check when user navigates back/forward
    window.addEventListener('popstate', check);
    return () => window.removeEventListener('popstate', check);
  }, [router]);

  const venues = useData(() => api.listVenues());

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    // Replace history so back button lands on login, not admin dashboard
    router.replace('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '??';

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard',   icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { href: '/admin/arenas',    label: 'Manage Slots', icon: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' },
    { href: '/admin/settings',  label: 'Settings',     icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' },
  ];

  const typeColor: Record<string, { bg: string; text: string }> = {
    Arena: { bg: '#e8f4f8', text: '#0f5b78' },
    Gym:   { bg: '#fef3c7', text: '#92400e' },
    Pool:  { bg: '#e0f2fe', text: '#0369a1' },
  };

  if (!authChecked) {
    return (
      <div className="admin-shell-loading">
        <div className="admin-shell-loading-inner">
          <div className="login-loading-ring" style={{ width: 48, height: 48, position: 'relative', flexShrink: 0 }} />
          <span style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      {/* ── Sidebar ── */}
      <aside className="admin-shell-sidebar">
        {/* Brand */}
        <div className="admin-shell-brand">
          <Link href="/admin/dashboard" className="admin-shell-logo">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            Playdex
          </Link>
          <span className="admin-shell-brand-tag">Admin Console</span>
        </div>

        {/* Nav items */}
        <nav className="admin-shell-nav">
          <p className="admin-shell-section-label">Menu</p>
          {navItems.map(item => {
            const active = item.href === '/admin/dashboard'
              ? pathname === '/admin/dashboard'
              : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`admin-shell-nav-item${active ? ' active' : ''}`}>
                <I d={item.icon} />
                {item.label}
              </Link>
            );
          })}

          {/* ── Venues sub-list ── */}
          <p className="admin-shell-section-label" style={{ marginTop: 16 }}>
            <button
              onClick={() => setVenueOpen(v => !v)}
              style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, width: '100%', color: 'inherit', fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit' }}
            >
              Venues
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ marginLeft: 'auto', transition: 'transform .2s', transform: venueOpen ? 'rotate(180deg)' : 'none' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </p>

          {venueOpen && (
            <div className="admin-shell-venues">
              {venues.state === 'loading' && (
                <div style={{ padding: '6px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="spinner" style={{ width: 12, height: 12 }} />
                  <span style={{ fontSize: 11, color: 'rgba(168,189,201,.5)' }}>Loading…</span>
                </div>
              )}
              {venues.data?.slice(0, 40).map(v => {
                const c = typeColor[v.sport_type] ?? { bg: '#f0f4f6', text: '#4e5f6d' };
                return (
                  <Link
                    key={v.id}
                    href={`/admin/arenas?venue=${v.id}`}
                    className="admin-shell-venue-item"
                    title={v.name}
                  >
                    <span className="admin-shell-venue-dot" style={{ background: c.bg, color: c.text }}>
                      {v.sport_type[0]}
                    </span>
                    <span className="admin-shell-venue-name">{v.name}</span>
                  </Link>
                );
              })}
              {(venues.data?.length ?? 0) > 40 && (
                <div style={{ padding: '4px 12px', fontSize: 11, color: 'rgba(168,189,201,.4)' }}>
                  +{(venues.data?.length ?? 0) - 40} more…
                </div>
              )}
            </div>
          )}
        </nav>

        {/* User footer */}
        <div className="admin-shell-footer">
          <div className="admin-shell-user">
            <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, flexShrink: 0 }}>{initials}</div>
            <div className="admin-shell-user-info">
              <div className="admin-shell-user-name">{user?.name}</div>
              <div className="admin-shell-user-role">{user?.role}</div>
            </div>
            <button onClick={logout} className="admin-shell-logout" title="Sign out">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
          <a href="/arenas" className="admin-shell-public-link">
            <I d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" size={13} />
            View public site
          </a>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="admin-shell-main">
        <main className="admin-shell-content">{children}</main>
      </div>
    </div>
  );
}
