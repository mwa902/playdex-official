'use client';

import Link from 'next/link';

const features = [
  {
    icon: '🏟️',
    color: '#e8f4f8',
    title: 'Event Management',
    desc: 'Create, schedule, and manage sports events end-to-end. Track capacity, status, and participant flow in real time.',
  },
  {
    icon: '📍',
    color: '#fff3e0',
    title: 'Venue Operations',
    desc: 'Register sports facilities, track court capacity, and assign events to venues with conflict detection.',
  },
  {
    icon: '🎟️',
    color: '#e8f5e9',
    title: 'Booking Pipeline',
    desc: 'Process participant registrations, manage seat allocation, and update booking statuses from one place.',
  },
  {
    icon: '🏢',
    color: '#f3e5f5',
    title: 'Organisation Control',
    desc: 'Manage multiple sports organisations and clubs with full CRUD access and event ownership.',
  },
  {
    icon: '👤',
    color: '#e3f2fd',
    title: 'Role-Based Access',
    desc: 'Super admins create admins who manage operations. Fine-grained access control protects sensitive actions.',
  },
  {
    icon: '📊',
    color: '#fce4ec',
    title: 'Live Dashboard',
    desc: 'Real-time metrics on events, bookings, and venues. Always know the health of your sports network.',
  },
];

const stats = [
  { value: '10K+', label: 'Events managed' },
  { value: '500+', label: 'Venues registered' },
  { value: '50K+', label: 'Bookings processed' },
  { value: '99.9%', label: 'Uptime' },
];

export function LandingPage() {
  return (
    <div className="marketing-layout">
      {/* Nav */}
      <nav className="mkt-nav">
        <div className="mkt-nav-inner">
          <Link href="/" className="mkt-nav-brand">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Playdex
          </Link>
          <div className="mkt-nav-links">
            <a href="#features" className="mkt-nav-link">Features</a>
            <a href="#stats" className="mkt-nav-link">Platform</a>
            <Link href="/login" className="mkt-nav-link" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              Sign in
            </Link>
            <Link href="/login" className="btn btn-primary btn-sm" style={{ marginLeft: 8 }}>
              Get started
            </Link>
          </div>
          {/* Mobile sign-in */}
          <Link href="/login" className="btn btn-primary btn-sm" style={{ display: 'none' }} aria-hidden>
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="mkt-section">
          <div className="hero-inner">
            <div className="hero-eyebrow">Sports Management Platform</div>
            <h1>
              Run every match.<br />
              <span>Manage every player.</span>
            </h1>
            <p className="hero-desc">
              Playdex is the all-in-one operations console for sports event organisers.
              Schedule events, manage venues, process bookings, and coordinate teams —
              all from a single, powerful dashboard.
            </p>
            <div className="hero-actions">
              <Link href="/login" className="btn btn-primary btn-lg">
                Go to Dashboard →
              </Link>
              <a href="#features" className="btn btn-lg" style={{
                background: 'rgba(255,255,255,.12)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,.2)',
              }}>
                Explore features
              </a>
            </div>
            <div style={{ marginTop: 36, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {['No setup fees', 'Real-time data', 'Role-based access', 'Full API access'].map((b) => (
                <div key={b} className="hero-badge">
                  <span style={{ color: 'var(--color-accent-light)' }}>✓</span> {b}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="stats-bar">
        <div className="mkt-section">
          <div className="stats-inner">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features-section">
        <div className="mkt-section">
          <span className="section-label">What's included</span>
          <h2 className="section-heading">Everything a sports platform needs</h2>
          <p className="section-sub">
            From first whistle to final booking, Playdex gives every stakeholder exactly what
            they need to keep operations running smoothly.
          </p>
          <div className="features-grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon" style={{ background: f.color }}>
                  {f.icon}
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 0', background: 'var(--color-surface)' }}>
        <div className="mkt-section">
          <span className="section-label">How it works</span>
          <h2 className="section-heading">Up and running in minutes</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
            marginTop: 48,
          }}>
            {[
              {
                step: '01',
                title: 'Super Admin signs in',
                desc: 'The super admin logs in and gains full platform access to create admins and configure the system.',
              },
              {
                step: '02',
                title: 'Admins manage operations',
                desc: 'Admins set up organisations, register venues, define event types, and schedule events.',
              },
              {
                step: '03',
                title: 'Bookings flow in',
                desc: 'Participants book events, statuses update in real time, and you get a clear view of every seat.',
              },
            ].map((s) => (
              <div key={s.step} style={{ display: 'flex', gap: 20 }}>
                <div style={{
                  fontWeight: 900,
                  fontSize: 36,
                  color: 'var(--color-primary-light)',
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                  flexShrink: 0,
                }}>
                  {s.step}
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: 16 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="mkt-section">
          <h2>Ready to run your sports network?</h2>
          <p>Sign in to access the Playdex operations dashboard and take full control of your events.</p>
          <div className="cta-actions">
            <Link href="/login" className="btn btn-primary btn-lg">
              Sign in to Dashboard →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mkt-footer">
        <div className="mkt-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>
              ⚡ Playdex
            </div>
            <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
              <a href="#features">Features</a>
              <Link href="/login">Sign in</Link>
            </div>
            <div style={{ fontSize: 12, opacity: 0.5 }}>
              © {new Date().getFullYear()} Playdex Operations Platform
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
