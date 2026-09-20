'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api-client';

export function LoginPage() {
  const { login } = useAuth();
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
      setError(
        err instanceof ApiError
          ? err.message
          : 'Login failed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left panel */}
      <div className="auth-left">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 48, textDecoration: 'none' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <span style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>Playdex</span>
          </Link>

          <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: 16, letterSpacing: '-0.03em' }}>
            The operations hub for sports events.
          </h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 16, lineHeight: 1.7, maxWidth: '44ch', marginBottom: 40 }}>
            Manage venues, schedule events, track bookings, and coordinate teams — all from one powerful dashboard.
          </p>

          <div style={{ display: 'grid', gap: 14 }}>
            {[
              { icon: '🏟️', text: 'Multi-venue event management' },
              { icon: '🎟️', text: 'Real-time booking pipeline' },
              { icon: '👥', text: 'Role-based access control' },
            ].map((item) => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ color: 'rgba(255,255,255,.85)', fontSize: 14, fontWeight: 500 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-card">
          <div style={{ marginBottom: 32 }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 28 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--color-primary)' }}>Playdex</span>
            </Link>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.02em' }}>
              Welcome back
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
              Sign in to your operations account
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              {error && (
                <div className="alert alert-error">
                  <span>✕</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="form-field">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="you@playdex.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '12px', fontSize: 15, marginTop: 4 }}
              >
                {loading ? (
                  <><span className="spinner" />Signing in…</>
                ) : (
                  'Sign in to Dashboard'
                )}
              </button>
            </div>
          </form>

          <div style={{
            marginTop: 28,
            padding: '16px',
            background: 'var(--color-surface-raised)',
            borderRadius: 8,
            border: '1px solid var(--color-border)',
            fontSize: 13,
          }}>
            <p style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
              Demo credentials
            </p>
            <div style={{ display: 'grid', gap: 4, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              <div>
                <span className="role-chip role-superadmin" style={{ marginRight: 8 }}>superadmin</span>
                Create an account via backend then log in
              </div>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--color-text-muted)' }}>
            <Link href="/" style={{ color: 'var(--color-text-muted)' }}>← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
