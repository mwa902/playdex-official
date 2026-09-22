'use client';

import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

/* ─── Sport tile SVG icons ──────────────────────────────────────────────── */
const SportIcons = {
  football: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10"/>
      <path d="M12 7l3 3-1 4-3 1-3-1-1-4z"/>
      <path d="M7.5 4.5l1.5 2.5M16.5 4.5L15 7M20.5 9.5l-2.5 1M20.5 14.5l-2.5-1M16.5 19.5L15 17M7.5 19.5l1.5-2.5M3.5 14.5l2.5-1M3.5 9.5l2.5 1"/>
    </svg>
  ),
  cricket: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="20" x2="16" y2="8"/>
      <path d="M14 6l4 4"/>
      <path d="M6 18l-2 3h3l1-2"/>
      <circle cx="18" cy="6" r="2"/>
    </svg>
  ),
  tennis: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M5.64 5.64a9 9 0 0 0 0 12.73"/>
      <path d="M18.36 5.64a9 9 0 0 1 0 12.73"/>
    </svg>
  ),
  basketball: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M4.93 4.93a10 10 0 0 1 14.14 14.14"/>
      <path d="M19.07 4.93A10 10 0 0 0 4.93 19.07"/>
      <line x1="12" y1="2" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
    </svg>
  ),
  badminton: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="21" x2="12" y2="12"/>
      <path d="M12 12l2-2 3 1 1 3-2 2z"/>
      <path d="M14 10l2-4 2-2 2 2-1 3-3 1z"/>
      <circle cx="19" cy="5" r="1.5" fill="currentColor"/>
    </svg>
  ),
  swimming: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12c1-1 2-1.5 3-1.5s2 .5 3 1.5 2 1.5 3 1.5 2-.5 3-1.5 2-1.5 3-1.5"/>
      <path d="M2 17c1-1 2-1.5 3-1.5s2 .5 3 1.5 2 1.5 3 1.5 2-.5 3-1.5 2-1.5 3-1.5"/>
      <circle cx="15" cy="7" r="2"/>
      <path d="M11 9l2-2 3 1"/>
    </svg>
  ),
  athletics: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2"/>
      <path d="M8 22l2-7-2-3 4-4 2 5h4"/>
      <path d="M6 13l-2 4"/>
      <path d="M14 10l2 4-2 4"/>
    </svg>
  ),
  volleyball: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 2a10 10 0 0 1 8.66 5"/>
      <path d="M3.34 7A10 10 0 0 0 12 22"/>
      <path d="M20.66 17A10 10 0 0 1 5 5.34"/>
    </svg>
  ),
  hockey: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 19c0 1 1 2 2 2h4c1 0 2-1 2-2V8l5-5"/>
      <path d="M9 19V8"/>
      <path d="M15 3l2 2"/>
    </svg>
  ),
  table_tennis: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="6"/>
      <path d="M15 3l6 6-8 8-3-3"/>
      <circle cx="19" cy="19" r="2" fill="currentColor" stroke="none"/>
    </svg>
  ),
  boxing: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="12" height="9" rx="3"/>
      <path d="M16 11h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2"/>
      <path d="M8 8V6a2 2 0 0 1 4 0v2"/>
    </svg>
  ),
  cycling: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="15" r="4"/>
      <circle cx="18" cy="15" r="4"/>
      <path d="M6 15l4-8h3l2 4h3"/>
      <path d="M10 7l2 8"/>
    </svg>
  ),
};

const SPORTS = [
  { name: 'Football',     sub: 'Leagues & cups',      color: '#0f5b78', icon: SportIcons.football    },
  { name: 'Cricket',      sub: 'Matches & series',    color: '#16a34a', icon: SportIcons.cricket     },
  { name: 'Tennis',       sub: 'Tournaments',         color: '#d97706', icon: SportIcons.tennis      },
  { name: 'Basketball',   sub: 'Seasons & playoffs',  color: '#dc2626', icon: SportIcons.basketball  },
  { name: 'Badminton',    sub: 'Singles & doubles',   color: '#7c3aed', icon: SportIcons.badminton   },
  { name: 'Swimming',     sub: 'Galas & relays',      color: '#0369a1', icon: SportIcons.swimming    },
  { name: 'Athletics',    sub: 'Track & field',       color: '#b45309', icon: SportIcons.athletics   },
  { name: 'Volleyball',   sub: 'Indoor & beach',      color: '#0891b2', icon: SportIcons.volleyball  },
  { name: 'Hockey',       sub: 'Field & ice',         color: '#065f46', icon: SportIcons.hockey      },
  { name: 'Table Tennis', sub: 'Open & ranked',       color: '#4f46e5', icon: SportIcons.table_tennis},
  { name: 'Boxing',       sub: 'Bouts & circuits',    color: '#9f1239', icon: SportIcons.boxing      },
  { name: 'Cycling',      sub: 'Road & velodrome',    color: '#92400e', icon: SportIcons.cycling     },
];

const SPORT_BENEFITS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Multi-team participant management',
    desc: 'Register individual athletes or full squads. Track registration status, allocate seats, and manage waitlists across every event type.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8"  y1="2" x2="8"  y2="6"/>
        <line x1="3"  y1="10" x2="21" y2="10"/>
      </svg>
    ),
    title: 'Flexible scheduling engine',
    desc: 'Set start and end times for any discipline. Schedule round-robins, knockouts, or time-trial formats. Conflict detection prevents double-booking.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    title: 'Venue-to-sport matching',
    desc: 'Tag venues by sport type and capacity. Assign courts, pitches, pools, or tracks to events and always know what facility is available.',
  },
];

/* ── SVG icon set (no emoji) ── */
const Icons = {
  logo: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  sun: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  moon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  arrow: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  check: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
};

const FEATURE_ICONS = {
  event: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  venue: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  booking: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
    </svg>
  ),
  org: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M3 21h18"/><path d="M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1"/>
      <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/>
    </svg>
  ),
  role: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  dashboard: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
};

const features = [
  { iconKey: 'event',     color: '#e8f4f8', darkColor: 'rgba(56,169,201,.12)', stroke: '#0f5b78', title: 'Event Management',     desc: 'Create, schedule, and manage sports events end-to-end. Track capacity, status, and participant flow in real time.' },
  { iconKey: 'venue',     color: '#fff3e0', darkColor: 'rgba(245,158,11,.1)',  stroke: '#d97706', title: 'Venue Operations',       desc: 'Register sports facilities, track court capacity, and assign events to venues with conflict detection.' },
  { iconKey: 'booking',   color: '#e8f5e9', darkColor: 'rgba(74,222,128,.1)',  stroke: '#16a34a', title: 'Booking Pipeline',       desc: 'Process participant registrations, manage seat allocation, and update booking statuses instantly.' },
  { iconKey: 'org',       color: '#f3e5f5', darkColor: 'rgba(167,139,250,.1)', stroke: '#7c3aed', title: 'Organisation Control',   desc: 'Manage multiple sports organisations and clubs with full CRUD access and event ownership.' },
  { iconKey: 'role',      color: '#e3f2fd', darkColor: 'rgba(96,165,250,.1)',  stroke: '#0369a1', title: 'Role-Based Access',      desc: 'Super admins create admins who manage operations. Fine-grained access control protects sensitive actions.' },
  { iconKey: 'dashboard', color: '#fce4ec', darkColor: 'rgba(248,113,113,.1)', stroke: '#dc2626', title: 'Live Dashboard',         desc: 'Real-time metrics on events, bookings, and venues. Always know the health of your sports network.' },
] as const;

const stats = [
  { value: '10K+',  label: 'Events managed' },
  { value: '500+',  label: 'Venues registered' },
  { value: '50K+',  label: 'Bookings processed' },
  { value: '99.9%', label: 'Platform uptime' },
];

export function LandingPage() {
  const { dark } = useTheme();

  return (
    <div className="marketing-layout">

      {/* ── Nav ── */}
      <nav className="mkt-nav">
        <div className="mkt-nav-inner">
          <Link href="/" className="mkt-nav-brand">
            {Icons.logo} Playdex
          </Link>

          {/* Center links */}
          <div className="mkt-nav-links">
            <a href="#features" className="mkt-nav-link">Features</a>
            <a href="#sports"   className="mkt-nav-link">Sports</a>
            <a href="#how"      className="mkt-nav-link">How it works</a>
            <a href="#stats"    className="mkt-nav-link">Platform</a>
          </div>

        
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/login" className="btn btn-primary btn-sm">Sign in</Link>
          </div>
        </div>
      </nav>

  
      <section className="hero">
        <div className="mkt-section">
          <div className="hero-inner">
            <div className="hero-eyebrow">Sports Management Platform</div>
            <h1>
              Run every match.<br />
              <span>Own every result.</span>
            </h1>
            <p className="hero-desc">
              Playdex is the professional operations console for sports event organisers.
              Schedule events, manage venues, process bookings, and coordinate organisations —
              all from one authoritative dashboard.
            </p>
            <div className="hero-actions">
              <Link href="/login" className="btn btn-primary btn-lg">
                Access Dashboard {Icons.arrow}
              </Link>
              <a href="#features" className="btn btn-lg" style={{
                background: 'rgba(255,255,255,.1)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,.2)',
              }}>
                Explore features
              </a>
            </div>
            <div style={{ marginTop: 36, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {['No setup fees', 'Real-time data', 'Role-based access', 'REST API included'].map(b => (
                <div key={b} className="hero-badge">
                  <span style={{ color: 'var(--color-accent-light)', display: 'flex' }}>{Icons.check}</span>
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    
      <section id="stats" className="stats-bar">
        <div className="mkt-section">
          <div className="stats-inner">
            {stats.map(s => (
              <div key={s.label}>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

  
      <section id="features" className="features-section">
        <div className="mkt-section">
          <span className="section-label">Capabilities</span>
          <h2 className="section-heading">Everything your operations team needs</h2>
          <p className="section-sub">
            From first whistle to final booking, Playdex provides every stakeholder with the
            tools to keep sports operations running at full capacity.
          </p>
          <div className="features-grid">
            {features.map(f => (
              <div key={f.title} className="feature-card">
                <div
                  className="feature-icon"
                  style={{ background: dark ? f.darkColor : f.color, color: f.stroke }}
                >
                  {FEATURE_ICONS[f.iconKey]}
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sports we support ── */}
      <section id="sports" style={{
        padding: '88px 0',
        background: 'var(--color-bg)',
        transition: 'background var(--transition)',
      }}>
        <div className="mkt-section">
          <span className="section-label">Sports covered</span>
          <h2 className="section-heading">Every discipline, one platform</h2>
          <p className="section-sub">
            Playdex is built for the full spectrum of competitive sports. Whether you run
            a grassroots football league or a national cricket tournament, the platform
            scales to your operation.
          </p>

          {/* Sport tiles */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 14,
            marginBottom: 56,
          }}>
            {SPORTS.map(s => (
              <div key={s.name} className="sport-tile">
                <div className="sport-tile-icon" style={{ color: s.color }}>
                  {s.icon}
                </div>
                <span className="sport-tile-name">{s.name}</span>
                <span className="sport-tile-sub">{s.sub}</span>
              </div>
            ))}
          </div>

          {/* Benefits strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
          }}>
            {SPORT_BENEFITS.map(b => (
              <div key={b.title} style={{
                padding: '24px 28px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                gap: 16,
                alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 42, height: 42,
                  borderRadius: 10,
                  background: dark ? 'rgba(56,169,201,.12)' : '#e8f4f8',
                  color: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {b.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: 'var(--color-text)' }}>
                    {b.title}
                  </div>
                  <div style={{ fontSize: 13.5, color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
                    {b.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" style={{ padding: '88px 0', background: 'var(--color-surface)', transition: 'background var(--transition)' }}>
        <div className="mkt-section">
          <span className="section-label">Process</span>
          <h2 className="section-heading">Operational from day one</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, marginTop: 52 }}>
            {[
              {
                step: '01',
                title: 'Super Admin activates the platform',
                desc: 'The super admin signs in, creates admin accounts, and configures event types. Full platform control from a single privileged account.',
              },
              {
                step: '02',
                title: 'Admins build the operations layer',
                desc: 'Admins register organisations, add venues, schedule events, and manage the full operational catalogue.',
              },
              {
                step: '03',
                title: 'Bookings flow and data is live',
                desc: 'Participants book events in real time. Status updates propagate instantly across the dashboard for every team member.',
              },
            ].map(s => (
              <div key={s.step} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div style={{
                  fontWeight: 900,
                  fontSize: 42,
                  color: dark ? 'rgba(56,169,201,.2)' : 'var(--color-primary-light)',
                  letterSpacing: '-0.05em',
                  lineHeight: 1,
                  flexShrink: 0,
                  minWidth: 56,
                }}>
                  {s.step}
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: 15, color: 'var(--color-text)' }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="mkt-section">
          <h2>Ready to run your sports network?</h2>
          <p>Access the Playdex operations dashboard and take full control of your events, venues, and bookings.</p>
          <div className="cta-actions">
            <Link href="/login" className="btn btn-primary btn-lg">
              Sign in to Dashboard {Icons.arrow}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mkt-footer">
        <div className="mkt-section">
          <div className="mkt-footer-grid">
            <div className="mkt-footer-brand">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 18, color: '#fff' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                Playdex
              </div>
              <p>
                Centralized sports operations software for venues, clubs, and event teams managing schedules, bookings, and live event coordination.
              </p>
            </div>

            <div className="mkt-footer-col">
              <h4>Platform</h4>
              <a href="#features">Features</a>
              <a href="#sports">Sports</a>
              <a href="#how">How it works</a>
            </div>

            <div className="mkt-footer-col">
              <h4>Company</h4>
              <Link href="/login">Operations dashboard</Link>
              <a href="#pricing">Pricing</a>
              <a href="#support">Support</a>
            </div>

            <div className="mkt-footer-col">
              <h4>Contact</h4>
              <a href="mailto:hello@playdex.io">hello@playdex.io</a>
              <a href="tel:+15550198">+1 (555) 0198</a>
              <span>Live ops support</span>
            </div>
          </div>

          <div className="mkt-footer-bottom">
            <span>© {new Date().getFullYear()} Playdex Operations Platform</span>
            <span>Built for organizers, venues, and event teams</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
