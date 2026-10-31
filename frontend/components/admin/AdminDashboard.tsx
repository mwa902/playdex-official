'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useData } from '@/hooks/useData';
import { api, type User } from '@/lib/api-client';
import { StatusBadge } from '@/components/ui/StatusBadge';

const SESSION_KEY = 'playdex_user';

function StatCard({ icon, label, value, sub, accent }: {
  icon: string; label: string; value: number | string; sub: string; accent: string;
}) {
  return (
    <div className="admin-dash-stat">
      <div className="admin-dash-stat-icon" style={{ background: accent }}>{icon}</div>
      <div className="admin-dash-stat-value">{value}</div>
      <div className="admin-dash-stat-label">{label}</div>
      <div className="admin-dash-stat-sub">{sub}</div>
    </div>
  );
}

export function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) setUser(JSON.parse(stored) as User);
    } catch { /* noop */ }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    window.location.replace('/login'); // hard replace — clears history stack
  };

  const venues   = useData(() => api.listVenues());
  const events   = useData(() => api.listEvents());
  const bookings = useData(() => api.listBookings());
  const orgs     = useData(() => api.listOrganizations());

  const availableSlots = events.data?.filter(e => e.status === 'Available').length ?? 0;
  const pendingBook    = bookings.data?.filter(b => b.status === 'Pending').length ?? 0;
  const confirmedBook  = bookings.data?.filter(b => b.status === 'Confirm Booking').length ?? 0;

  const recentBookings = [...(bookings.data ?? [])].sort(
    (a, b) => new Date(b.booked_at).getTime() - new Date(a.booked_at).getTime()
  ).slice(0, 8);

  const recentSlots = [...(events.data ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 6);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '??';

  return (
    <div className="page-grid">

      {/* ── Welcome banner ── */}
      <div className="admin-dash-banner">
        <div className="admin-dash-banner-glow" />
        <div className="admin-dash-banner-content">
          <div>
            <p className="admin-dash-banner-eyebrow">Admin Console · Playdex</p>
            <h1 className="admin-dash-banner-title">
              Welcome back, {user?.name?.split(' ')[0] ?? 'there'} 👋
            </h1>
            <p className="admin-dash-banner-sub">
              Here's a live overview of all Lahore sports venues and booking activity.
            </p>
          </div>
          <div className="admin-dash-banner-profile">
            <div className="admin-dash-avatar">{initials}</div>
            <div>
              <div className="admin-dash-banner-name">{user?.name}</div>
              <div className="admin-dash-banner-role">{user?.role}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <Link href="/admin/settings" className="admin-dash-settings-link">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="admin-dash-logout-btn"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="admin-dash-stats">
        <StatCard icon="📍" label="Total Venues"  value={venues.data?.length ?? '—'}   sub="Lahore directory"       accent="rgba(15,91,120,.1)" />
        <StatCard icon="📅" label="Total Slots"   value={events.data?.length ?? '—'}   sub={`${availableSlots} available`} accent="rgba(22,163,74,.1)" />
        <StatCard icon="🎟️" label="Bookings"      value={bookings.data?.length ?? '—'} sub={`${pendingBook} pending`}      accent="rgba(217,119,6,.1)" />
        <StatCard icon="✅" label="Confirmed"     value={confirmedBook}                sub="confirmed bookings"     accent="rgba(56,169,201,.1)" />
        <StatCard icon="⚽" label="Arenas"        value={venues.data?.filter(v => v.sport_type === 'Arena').length ?? '—'} sub="sports arenas" accent="rgba(15,91,120,.08)" />
        <StatCard icon="🏋️" label="Gyms"          value={venues.data?.filter(v => v.sport_type === 'Gym').length ?? '—'}   sub="fitness centres"  accent="rgba(245,158,11,.1)" />
        <StatCard icon="🏊" label="Pools"         value={venues.data?.filter(v => v.sport_type === 'Pool').length ?? '—'}  sub="swimming pools"   accent="rgba(3,105,161,.1)" />
        <StatCard icon="🏢" label="Organisations" value={orgs.data?.length ?? '—'}     sub="managing venues"       accent="rgba(139,92,246,.1)" />
      </div>

      {/* ── Two column ── */}
      <div className="two-col">

        {/* Recent bookings */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontWeight: 700, fontSize: 15 }}>Recent Bookings</h3>
            <span className="badge badge-info">{bookings.data?.length ?? 0}</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recentBookings.length === 0 ? (
              <div className="empty-state" style={{ padding: '28px 24px' }}>
                <p className="empty-title">No bookings yet</p>
              </div>
            ) : (
              recentBookings.map(b => (
                <div key={b.id} className="admin-dash-booking-row">
                  <div className="avatar" style={{ width: 30, height: 30, fontSize: 11, flexShrink: 0 }}>
                    {b.customer_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.customer_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{b.customer_phone} · {b.seats} seat{b.seats !== 1 ? 's' : ''}</div>
                  </div>
                  <StatusBadge value={b.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent slots */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontWeight: 700, fontSize: 15 }}>Latest Slots</h3>
            <Link href="/admin/arenas" className="btn btn-secondary btn-sm">Manage</Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recentSlots.length === 0 ? (
              <div className="empty-state" style={{ padding: '28px 24px' }}>
                <span style={{ fontSize: 32 }}>📅</span>
                <p className="empty-title">No slots yet</p>
                <Link href="/admin/arenas" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>Add slots</Link>
              </div>
            ) : (
              recentSlots.map(ev => {
                const venue = venues.data?.find(v => v.id === ev.venue_id);
                return (
                  <div key={ev.id} className="admin-dash-slot-row">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                        {venue?.name ?? '—'} · {new Date(ev.started_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                      <StatusBadge value={ev.status} />
                      {ev.price != null && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)' }}>PKR {ev.price.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="admin-dash-actions">
        {[
          { href: '/admin/arenas',   icon: '➕', label: 'Add Slot',       desc: 'Schedule a new slot at any venue' },
          { href: '/arenas',         icon: '👁️', label: 'Public View',    desc: 'See how users browse venues' },
          { href: '/admin/settings', icon: '🔑', label: 'Change Password', desc: 'Update your account credentials' },
        ].map(a => (
          <Link key={a.href} href={a.href} className="admin-dash-action-card">
            <span className="admin-dash-action-icon">{a.icon}</span>
            <div>
              <div className="admin-dash-action-label">{a.label}</div>
              <div className="admin-dash-action-desc">{a.desc}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 'auto', flexShrink: 0, color: 'var(--color-text-muted)' }}>
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
