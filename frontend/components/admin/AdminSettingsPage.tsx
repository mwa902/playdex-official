'use client';

import { useEffect, useState } from 'react';
import { api, ApiError, type User } from '@/lib/api-client';

const SESSION_KEY = 'playdex_user';

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function PasswordInput({
  id, label, value, onChange, placeholder,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className="form-input"
          style={{ paddingRight: 44 }}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? '••••••••'}
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-text-muted)', display: 'flex', padding: 0,
          }}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          <EyeIcon open={show} />
        </button>
      </div>
    </div>
  );
}

export function AdminSettingsPage() {
  const [user, setUser]     = useState<User | null>(null);
  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState<string | null>(null);

  // Password form
  const [currentPass, setCurrentPass] = useState('');
  const [newPass,     setNewPass]     = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) setUser(JSON.parse(stored) as User);
    } catch { /* noop */ }
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setSaved(false);

    if (!currentPass) { setErr('Enter your current password.'); return; }
    if (newPass.length < 8) { setErr('New password must be at least 8 characters.'); return; }
    if (newPass !== confirmPass) { setErr('New passwords do not match.'); return; }

    setSaving(true);
    try {
      // Re-validate current password first
      await api.loginUser(user?.email ?? '', currentPass);
      // Then update
      await api.updateUser(user!.id, { password: newPass });
      setSaved(true);
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
    } catch (ex) {
      if (ex instanceof ApiError && (ex.status === 401 || ex.status === 403)) {
        setErr('Current password is incorrect.');
      } else {
        setErr(ex instanceof ApiError ? ex.message : 'Failed to update password.');
      }
    } finally { setSaving(false); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '??';

  return (
    <div className="page-grid">

      {/* Page header */}
      <div className="page-header">
        <div className="page-header-left">
          <p className="page-eyebrow">Account</p>
          <h1>Settings</h1>
        </div>
      </div>

      <div className="two-col" style={{ gridTemplateColumns: '1fr 1.4fr' }}>

        {/* ── Profile card ── */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontWeight: 700, fontSize: 15 }}>Profile Details</h3>
          </div>
          <div className="card-body">

            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg, #0f5b78, #1686a4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 800, color: '#fff', flexShrink: 0,
              }}>
                {initials}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--color-text)' }}>{user?.name}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>{user?.role}</div>
              </div>
            </div>

            {/* Details */}
            <dl style={{ display: 'grid', gap: 16 }}>
              {[
                { label: 'Full name',  value: user?.name  ?? '—' },
                { label: 'Email',      value: user?.email ?? '—' },
                { label: 'Role',       value: user?.role  ?? '—' },
                { label: 'Status',     value: user?.is_active ?? 'Active' },
                { label: 'User ID',    value: user?.id ? user.id.slice(0, 18) + '…' : '—' },
              ].map(row => (
                <div key={row.label}>
                  <dt style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                    {row.label}
                  </dt>
                  <dd style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', fontFamily: row.label === 'User ID' ? 'var(--font-mono)' : undefined, wordBreak: 'break-all' }}>
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
              <div className="badge badge-success">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Account active
              </div>
            </div>
          </div>
        </div>

        {/* ── Change password ── */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontWeight: 700, fontSize: 15 }}>Change Password</h3>
          </div>
          <div className="card-body">

            {saved && (
              <div className="alert" style={{ background: 'var(--color-success-bg)', border: '1px solid var(--color-success)', color: 'var(--color-success)', borderRadius: 'var(--radius-md)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, fontSize: 13, fontWeight: 600 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Password updated successfully!
              </div>
            )}

            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                {err && (
                  <div className="alert alert-error">
                    <span>✕</span><span>{err}</span>
                  </div>
                )}

                <PasswordInput
                  id="current-pass"
                  label="Current password *"
                  value={currentPass}
                  onChange={setCurrentPass}
                  placeholder="Your current password"
                />
                <PasswordInput
                  id="new-pass"
                  label="New password *"
                  value={newPass}
                  onChange={setNewPass}
                  placeholder="Min. 8 characters"
                />
                <PasswordInput
                  id="confirm-pass"
                  label="Confirm new password *"
                  value={confirmPass}
                  onChange={setConfirmPass}
                  placeholder="Repeat new password"
                />

                {/* Password strength hint */}
                {newPass.length > 0 && (
                  <div style={{ fontSize: 12, color: newPass.length >= 8 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                    {newPass.length >= 8 ? '✓ Good length' : `${8 - newPass.length} more character${8 - newPass.length !== 1 ? 's' : ''} needed`}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ marginTop: 4 }}
                  disabled={saving}
                >
                  {saving
                    ? <><span className="spinner" style={{ width: 15, height: 15 }} /> Updating…</>
                    : <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        Update Password
                      </>
                  }
                </button>
              </div>
            </form>

            <div className="arenas-info-strip" style={{ marginTop: 20, background: 'var(--color-surface-raised)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ fontSize: 12 }}>After changing your password you'll stay logged in on this device. Other sessions (if any) will need to re-login.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
