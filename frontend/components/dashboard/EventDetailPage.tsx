'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useData } from '@/hooks/useData';
import { useToast } from '@/hooks/useToast';
import { api, ApiError, type CreateBookingDto } from '@/lib/api-client';
import { StateView } from '@/components/ui/StateView';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ToastStack } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';

function BookingModal({
  open, onClose, eventId, onCreated,
}: {
  open: boolean; onClose: () => void; eventId: string; onCreated: () => void;
}) {
  const [form, setForm] = useState<Partial<CreateBookingDto>>({ event_id: eventId, seats: 1, status: 'Pending' });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState<string | null>(null);
  const set = (k: keyof CreateBookingDto, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name || !form.customer_email || !form.customer_phone) {
      setErr('Name, email, and phone are required.'); return;
    }
    if (!form.seats || form.seats < 1) { setErr('Seats must be at least 1.'); return; }
    setSaving(true); setErr(null);
    try {
      await api.createBooking(form as CreateBookingDto);
      setForm({ event_id: eventId, seats: 1, status: 'Pending' });
      onCreated();
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Booking failed.');
    } finally { setSaving(false); }
  };

  return (
    <Modal
      open={open}
      onClose={() => { setErr(null); onClose(); }}
      title="Book this Event"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button form="booking-form" type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><span className="spinner" />Booking…</> : 'Confirm Booking'}
          </button>
        </>
      }
    >
      <form id="booking-form" onSubmit={submit}>
        <div className="form-group">
          {err && <div className="alert alert-error"><span>✕</span><span>{err}</span></div>}
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

export function EventDetailPage({ id }: { id: string }) {
  const { toasts, push, dismiss } = useToast();
  const event    = useData(() => api.getEvent(id), [id]);
  const bookings = useData(() => api.listBookings());
  const venues   = useData(() => api.listVenues());
  const [bookingModal, setBookingModal] = useState(false);

  const eventBookings = bookings.data?.filter((b) => b.event_id === id) ?? [];
  const venue = venues.data?.find((v) => v.id === event.data?.venue_id);

  return (
    <div className="page-grid">
      <ToastStack toasts={toasts} dismiss={dismiss} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/events" className="btn btn-secondary btn-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Events
        </Link>
      </div>

      <StateView state={event.state} error={event.error} retry={event.reload} emptyTitle="Event not found">
        {event.data && (
          <>
            <div className="page-header">
              <div className="page-header-left">
                <p className="page-eyebrow">Event Detail</p>
                <h1>{event.data.name}</h1>
                {event.data.description && (
                  <p style={{ color: 'var(--color-text-secondary)', marginTop: 6, fontSize: 15 }}>
                    {event.data.description}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <StatusBadge value={event.data.status} />
                <button className="btn btn-primary" onClick={() => setBookingModal(true)}>
                  🎟️ Book this Event
                </button>
              </div>
            </div>

            <div className="two-col">
              {/* Event brief */}
              <div className="card">
                <div className="card-header"><h3 style={{ fontSize: 15, fontWeight: 700 }}>Event Details</h3></div>
                <div className="card-body">
                  <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                    {[
                      { label: 'Venue',    value: venue?.name ?? event.data.venue_id },
                      { label: 'City',     value: venue?.city ?? '—' },
                      { label: 'Capacity', value: `${event.data.capacity} seats` },
                      { label: 'Status',   value: <StatusBadge value={event.data.status} /> },
                      { label: 'Starts',   value: new Date(event.data.started_at).toLocaleString() },
                      { label: 'Ends',     value: new Date(event.data.ended_at).toLocaleString() },
                      { label: 'Created',  value: new Date(event.data.created_at).toLocaleDateString() },
                      { label: 'Updated',  value: new Date(event.data.updated_at).toLocaleDateString() },
                    ].map((row) => (
                      <div key={row.label}>
                        <dt style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                          {row.label}
                        </dt>
                        <dd style={{ fontWeight: 600, fontSize: 14 }}>{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              {/* Booking queue */}
              <div className="card">
                <div className="card-header" style={{ marginBottom: 0 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>Booking Queue</h3>
                  <span className="badge badge-info">{eventBookings.length} booking{eventBookings.length !== 1 ? 's' : ''}</span>
                </div>
                <StateView
                  state={bookings.state}
                  error={bookings.error}
                  retry={bookings.reload}
                  emptyIcon="🎟️"
                  emptyTitle="No bookings yet"
                  emptyBody="Book this event using the button above."
                >
                  <div>
                    {eventBookings.length === 0 ? (
                      <div className="empty-state" style={{ padding: '24px 16px' }}>
                        <span style={{ fontSize: 36 }}>🎟️</span>
                        <p className="empty-title">No bookings for this event</p>
                      </div>
                    ) : (
                      eventBookings.map((b) => (
                        <div key={b.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          padding: '12px 24px',
                          borderBottom: '1px solid var(--color-border)',
                          gap: 12,
                        }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{b.customer_name}</div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                              {b.customer_email} · {b.seats} seat{b.seats !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <StatusBadge value={b.status} />
                        </div>
                      ))
                    )}
                  </div>
                </StateView>
              </div>
            </div>
          </>
        )}
      </StateView>

      <BookingModal
        open={bookingModal}
        onClose={() => setBookingModal(false)}
        eventId={id}
        onCreated={() => { setBookingModal(false); bookings.reload(); push('success', 'Booking confirmed!'); }}
      />
    </div>
  );
}
