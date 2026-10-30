'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { api, ApiError } from '@/lib/api-client';

// ─── Rate limit helpers — stored in sessionStorage ───────────────────────────
const RL_KEY = 'playdex_login_rl';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS   = 2 * 60 * 1000; // 2 minutes

function getRateLimit(): { attempts: number; lockedUntil: number } {
  try {
    const raw = sessionStorage.getItem(RL_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  return { attempts: 0, lockedUntil: 0 };
}
function setRateLimit(data: { attempts: number; lockedUntil: number }) {
  try { sessionStorage.setItem(RL_KEY, JSON.stringify(data)); } catch { /* noop */ }
}
function clearRateLimit() {
  try { sessionStorage.removeItem(RL_KEY); } catch { /* noop */ }
}
function msToCountdown(ms: number): string {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

// ─── Loading overlay ──────────────────────────────────────────────────────────
function LoadingOverlay({ name, isSignup }: { name: string; isSignup: boolean }) {
  return (
    <div className="login-loading-overlay">
      <div className="login-loading-card">
        <div className="login-loading-logo">
          <div className="login-loading-ring" />
          <div className="login-loading-ring login-loading-ring-2" />
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative', zIndex: 1 }}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <div className="login-loading-dots"><span /><span /><span /></div>
        <h2 className="login-loading-title">
          {isSignup ? `Welcome, ${name.split(' ')[0] || 'there'}!` : `Welcome back${name ? `, ${name.split(' ')[0]}` : ''}!`}
        </h2>
        <p className="login-loading-sub">
          {isSignup ? 'Creating your account…' : 'Setting up your workspace…'}
        </p>
        <div className="login-loading-bar"><div className="login-loading-progress" /></div>
      </div>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const LogoIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const UserIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const NameIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const EyeOnIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

// ─── Password input with eye toggle ──────────────────────────────────────────
function PasswordField({
  id, label, value, onChange, placeholder, autoComplete, disabled,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  autoComplete?: string; disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="form-field">
      <label htmlFor={id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: 'var(--color-text-muted)', display: 'flex' }}><LockIcon /></span>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className="form-input"
          style={{ paddingRight: 44 }}
          placeholder={placeholder ?? '••••••••'}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          required
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', padding: 0 }}
          aria-label={show ? 'Hide' : 'Show'}
          tabIndex={-1}
        >
          {show ? <EyeOffIcon /> : <EyeOnIcon />}
        </button>
      </div>
    </div>
  );
}

// ─── Demo quick-fill cards ────────────────────────────────────────────────────
const DEMO_ACCOUNTS = [
  {
    label: 'Superadmin',
    email: 'superadmin@playdex.io',
    password: 'SuperAdmin@2024',
    desc: 'Full platform access',
    color: '#0f5b78', bg: '#e8f4f8',
    icon: <ShieldIcon />,
  },
  {
    label: 'Wahad Ahmed',
    email: 'wahad@playdex.io',
    password: 'Wahad@2024',
    desc: 'Admin — arenas & slots',
    color: '#16a34a', bg: '#dcfce7',
    icon: <UserIcon />,
  },
];

// ─── Main page ────────────────────────────────────────────────────────────────
type Tab = 'login' | 'signup';

export function LoginPage() {
  const { login }       = useAuth();
  const { dark, toggle } = useTheme();

  const [tab, setTab] = useState<Tab>('login');

  // Shared
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [loadingName, setLoadingName] = useState('');

  // Login fields
  const [lEmail,    setLEmail]    = useState('');
  const [lPassword, setLPassword] = useState('');

  // Rate limiting
  const [attempts,     setAttempts]     = useState(() => getRateLimit().attempts);
  const [lockedUntil,  setLockedUntil]  = useState(() => getRateLimit().lockedUntil);
  const [countdown,    setCountdown]    = useState('');

  // Countdown ticker
  useEffect(() => {
    if (lockedUntil <= Date.now()) return;
    const tick = () => {
      const remaining = lockedUntil - Date.now();
      if (remaining <= 0) { setLockedUntil(0); setAttempts(0); clearRateLimit(); setCountdown(''); return; }
      setCountdown(msToCountdown(remaining));
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [lockedUntil]);

  // Signup fields
  const [sName,      setSName]      = useState('');
  const [sEmail,     setSEmail]     = useState('');
  const [sPassword,  setSPassword]  = useState('');
  const [sConfirm,   setSConfirm]   = useState('');
  const [signupDone, setSignupDone] = useState(false);

  // ── Login submit ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Check lockout
    const rl = getRateLimit();
    if (rl.lockedUntil > Date.now()) {
      setError(`Too many failed attempts. Try again in ${msToCountdown(rl.lockedUntil - Date.now())}.`);
      return;
    }
    if (!lEmail || !lPassword) { setError('Enter your email and password.'); return; }
    setLoading(true); setLoadingName(''); setError(null);
    try {
      await login(lEmail, lPassword);
      clearRateLimit();
      setAttempts(0);
    } catch (err) {
      const newAttempts = rl.attempts + 1;
      if (newAttempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_MS;
        setRateLimit({ attempts: newAttempts, lockedUntil: until });
        setAttempts(newAttempts);
        setLockedUntil(until);
        setError(`Too many failed attempts (${MAX_ATTEMPTS}/${MAX_ATTEMPTS}). Locked for 2 minutes.`);
      } else {
        setRateLimit({ attempts: newAttempts, lockedUntil: 0 });
        setAttempts(newAttempts);
        const remaining = MAX_ATTEMPTS - newAttempts;
        setError(
          err instanceof ApiError
            ? `${err.message} — ${remaining} attempt${remaining !== 1 ? 's' : ''} left.`
            : `Incorrect email or password — ${remaining} attempt${remaining !== 1 ? 's' : ''} left.`
        );
      }
      setLoading(false);
    }
  };

  // ── Signup submit ──
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sName.trim())  { setError('Full name is required.'); return; }
    if (!sEmail.trim()) { setError('Email is required.'); return; }
    if (sPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (sPassword !== sConfirm) { setError('Passwords do not match.'); return; }
    setLoading(true); setLoadingName(sName); setError(null);
    try {
      // Create account
      await api.createUser({ name: sName.trim(), email: sEmail.trim(), password: sPassword, role: 'user' });
      // Auto-login after signup
      await login(sEmail.trim(), sPassword);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign up failed. Please try again.');
      setLoading(false);
    }
  };

  const switchTab = (t: Tab) => { setTab(t); setError(null); setSignupDone(false); };

  const fillDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setLEmail(acc.email);
    setLPassword(acc.password);
    setLoadingName(acc.label);
    setError(null);
    setTab('login');
  };

  return (
    <>
      {loading && <LoadingOverlay name={loadingName} isSignup={tab === 'signup'} />}

      <div className="auth-layout">

        {/* ── Left branding ── */}
        <div className="auth-left">
          <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 460 }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 48, textDecoration: 'none' }}>
              <span style={{ color: '#fbbf24' }}><LogoIcon /></span>
              <span style={{ color: '#fff', fontSize: 19, fontWeight: 800, letterSpacing: '-.02em' }}>Playdex</span>
            </Link>

            <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem,3vw,2.7rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-.03em', marginBottom: 16 }}>
              Lahore sports,<br/><span style={{ color: '#fbbf24' }}>book online.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 14.5, lineHeight: 1.75, maxWidth: '36ch', marginBottom: 44 }}>
              Create a free account to browse and book slots at 135 arenas, gyms and pools across Lahore. Pay via SadaPay, NayaPay, Easypaisa or Raast.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: '📍', text: '135 Lahore venues listed' },
                { icon: '📅', text: 'Morning, afternoon & evening slots' },
                { icon: '💳', text: 'Pay via SadaPay · NayaPay · Easypaisa · Raast' },
              ].map(f => (
                <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                    {f.icon}
                  </div>
                  <span style={{ color: 'rgba(255,255,255,.82)', fontSize: 13.5, fontWeight: 500 }}>{f.text}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 48, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
              <LockIcon /> Free account — no payment card required
            </div>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="auth-right">
          <div className="auth-card">

            {/* Brand + theme toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                <span style={{ color: 'var(--color-primary)' }}><LogoIcon /></span>
                <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--color-primary)' }}>Playdex</span>
              </Link>
              <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
                <div className="theme-toggle-track">
                  <div className="theme-toggle-thumb">
                    {dark
                      ? <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                      : <svg className="theme-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>
                    }
                  </div>
                </div>
              </button>
            </div>

            {/* ── Tab switcher ── */}
            <div className="auth-tabs">
              <button
                className={`auth-tab${tab === 'login' ? ' auth-tab-active' : ''}`}
                onClick={() => switchTab('login')}
                type="button"
              >
                Sign in
              </button>
              <button
                className={`auth-tab${tab === 'signup' ? ' auth-tab-active' : ''}`}
                onClick={() => switchTab('signup')}
                type="button"
              >
                Create account
              </button>
            </div>

            {/* ── Error banner ── */}
            {error && (
              <div className="alert alert-error" style={{ marginBottom: 16 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* ══════════════ LOGIN TAB ══════════════ */}
            {tab === 'login' && (
              <>
                {/* Quick-access cards */}
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--color-text-muted)', marginBottom: 10 }}>
                  Quick access
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                  {DEMO_ACCOUNTS.map(acc => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => fillDemo(acc)}
                      className="login-quick-card"
                      style={{
                        borderColor: lEmail === acc.email ? acc.color : undefined,
                        background:  lEmail === acc.email ? acc.bg   : undefined,
                      }}
                    >
                      <div className="login-quick-card-top">
                        <span className="login-quick-icon" style={{ background: acc.bg, color: acc.color }}>{acc.icon}</span>
                        <span className="login-quick-label" style={{ color: acc.color }}>{acc.label}</span>
                      </div>
                      <p className="login-quick-desc">{acc.desc}</p>
                      <div className="login-quick-email">{acc.email}</div>
                      <div className="login-quick-fill">Fill credentials <ArrowIcon /></div>
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                  <span style={{ fontSize: 11.5, color: 'var(--color-text-muted)', fontWeight: 500 }}>or enter manually</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                </div>

                <form onSubmit={handleLogin} noValidate>
                  <div className="form-group">
                    {/* Lockout banner */}
                    {lockedUntil > Date.now() && (
                      <div className="alert" style={{ background: 'var(--color-error-bg)', border: '1px solid var(--color-error)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <div>
                          <div style={{ fontWeight: 700, marginBottom: 2 }}>Account temporarily locked</div>
                          <div style={{ fontSize: 12 }}>Too many failed attempts. Try again in <strong>{countdown}</strong>.</div>
                        </div>
                      </div>
                    )}

                    {/* Attempt counter warning */}
                    {attempts > 0 && attempts < MAX_ATTEMPTS && lockedUntil <= Date.now() && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--color-warning-bg)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-md)', fontSize: 12 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
                          {attempts}/{MAX_ATTEMPTS} failed attempts — {MAX_ATTEMPTS - attempts} left before 2 min lockout
                        </span>
                      </div>
                    )}

                    <div className="form-field">
                      <label htmlFor="l-email" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: 'var(--color-text-muted)', display: 'flex' }}><UserIcon /></span>
                        Email address
                      </label>
                      <input id="l-email" type="email" className="form-input"
                        placeholder="you@playdex.io" value={lEmail}
                        onChange={e => setLEmail(e.target.value)}
                        autoComplete="email" disabled={loading || lockedUntil > Date.now()} required />
                    </div>

                    <PasswordField
                      id="l-password" label="Password"
                      value={lPassword} onChange={setLPassword}
                      autoComplete="current-password" disabled={loading || lockedUntil > Date.now()}
                    />

                    <button type="submit" className="btn btn-primary login-submit-btn"
                      disabled={loading || lockedUntil > Date.now()}>
                      {loading
                        ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Signing in…</>
                        : lockedUntil > Date.now()
                        ? <>🔒 Locked — {countdown}</>
                        : <>Sign in <ArrowIcon /></>
                      }
                    </button>
                  </div>
                </form>

                <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--color-text-muted)' }}>
                  Don&apos;t have an account?{' '}
                  <button type="button" onClick={() => switchTab('signup')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 700, fontSize: 13, padding: 0 }}>
                    Create one free
                  </button>
                </p>
              </>
            )}

            {/* ══════════════ SIGNUP TAB ══════════════ */}
            {tab === 'signup' && (
              <>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 18, lineHeight: 1.55 }}>
                  Free account for booking sports slots. Admins are created by the superadmin only.
                </p>

                <form onSubmit={handleSignup} noValidate>
                  <div className="form-group">
                    <div className="form-field">
                      <label htmlFor="s-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: 'var(--color-text-muted)', display: 'flex' }}><NameIcon /></span>
                        Full name *
                      </label>
                      <input id="s-name" type="text" className="form-input"
                        placeholder="Your full name" value={sName}
                        onChange={e => setSName(e.target.value)}
                        autoComplete="name" disabled={loading} required />
                    </div>

                    <div className="form-field">
                      <label htmlFor="s-email" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: 'var(--color-text-muted)', display: 'flex' }}><UserIcon /></span>
                        Email address *
                      </label>
                      <input id="s-email" type="email" className="form-input"
                        placeholder="you@example.com" value={sEmail}
                        onChange={e => setSEmail(e.target.value)}
                        autoComplete="email" disabled={loading} required />
                    </div>

                    <PasswordField
                      id="s-password" label="Password * (min 6 characters)"
                      value={sPassword} onChange={setSPassword}
                      autoComplete="new-password" disabled={loading}
                      placeholder="At least 6 characters"
                    />

                    <PasswordField
                      id="s-confirm" label="Confirm password *"
                      value={sConfirm} onChange={setSConfirm}
                      autoComplete="new-password" disabled={loading}
                      placeholder="Repeat your password"
                    />

                    {/* Password strength */}
                    {sPassword.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--color-border)', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 2,
                            width: sPassword.length >= 12 ? '100%' : sPassword.length >= 6 ? '60%' : '30%',
                            background: sPassword.length >= 12 ? 'var(--color-success)' : sPassword.length >= 6 ? 'var(--color-warning)' : 'var(--color-error)',
                            transition: 'width .3s ease',
                          }} />
                        </div>
                        <span style={{ fontSize: 11, color: sPassword.length >= 6 ? 'var(--color-success)' : 'var(--color-warning)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {sPassword.length >= 12 ? 'Strong' : sPassword.length >= 6 ? 'Good' : `${6 - sPassword.length} more chars`}
                        </span>
                      </div>
                    )}

                    {/* Match indicator */}
                    {sConfirm.length > 0 && (
                      <div style={{ fontSize: 12, color: sPassword === sConfirm ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600 }}>
                        {sPassword === sConfirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                      </div>
                    )}

                    <button type="submit" className="btn btn-primary login-submit-btn" disabled={loading}>
                      {loading
                        ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Creating account…</>
                        : <>Create account <ArrowIcon /></>
                      }
                    </button>
                  </div>
                </form>

                <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--color-text-muted)' }}>
                  Already have an account?{' '}
                  <button type="button" onClick={() => switchTab('login')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 700, fontSize: 13, padding: 0 }}>
                    Sign in
                  </button>
                </p>
              </>
            )}

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Link href="/arenas" style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                Browse venues without signing in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
