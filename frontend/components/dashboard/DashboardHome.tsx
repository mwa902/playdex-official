'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/hooks/useData';
import { api } from '@/lib/api-client';
import { StateView } from '@/components/ui/StateView';
import { StatusBadge } from '@/components/ui/StatusBadge';

function MetricCard({
  icon, label, value, sub, color,
}: {
  icon: string; label: string; value: number | string; sub: string; color: string;
}) {
  return (
    <div className="card">
      <div className="card-body metric-card">
        <div className="metric-icon" style={{ background: color, fontSize: 22 }}>{icon}</div>
        <div className="metric-value">{value}</div>
        <div className="metric-label">{label}</div>
        <div className="metric-sub">{sub}</div>
      </div>
    </div>
  );
}

export function DashboardHome() {
  const { user } = useAuth();
  const events   = useData(() => api.listEvents());
  const bookings = useData(() => api.listBookings());
  const venues   = useData(() => api.listVenues());
  const orgs     = useData(() => api.listOrganizations());

  const confirmedBookings = bookings.data?.filter((b) => b.status === 'Confirm Booking').length ?? 0;
  const pendingBookings   = bookings.data?.filter((b) => b.status === 'Pending').length ?? 0;
  const availableEvents   = events.data?.filter((e) => e.status === 'Available').length ?? 0;

  return (
    <div className="page-grid">
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(120deg, #0d1f2d 0%, #0f5b78 55%, #1686a4 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: .12,
          background: 'radial-gradient(circle at 80% 50%, #fbbf24 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative' }}>
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', opacity: .7, marginBottom: 6 }}>
            OPERATIONS DASHBOARD
          </p>
          <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 8 }}>
            Welcome back, {user?.name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p style={{ opacity: .8, fontSize: 14, maxWidth: '60ch' }}>
            Here&apos;s a real-time overview of your sports operations platform.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        <MetricCard icon="📅" label="Total Events"    value={events.data?.length ?? '–'}   sub={`${availableEvents} available`}   color="#e8f4f8" />
        <MetricCard icon="🎟️" label="Total Bookings"  value={bookings.data?.length ?? '–'} sub={`${pendingBookings} pending`}      color="#fff3e0" />
        <MetricCard icon="📍" label="Venues"          value={venues.data?.length ?? '–'}   sub="registered facilities"            color="#e8f5e9" />
        <MetricCard icon="🏢" label="Organizations"   value={orgs.data?.length ?? '–'}     sub="managing events"                  color="#f3e5f5" />
      </div>

      {/* Data rows */}
      <div className="two-col">
        {/* Recent events */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Events</h3>
            <Link href="/events" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          <StateView
            state={events.state}
            error={events.error}
            retry={events.reload}
            emptyIcon="📅"
            emptyTitle="No events yet"
            emptyBody="Create your first event to see it here."
          >
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Capacity</th>
                    <th>Starts</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {events.data?.slice(0, 6).map((e) => (
                    <tr key={e.id}>
                      <td>
                        <Link href={`/events/${e.id}`} style={{ fontWeight: 500, color: 'var(--color-primary)' }}>
                          {e.name}
                        </Link>
                      </td>
                      <td>{e.capacity}</td>
                      <td style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
                        {new Date(e.started_at).toLocaleDateString()}
                      </td>
                      <td><StatusBadge value={e.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </StateView>
        </div>

        {/* Recent bookings */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recent Bookings</h3>
            <Link href="/bookings" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          <StateView
            state={bookings.state}
            error={bookings.error}
            retry={bookings.reload}
            emptyIcon="🎟️"
            emptyTitle="No bookings yet"
            emptyBody="Bookings will appear here once created."
          >
            <div style={{ padding: '0 0 8px' }}>
              {bookings.data?.slice(0, 7).map((b) => (
                <div key={b.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 24px',
                  borderBottom: '1px solid var(--color-border)',
                  gap: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div className="avatar" style={{ width: 30, height: 30, fontSize: 11, flexShrink: 0 }}>
                      {b.customer_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {b.customer_name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{b.seats} seat{b.seats !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <StatusBadge value={b.status} />
                </div>
              ))}
            </div>
          </StateView>
        </div>
      </div>

      {/* Venue pulse */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Venue Pulse</h3>
          <Link href="/venues" className="btn btn-ghost btn-sm">Manage →</Link>
        </div>
        <StateView
          state={venues.state}
          error={venues.error}
          retry={venues.reload}
          emptyIcon="📍"
          emptyTitle="No venues registered"
          emptyBody="Add venues to see them here."
        >
          <div className="card-grid" style={{ padding: '0 24px 24px' }}>
            {venues.data?.map((v) => (
              <div key={v.id} style={{
                padding: '16px',
                background: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>📍</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{v.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{v.city}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  Capacity: <strong>{v.capacity}</strong>
                </div>
              </div>
            ))}
          </div>
        </StateView>
      </div>

      {/* Bookings summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {[
          { label: 'Confirmed', value: confirmedBookings, color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
          { label: 'Pending',   value: pendingBookings,   color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
          { label: 'Available Events', value: availableEvents, color: 'var(--color-info)', bg: 'var(--color-info-bg)' },
        ].map((s) => (
          <div key={s.label} className="card card-body" style={{ background: s.bg, borderColor: 'transparent' }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: s.color, letterSpacing: '-0.04em' }}>{s.value}</div>
            <div style={{ fontSize: 13, color: s.color, fontWeight: 600, opacity: .85 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
