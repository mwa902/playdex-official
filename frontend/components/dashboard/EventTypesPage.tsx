'use client';

import { useState } from 'react';
import { useData } from '@/hooks/useData';
import { useToast } from '@/hooks/useToast';
import { api, ApiError } from '@/lib/api-client';
import { StateView } from '@/components/ui/StateView';
import { ToastStack } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';

function CreateEventTypeModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState<string | null>(null);
  const reset = () => { setForm({ name: '', description: '' }); setErr(null); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { setErr('Name is required.'); return; }
    setSaving(true); setErr(null);
    try {
      await api.createEventType({ name: form.name, description: form.description || undefined });
      reset(); onCreated();
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Failed to create event type.');
    } finally { setSaving(false); }
  };

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title="Create Event Type"
      size="sm"
      footer={
        <>
          <button className="btn btn-secondary" onClick={() => { reset(); onClose(); }} disabled={saving}>Cancel</button>
          <button form="create-event-type-form" type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><span className="spinner" />Creating…</> : 'Create'}
          </button>
        </>
      }
    >
      <form id="create-event-type-form" onSubmit={submit}>
        <div className="form-group">
          {err && <div className="alert alert-error"><span>✕</span><span>{err}</span></div>}
          <div className="form-field">
            <label>Type name *</label>
            <input
              className="form-input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Football, Cricket, Tennis"
              required
            />
          </div>
          <div className="form-field">
            <label>Description</label>
            <textarea
              className="form-textarea"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Optional description"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}

export function EventTypesPage() {
  const { toasts, push, dismiss } = useToast();
  const result = useData(() => api.listEventTypes());
  const [showModal, setModal]   = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event type? Any events using it may be affected.')) return;
    setDeleting(id);
    try {
      await api.deleteEventType(id);
      push('success', 'Event type deleted.');
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
          <p className="page-eyebrow">Super Admin · Configuration</p>
          <h1>Event Types</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Event Type
        </button>
      </div>

      <div className="alert alert-info" style={{ fontSize: 13 }}>
        <span>ℹ</span>
        <span>Event types categorise your events (e.g. Football, Cricket, Tennis). They must exist before you can create an event.</span>
      </div>

      <div className="card">
        <StateView
          state={result.state}
          error={result.error}
          retry={result.reload}
          emptyIcon="🏷️"
          emptyTitle="No event types yet"
          emptyBody="Create at least one event type to start scheduling events."
        >
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {result.data?.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>🏷️</span>
                        <span style={{ fontWeight: 600 }}>{t.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
                      {t.description || <span style={{ opacity: .5 }}>—</span>}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        style={{ color: 'var(--color-error)' }}
                        onClick={() => handleDelete(t.id)}
                        disabled={deleting === t.id}
                        title="Delete"
                      >
                        {deleting === t.id
                          ? <span className="spinner spinner-primary" style={{ width: 14, height: 14 }} />
                          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </StateView>
      </div>

      <CreateEventTypeModal
        open={showModal}
        onClose={() => setModal(false)}
        onCreated={() => { setModal(false); result.reload(); push('success', 'Event type created!'); }}
      />
    </div>
  );
}
