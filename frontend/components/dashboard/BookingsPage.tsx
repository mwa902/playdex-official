'use client';

import { useState } from 'react';
import { useData } from '@/hooks/useData';
import { useToast } from '@/hooks/useToast';
import { api, ApiError, type BookingRecord, type CreateBookingDto, type EventRecord } from '@/lib/api-client';
import { StateView } from '@/components/ui/StateView';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ToastStack } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';

function CreateBookingModal({
  open, onClose, onCreated, events,
}: {
  open: boolean; onClose: () => void; onCreated: () => void; events: EventRecord[];
}) {
  const [form, setForm] = useState<Partial<CreateBookingDto>>({ seats: 1, status: 'Pending' });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState<string | null>(null);
  const set = (k: keyof CreateBookingDto, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const reset = () => { setForm({ seats: 1, status: 'Pending' }); setErr(null); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.event_id || !form.customer_name || !form.customer_email || !form.customer_phone) {
      setErr('All starred fields are required.'); return;
    }
    if (!form.seats || form.seats < 1) { setErr('Seats must be at least 1.'); return; }
    setSaving(true); setErr(null);
    try {
      await api.createBooking(form as CreateBookingDto);
      reset(); onCreated();
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Booking failed.');
    } finally { setSaving(false); }
  };

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title="Create Booking"
      footer={
        <>
          <button className="btn btn-secondary" onClick={() => { reset(); onClose(); }} disabled={saving}>Cancel</button>
          <button form="create-booking-form" type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><span className="spinner" />Creating…</> : 'Create Booking'}
          </button>
        </>
      }
    >
      <form id="create-booking-form" onSubmit={submit}>
        <div className="form-group">
          {err && <div className="alert alert-error"><span>✕</span><span>{err}</span></div>}
          <div className="form-field">
            <label>Event *</label>
            <select className="form-select" value={form.event_id ?? ''} onChange={(e) => set('event_id', e.target.value)} required>
              <option value="">— select event —</option>
              {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Customer name *</label>
            <input className="form-input" value={form.customer_name ?? ''} onChange={(e) => set('customer_name', e.target.value)} placeholder="Full name" required />
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Email *</label>
              <input type="email" className="form-input" value={form.customer_email ?? ''} onChange={(e) => set('customer_email', e.target.value)} required />
            </div>
            <div className="form-field">
              <label>Phone *</label>
              <input type="tel" className="form-input" value={form.customer_phone ?? ''} onChange={(e) => set('customer_phone', e.target.value)} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Seats *</label>
              <input type="number" className="form-input" min={1} value={form.seats ?? 1} onChange={(e) => set('seats', Number(e.target.value))} required />
            </div>
            <div className="form-field">
              <label>Status</label>
              <select className="form-select" value={form.status ?? 'Pending'} onChange={(e) => set('status', e.target.value)}>
                <option value="Pending">Pending</option>
                <option value="Confirm Booking">Confirm Booking</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function UpdateStatusModal({
  booking, open, onClose, onUpdated,
}: {
  booking: BookingRecord; open: boolean; onClose: () => void; onUpdated: () => void;
}) {
  const [status, setStatus] = useState<BookingRecord['status']>(booking.status);
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr(null);
    try {
      await api.updateBooking(booking.id, { status });
      onUpdated();
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Update failed.');
    } finally { setSaving(false); }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Update Booking Status"
      size="sm"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button form="update-status-form" type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><span className="spinner" />Saving…</> : 'Save'}
          </button>
        </>
      }
    >
      <form id="update-status-form" onSubmit={submit}>
        <div className="form-group">
          {err && <div className="alert alert-error"><span>✕</span><span>{err}</span></div>}
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              Updating booking for <strong>{booking.customer_name}</strong>
            </p>
          </div>
          <div className="form-field">
            <label>New status</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value as BookingRecord['status'])}>
              <option value="Pending">Pending</option>
              <option value="Confirm Booking">Confirm Booking</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export function BookingsPage() {
  const { toasts, push, dismiss } = useToast();
  const result = useData(() => api.listBookings());
  const events = useData(() => api.listEvents());

  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing]       = useState<BookingRecord | null>(null);
  const [deleting, setDeleting]     = useState<string | null>(null);

  const filtered = result.data?.filter((b) => {
    const matchSearch = b.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      b.customer_email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  }) ?? [];

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this booking?')) return;
    setDeleting(id);
    try {
      await api.deleteBooking(id);
      push('success', 'Booking deleted.');
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
          <p className="page-eyebrow">Participant Pipeline</p>
          <h1>Bookings</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Booking
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input
          className="form-input"
          style={{ flex: '1 1 260px', maxWidth: 340 }}
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          style={{ flex: '0 0 200px' }}
          value={statusFilter}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirm Booking">Confirm Booking</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        {result.data && (
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)', alignSelf: 'center' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="card">
        <StateView
          state={result.state}
          error={result.error}
          retry={result.reload}
          emptyIcon="🎟️"
          emptyTitle="No bookings yet"
          emptyBody="Create the first booking using the button above."
        >
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Seats</th>
                  <th>Booked At</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div className="avatar" style={{ width: 28, height: 28, fontSize: 11, flexShrink: 0 }}>
                          {b.customer_name.slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600 }}>{b.customer_name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{b.customer_email}</td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{b.customer_phone}</td>
                    <td><strong>{b.seats}</strong></td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(b.booked_at).toLocaleString()}
                    </td>
                    <td><StatusBadge value={b.status} /></td>
                    <td>
                      <div className="actions">
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => setEditing(b)}
                          title="Update status"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          style={{ color: 'var(--color-error)' }}
                          onClick={() => handleDelete(b.id)}
                          disabled={deleting === b.id}
                          title="Delete"
                        >
                          {deleting === b.id
                            ? <span className="spinner spinner-primary" style={{ width: 14, height: 14 }} />
                            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (search || statusFilter !== 'all') && (
              <div className="empty-state" style={{ padding: '28px 24px' }}>
                <p className="empty-title">No bookings match your filters</p>
              </div>
            )}
          </div>
        </StateView>
      </div>

      {events.data && (
        <CreateBookingModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); result.reload(); push('success', 'Booking created.'); }}
          events={events.data}
        />
      )}

      {editing && (
        <UpdateStatusModal
          booking={editing}
          open={!!editing}
          onClose={() => setEditing(null)}
          onUpdated={() => { setEditing(null); result.reload(); push('success', 'Status updated.'); }}
        />
      )}
    </div>
  );
}
