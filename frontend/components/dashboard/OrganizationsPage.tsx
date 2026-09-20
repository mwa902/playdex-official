'use client';

import { useState } from 'react';
import { useData } from '@/hooks/useData';
import { useToast } from '@/hooks/useToast';
import { api, ApiError, type CreateOrganizationDto } from '@/lib/api-client';
import { StateView } from '@/components/ui/StateView';
import { ToastStack } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';

function CreateOrgModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<Partial<CreateOrganizationDto>>({});
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState<string | null>(null);
  const set = (k: keyof CreateOrganizationDto, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const reset = () => { setForm({}); setErr(null); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_name || !form.phone_no) { setErr('Company name and phone are required.'); return; }
    setSaving(true); setErr(null);
    try {
      await api.createOrganization(form as CreateOrganizationDto);
      reset(); onCreated();
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Failed to create organisation.');
    } finally { setSaving(false); }
  };

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title="Add Organisation"
      footer={
        <>
          <button className="btn btn-secondary" onClick={() => { reset(); onClose(); }} disabled={saving}>Cancel</button>
          <button form="create-org-form" type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><span className="spinner" />Saving…</> : 'Add Organisation'}
          </button>
        </>
      }
    >
      <form id="create-org-form" onSubmit={submit}>
        <div className="form-group">
          {err && <div className="alert alert-error"><span>✕</span><span>{err}</span></div>}
          <div className="form-field">
            <label>Company name *</label>
            <input className="form-input" value={form.company_name ?? ''} onChange={(e) => set('company_name', e.target.value)} placeholder="e.g. Lahore Sports Club" required />
          </div>
          <div className="form-field">
            <label>Phone *</label>
            <input type="tel" className="form-input" value={form.phone_no ?? ''} onChange={(e) => set('phone_no', e.target.value)} placeholder="+92 300 0000000" required />
          </div>
          <div className="form-field">
            <label>Description</label>
            <textarea className="form-textarea" value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} placeholder="Optional description" />
          </div>
        </div>
      </form>
    </Modal>
  );
}

export function OrganizationsPage() {
  const { toasts, push, dismiss } = useToast();
  const result  = useData(() => api.listOrganizations());
  const [showModal, setModal]   = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this organisation? Linked venues and events may be affected.')) return;
    setDeleting(id);
    try {
      await api.deleteOrganization(id);
      push('success', 'Organisation deleted.');
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
          <p className="page-eyebrow">Managing Bodies</p>
          <h1>Organisations</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Organisation
        </button>
      </div>

      <StateView
        state={result.state}
        error={result.error}
        retry={result.reload}
        emptyIcon="🏢"
        emptyTitle="No organisations yet"
        emptyBody="Add your first organisation — you'll need one before creating venues or events."
      >
        <div className="card-grid">
          {result.data?.map((o) => (
            <div key={o.id} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 26, lineHeight: 1 }}>🏢</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{o.company_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{o.phone_no}</div>
                    </div>
                  </div>
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    style={{ color: 'var(--color-error)', flexShrink: 0 }}
                    onClick={() => handleDelete(o.id)}
                    disabled={deleting === o.id}
                    title="Delete"
                  >
                    {deleting === o.id
                      ? <span className="spinner spinner-primary" style={{ width: 14, height: 14 }} />
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>}
                  </button>
                </div>
                {o.description && (
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>{o.description}</p>
                )}
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  Added {new Date(o.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </StateView>

      <CreateOrgModal
        open={showModal}
        onClose={() => setModal(false)}
        onCreated={() => { setModal(false); result.reload(); push('success', 'Organisation created!'); }}
      />
    </div>
  );
}
