'use client';

import { useState } from 'react';
import { useData } from '@/hooks/useData';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/context/AuthContext';
import { api, ApiError, type CreateUserDto, type UserRole } from '@/lib/api-client';
import { StateView } from '@/components/ui/StateView';
import { RoleChip } from '@/components/ui/StatusBadge';
import { ToastStack } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';

/* ── Super admin can create admins. Admins cannot access this page. ── */

function CreateUserModal({ open, onClose, onCreated, isSuperAdmin }: {
  open: boolean; onClose: () => void; onCreated: () => void; isSuperAdmin: boolean;
}) {
  const [form, setForm] = useState<Partial<CreateUserDto>>({ role: 'admin' });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState<string | null>(null);
  const set = (k: keyof CreateUserDto, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const reset = () => { setForm({ role: 'admin' }); setErr(null); };

  // Available roles depends on who is creating
  const availableRoles: { value: UserRole; label: string }[] = isSuperAdmin
    ? [
        { value: 'admin',              label: 'Admin' },
        { value: 'user',               label: 'User' },
        { value: 'Event Organization', label: 'Event Organization' },
      ]
    : [{ value: 'user', label: 'User' }];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setErr('Name, email and password are required.'); return; }
    if (form.password.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    setSaving(true); setErr(null);
    try {
      await api.createUser(form as CreateUserDto);
      reset(); onCreated();
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Failed to create user.');
    } finally { setSaving(false); }
  };

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title={isSuperAdmin ? 'Create Admin or User' : 'Create User'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={() => { reset(); onClose(); }} disabled={saving}>Cancel</button>
          <button form="create-user-form" type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><span className="spinner" />Creating…</> : 'Create'}
          </button>
        </>
      }
    >
      <form id="create-user-form" onSubmit={submit}>
        <div className="form-group">
          {err && <div className="alert alert-error"><span>✕</span><span>{err}</span></div>}

          {isSuperAdmin && (
            <div className="alert alert-info" style={{ fontSize: 13 }}>
              <span>ℹ</span>
              <span>As Super Admin, you can create <strong>admin</strong> accounts that can manage all operations.</span>
            </div>
          )}

          <div className="form-field">
            <label>Full name *</label>
            <input className="form-input" value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} placeholder="Jane Smith" required />
          </div>
          <div className="form-field">
            <label>Email *</label>
            <input type="email" className="form-input" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} placeholder="jane@playdex.io" required />
          </div>
          <div className="form-field">
            <label>Password *</label>
            <input type="password" className="form-input" value={form.password ?? ''} onChange={(e) => set('password', e.target.value)} placeholder="Min. 6 characters" required />
          </div>
          <div className="form-field">
            <label>Role</label>
            <select className="form-select" value={form.role ?? 'admin'} onChange={(e) => set('role', e.target.value)}>
              {availableRoles.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export function UsersPage() {
  const { isSuperAdmin } = useAuth();
  const { toasts, push, dismiss } = useToast();
  const result = useData(() => api.listUsers());
  const [showModal, setModal]   = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRole]   = useState('all');

  const filtered = result.data?.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  }) ?? [];

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.deleteUser(id);
      push('success', 'User deleted.');
      result.reload();
    } catch (ex) {
      push('error', ex instanceof ApiError ? ex.message : 'Delete failed.');
    } finally { setDeleting(null); }
  };

  return (
    <div className="page-grid">
      <ToastStack toasts={toasts} dismiss={dismiss} />

      <div className="page-header">
        <div className="page-header-left">
          <p className="page-eyebrow">Access Management</p>
          <h1>Users &amp; Admins</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {isSuperAdmin ? 'Create Admin / User' : 'Create User'}
        </button>
      </div>

      {/* Superadmin notice */}
      {isSuperAdmin && (
        <div className="alert alert-info" style={{ fontSize: 13 }}>
          <span>🔐</span>
          <div>
            <strong>Super Admin Access</strong> — You are the only user who can create admin accounts.
            Admins can manage all operations but cannot access this Users &amp; Admins page.
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input
          className="form-input"
          style={{ flex: '1 1 240px', maxWidth: 320 }}
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          style={{ flex: '0 0 180px' }}
          value={roleFilter}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="all">All roles</option>
          <option value="superadmin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="Event Organization">Event Organization</option>
        </select>
      </div>

      <div className="card">
        <StateView
          state={result.state}
          error={result.error}
          retry={result.reload}
          emptyIcon="👥"
          emptyTitle="No users yet"
          emptyBody="Create users and admins using the button above."
        >
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>{u.email}</td>
                    <td><RoleChip role={u.role} /></td>
                    <td>
                      <span className={`badge ${u.is_active === 'Not-Active' ? 'badge-error' : 'badge-success'}`}>
                        {u.is_active ?? 'Active'}
                      </span>
                    </td>
                    <td>
                      {/* Only superadmin can delete; can't delete themselves */}
                      {isSuperAdmin && u.role !== 'superadmin' && (
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          style={{ color: 'var(--color-error)' }}
                          onClick={() => handleDelete(String(u.id))}
                          disabled={deleting === String(u.id)}
                          title="Delete user"
                        >
                          {deleting === String(u.id)
                            ? <span className="spinner spinner-primary" style={{ width: 14, height: 14 }} />
                            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (search || roleFilter !== 'all') && (
              <div className="empty-state" style={{ padding: '24px' }}>
                <p className="empty-title">No users match your filters</p>
              </div>
            )}
          </div>
        </StateView>
      </div>

      <CreateUserModal
        open={showModal}
        onClose={() => setModal(false)}
        onCreated={() => { setModal(false); result.reload(); push('success', 'User created.'); }}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}
