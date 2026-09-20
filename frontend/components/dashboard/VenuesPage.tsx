'use client';

import { useState } from 'react';
import { useData } from '@/hooks/useData';
import { useToast } from '@/hooks/useToast';
import { api, ApiError, type CreateVenueDto, type OrganizationRecord } from '@/lib/api-client';
import { StateView } from '@/components/ui/StateView';
import { ToastStack } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';

function CreateVenueModal({
  open, onClose, onCreated, orgs,
}: {
  open: boolean; onClose: () => void; onCreated: () => void; orgs: OrganizationRecord[];
}) {
  const [form, setForm] = useState<Partial<CreateVenueDto>>({ city: 'Lahore', capacity: 100 });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState<string | null>(null);
  const set = (k: keyof CreateVenueDto, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const reset = () => { setForm({ city: 'Lahore', capacity: 100 }); setErr(null); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.organization_id || !form.name || !form.address || !form.capacity) {
      setErr('Organisation, name, address and capacity are required.'); return;
    }
    setSaving(true); setErr(null);
    try {
      await api.createVenue(form as CreateVenueDto);
      reset(); onCreated();
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Failed to create venue.');
    } finally { setSaving(false); }
  };

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title="Add Venue"
      footer={
        <>
          <button className="btn btn-secondary" onClick={() => { reset(); onClose(); }} disabled={saving}>Cancel</button>
          <button form="create-venue-form" type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><span className="spinner" />Saving…</> : 'Add Venue'}
          </button>
        </>
      }
    >
      <form id="create-venue-form" onSubmit={submit}>
        <div className="form-group">
          {err && <div className="alert alert-error"><span>✕</span><span>{err}</span></div>}
          <div className="form-field">
            <label>Organisation *</label>
            <select className="form-select" value={form.organization_id ?? ''} onChange={(e) => set('organization_id', e.target.value)} required>
              <option value="">— select —</option>
              {orgs.map((o) => <option key={o.id} value={o.id}>{o.company_name}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Venue name *</label>
            <input className="form-input" value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Gulberg Sports Complex" required />
          </div>
          <div className="form-field">
            <label>Address *</label>
            <input className="form-input" value={form.address ?? ''} onChange={(e) => set('address', e.target.value)} placeholder="Full street address" required />
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>City</label>
              <input className="form-input" value={form.city ?? 'Lahore'} onChange={(e) => set('city', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Capacity *</label>
              <input type="number" className="form-input" min={1} value={form.capacity ?? ''} onChange={(e) => set('capacity', Number(e.target.value))} required />
            </div>
          </div>
          <div className="form-field">
            <label>Description</label>
            <textarea className="form-textarea" value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} placeholder="Optional" />
          </div>
        </div>
      </form>
    </Modal>
  );
}

export function VenuesPage() {
  const { toasts, push, dismiss } = useToast();
  const result = useData(() => api.listVenues());
  const orgs   = useData(() => api.listOrganizations());
  const [search, setSearch]     = useState('');
  const [showModal, setModal]   = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = result.data?.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.city.toLowerCase().includes(search.toLowerCase()),
  ) ?? [];

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this venue?')) return;
    setDeleting(id);
    try {
      await api.deleteVenue(id);
      push('success', 'Venue removed.');
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
          <p className="page-eyebrow">Facilities & Courts</p>
          <h1>Venues</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Venue
        </button>
      </div>

      <input
        className="form-input"
        style={{ maxWidth: 320 }}
        placeholder="Search venues…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <StateView
        state={result.state}
        error={result.error}
        retry={result.reload}
        emptyIcon="📍"
        emptyTitle="No venues yet"
        emptyBody="Add your first venue using the button above."
      >
        <div className="card-grid">
          {filtered.map((v) => (
            <div key={v.id} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 26, lineHeight: 1 }}>📍</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{v.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{v.city}</div>
                    </div>
                  </div>
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    style={{ color: 'var(--color-error)', flexShrink: 0 }}
                    onClick={() => handleDelete(v.id)}
                    disabled={deleting === v.id}
                    title="Remove venue"
                  >
                    {deleting === v.id
                      ? <span className="spinner spinner-primary" style={{ width: 14, height: 14 }} />
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>}
                  </button>
                </div>
                {v.description && (
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>{v.description}</p>
                )}
                <div style={{ display: 'grid', gap: 5 }}>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    <strong>Address:</strong> {v.address}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    <strong>Capacity:</strong> {v.capacity}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                    Added {new Date(v.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && search && (
            <p style={{ color: 'var(--color-text-muted)', padding: '12px 0', fontSize: 14 }}>
              No venues match &ldquo;{search}&rdquo;
            </p>
          )}
        </div>
      </StateView>

      {orgs.data && (
        <CreateVenueModal
          open={showModal}
          onClose={() => setModal(false)}
          onCreated={() => { setModal(false); result.reload(); push('success', 'Venue added!'); }}
          orgs={orgs.data}
        />
      )}
    </div>
  );
}
