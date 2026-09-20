'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { ApiError } from '@/lib/api-client';

/* ── Demo accounts shown on the login page ──────────────────
   These match users that should exist in the backend.
   The superadmin account is seeded by default.
   The admin account is created by the superadmin.
───────────────────────────────────────────────────────────── */
const DEMO_ACCOUNTS = [
  {
    label: 'Super Admin',
    role: 'superadmin',
    email: 'superadmin@playdex.io',
    password: 'SuperAdmin@2024',
    description: 'Full platform access · create admins · configure system',
    chipClass: 'role-superadmin',
  },
  {
    label: 'Admin',
    role: 'admin',
    email: 'admin@playdex.io',
    password: 'Admin@2024',
    description: 'Manage events, venues, bookings & organisations',
    chipClass: 'role-admin',
  },
];

/* ── SVG icons (no emoji) ────────────────────────────────── */
const LogoIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8"  y1="2" x2="8"  y2="6" />
    <line x1="3"  y1="10" x2="21" y2="10" />
  </svg>
);

export function LoginPage() {
  const { login } = useAuth();
  const { dark, toggle } = useTheme();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError(null);
  };

  return (
    <div className="auth-layout">

      {/* ── Left panel ── */}
      <div className="auth-left">
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 480 }}>

          {/* Brand */}
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 52, textDecoration: 'none' }}>
            <span style={{ color: '#fbbf24' }}><LogoIcon /></span>
            <span style={{ color: '#fff', fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>Playdex</span>
          </Link>

          <h1 style={{
            color: '#fff',
            fontSize: 'clamp(1.7rem, 2.8vw, 2.6rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: 16,
          }}>
            The operations hub<br />for sports events.
          </h1>
          <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 15, lineHeight: 1.75, maxWidth: '40ch', marginBottom: 44 }}>
            Manage venues, schedule events, track bookings, and control access — from one professional dashboard built for sports operations teams.
          </p>

          {/* Feature list — SVG icons */}
          <div style={{ display: 'grid', gap: 16 }}>
            {[
              { Icon: CalendarIcon, text: 'Multi-venue event scheduling' },
              { Icon: UsersIcon,    text: 'Role-based access control' },
              { Icon: ShieldIcon,   text: 'Super admin privilege management' },
            ].map(({ Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32, height: 32,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fbbf24',
                  flexShrink: 0,
                }}>
                  <Icon />
                </div>
                <span style={{ color: 'rgba(255,255,255,.82)', fontSize: 14, fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Bottom badge */}
          <div style={{
            marginTop: 52,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 14px',
            background: 'rgba(255,255,255,.07)',
            border: '1px solid rgba(255,255,255,.12)',
            borderRadius: 8,
            fontSize: 12,
            color: 'rgba(255,255,255,.55)',
          }}>
            <LockIcon />
            Secured with role-based access control
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="auth-right">
        <div className="auth-card">

          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
            <div>
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 24 }}>
                <span style={{ color: 'var(--color-primary)' }}><LogoIcon /></span>
                <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>Playdex</span>
              </Link>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 5, letterSpacing: '-0.02em', color: 'var(--color-text)' }}>
                Welcome back
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 13.5 }}>
                Sign in to your operations account
              </p>
            </div>

            {/* Theme toggle */}
            <button
              className="theme-toggle"
              onClick={toggle}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{ marginTop: 4 }}
            >
              <div className="theme-toggle-track">
                <div className="theme-toggle-thumb">
                  {dark
                    ? <svg className="theme-toggle-icon theme-toggle-icon-moon" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                    : <svg className="theme-toggle-icon theme-toggle-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                  }
                </div>
              </div>
            </button>
          </div>

          {/* Demo account quick-fill */}
          <div style={{ marginBottom: 24 }}>
            <p style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.1em',
              color: 'var(--color-text-muted)',
              marginBottom: 10,
            }}>
              Demo accounts
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 5,
                    padding: '12px 14px',
                    background: 'var(--color-surface-raised)',
                    border: `1px solid ${email === acc.email ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border-color var(--transition), background var(--transition)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span className={`role-chip ${acc.chipClass}`}>{acc.label}</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.4, margin: 0 }}>
                    {acc.description}
                  </p>
                  <p style={{
                    fontSize: 10,
                    color: 'var(--color-primary)',
                    fontFamily: 'var(--font-mono)',
                    margin: 0,
                    opacity: .8,
                  }}>
                    {acc.email}
                  </p>
                </button>
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ color: 'var(--color-primary)', display: 'flex' }}><CheckIcon /></span>
              Click a card to auto-fill credentials, then sign in.
            </p>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 }}>or enter manually</span>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              {error && (
                <div className="alert alert-error">
                  <span style={{ flexShrink: 0 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  </span>
                  <span>{error}</span>
                </div>
              )}

              <div className="form-field">
                <label htmlFor="login-email" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'var(--color-text-muted)', display: 'flex' }}><UserIcon /></span>
                  Email address
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="you@playdex.io"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="login-password" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'var(--color-text-muted)', display: 'flex' }}><LockIcon /></span>
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '12px 20px', fontSize: 15, marginTop: 4, justifyContent: 'center' }}
              >
                {loading
                  ? <><span className="spinner" style={{ width: 16, height: 16 }} />Signing in…</>
                  : 'Sign in to Dashboard'
                }
              </button>
            </div>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--color-text-muted)' }}>
            <Link href="/" style={{ color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
