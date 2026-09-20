'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useData } from '@/hooks/useData';
import { useToast } from '@/hooks/useToast';
import { api, ApiError, type CreateEventDto, type OrganizationRecord, type VenueRecord, type EventTypeRecord } from '@/lib/api-client';
import { StateView } from '@/components/ui/StateView';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ToastStack } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';

function CreateEventModal({
  open, onClose, onCreated, orgs, venues, eventTypes,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  orgs: OrganizationRecord[];
  venues: VenueRecord[];
  eventTypes: EventTypeRecord[];
}) {
  const [form, setForm] = useState<Partial<CreateEventDto>>({ status: 'Available', capacity: 10 });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState<string | null>(null);
  const set = (k: keyof CreateEventDto, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const reset = () => { setForm({ status: 'Available', capacity: 10 }); setErr(null); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.organization_id || !form.venue_id || !form.event_type_id || !form.name || !form.started_at || !form.ended_at) {
      setErr('Please fill in all required fields.'); return;
    }
    if (new Date(form.ended_at!) <= new Date(form.started_at!)) {
      setErr('End time must be after start time.'); return;
    }
    setSaving(true); setErr(null);
    try {
      await api.createEvent(form as CreateEventDto);
      reset(); onCreated();
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Failed to create event.');
    } finally { setSaving(false); }
  };

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title="Create Event"
      size="lg"
      footer={
        <>
          <button className="btn btn-secondary" onClick={() => { reset(); onClose(); }} disabled={saving}>Cancel</button>
          <button form="create-event-form" type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><span className="spinner" />Creating…</> : 'Create Event'}
          </button>
        </>
      }
    >
      <form id="create-event-form" onSubmit={submit}>
        <div className="form-group">
          {err && <div className="alert alert-error"><span>✕</span><span>{err}</span></div>}

          <div className="form-field">
            <label>Event name *</label>
            <input className="form-input" value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Summer Football League" required />
          </div>
          <div className="form-field">
            <label>Description</label>
            <textarea className="form-textarea" value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} placeholder="Optional description" />
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Organisation *</label>
              <select className="form-select" value={form.organization_id ?? ''} onChange={(e) => set('organization_id', e.target.value)} required>
                <option value="">— select —</option>
                {orgs.map((o) => <option key={o.id} value={o.id}>{o.company_name}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Venue *</label>
              <select className="form-select" value={form.venue_id ?? ''} onChange={(e) => set('venue_id', e.target.value)} required>
                <option value="">— select —</option>
                {venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Event type *</label>
              <select className="form-select" value={form.event_type_id ?? ''} onChange={(e) => set('event_type_id', e.target.value)} required>
                <option value="">— select —</option>
                {eventTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Capacity *</label>
              <input type="number" className="form-input" min={1} value={form.capacity ?? ''} onChange={(e) => set('capacity', Number(e.target.value))} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Starts at *</label>
              <input type="datetime-local" className="form-input" value={form.started_at ?? ''} onChange={(e) => set('started_at', e.target.value)} required />
            </div>
            <div className="form-field">
              <label>Ends at *</label>
              <input type="datetime-local" className="form-input" value={form.ended_at ?? ''} onChange={(e) => set('ended_at', e.target.value)} required />
            </div>
          </div>
          <div className="form-field">
            <label>Status</label>
            <select className="form-select" value={form.status ?? 'Available'} onChange={(e) => set('status', e.target.value)}>
              <option value="Available">Available</option>
              <option value="Not-Available">Not-Available</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export function EventsPage() {
  const { toasts, push, dismiss } = useToast();
  const result     = useData(() => api.listEvents());
  const orgs       = useData(() => api.listOrganizations());
  const venues     = useData(() => api.listVenues());
  const eventTypes = useData(() => api.listEventTypes());

  const [search, setSearch]     = useState('');
  const [showModal, setModal]   = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = result.data?.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.status.toLowerCase().includes(search.toLowerCase()),
  ) ?? [];

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await api.deleteEvent(id);
      push('success', 'Event deleted.');
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
          <p className="page-eyebrow">Competition calendar</p>
          <h1>Events</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Event
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          className="form-input"
          style={{ maxWidth: 320 }}
          placeholder="Search events…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {result.data && (
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            {filtered.length} of {result.data.length} event{result.data.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="card">
        <StateView
          state={result.state}
          error={result.error}
          retry={result.reload}
          emptyIcon="📅"
          emptyTitle="No events yet"
          emptyBody="Create your first event using the button above."
        >
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Description</th>
                  <th>Capacity</th>
                  <th>Starts</th>
                  <th>Ends</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <Link href={`/events/${e.id}`} style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                        {e.name}
                      </Link>
                    </td>
                    <td style={{ color: 'var(--color-text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.description || '—'}
                    </td>
                    <td>{e.capacity}</td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(e.started_at).toLocaleString()}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(e.ended_at).toLocaleString()}
                    </td>
                    <td><StatusBadge value={e.status} /></td>
                    <td>
                      <div className="actions">
                        <Link href={`/events/${e.id}`} className="btn btn-ghost btn-icon btn-sm" title="View detail">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </Link>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          style={{ color: 'var(--color-error)' }}
                          onClick={() => handleDelete(e.id)}
                          disabled={deleting === e.id}
                          title="Delete"
                        >
                          {deleting === e.id
                            ? <span className="spinner spinner-primary" style={{ width: 14, height: 14 }} />
                            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && search && (
              <div className="empty-state" style={{ padding: '32px 24px' }}>
                <p className="empty-title">No events match &ldquo;{search}&rdquo;</p>
              </div>
            )}
          </div>
        </StateView>
      </div>

      {orgs.data && venues.data && eventTypes.data && (
        <CreateEventModal
          open={showModal}
          onClose={() => setModal(false)}
          onCreated={() => { setModal(false); result.reload(); push('success', 'Event created.'); }}
          orgs={orgs.data}
          venues={venues.data}
          eventTypes={eventTypes.data}
        />
      )}
    </div>
  );
}
