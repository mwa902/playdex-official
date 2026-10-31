'use client';

import { useState } from 'react';
import { useData } from '@/hooks/useData';
import { api, type BookingRecord } from '@/lib/api-client';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';

type BookingFilter = 'All' | BookingRecord['status'];

const filters: BookingFilter[] = ['All', 'Pending', 'Confirm Booking', 'Cancelled'];

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function AdminBookingsPage() {
  const bookings = useData(() => api.listBookings());
  const events = useData(() => api.listEvents());
  const venues = useData(() => api.listVenues());
  const [filter, setFilter] = useState<BookingFilter>('All');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<BookingRecord | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bookingRows = bookings.data ?? [];
  const visibleBookings = bookingRows.filter(booking => {
    const matchesStatus = filter === 'All' || booking.status === filter;
    const searchText = `${booking.customer_name} ${booking.customer_email} ${booking.customer_phone} ${booking.id}`.toLowerCase();
    return matchesStatus && searchText.includes(query.trim().toLowerCase());
  });

  const changeStatus = async (booking: BookingRecord, status: BookingRecord['status']) => {
    if (status === 'Cancelled' && !window.confirm(`Cancel booking for ${booking.customer_name}?`)) return;
    setBusyId(booking.id);
    setError(null);
    try {
      const updated = await api.updateBooking(booking.id, { status });
      bookings.reload();
      setSelected(current => current?.id === updated.id ? { ...current, status: updated.status } : current);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not update booking.');
    } finally {
      setBusyId(null);
    }
  };

  const openDetails = async (booking: BookingRecord) => {
    setSelected(booking);
    setDetailLoading(true);
    setError(null);
    try {
      const detail = await api.getBooking(booking.id);
      setSelected(current => current?.id === detail.id ? detail : current);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load booking details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const selectedEvent = selected ? events.data?.find(event => event.id === selected.event_id) : undefined;
  const selectedVenue = selectedEvent ? venues.data?.find(venue => venue.id === selectedEvent.venue_id) : undefined;
  const total = selected && selectedEvent?.price != null
    ? `PKR ${(selectedEvent.price * selected.seats).toLocaleString()}`
    : selectedEvent ? 'Free' : '—';

  return (
    <div className="page-grid admin-bookings-page">
      <header className="admin-bookings-heading">
        <div>
          <p className="page-eyebrow">Playdex · Operations</p>
          <h1>Booking desk</h1>
        </div>
        <div className="admin-bookings-total">
          <span>{bookingRows.length}</span>
          <small>Total bookings</small>
        </div>
      </header>

      <section className="admin-bookings-summary" aria-label="Booking totals">
        {filters.slice(1).map((status, index) => (
          <button key={status} className={`admin-bookings-summary-item tone-${index}`} onClick={() => setFilter(status)}>
            <span>{bookingRows.filter(booking => booking.status === status).length}</span>
            <small>{status === 'Confirm Booking' ? 'Confirmed' : status}</small>
          </button>
        ))}
      </section>

      <section className="card admin-bookings-card">
        <div className="admin-bookings-toolbar">
          <label className="admin-bookings-search">
            <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
            <input aria-label="Search bookings" className="form-input" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search name, email or reference" />
          </label>
          <div className="admin-bookings-filters" role="group" aria-label="Filter bookings">
            {filters.map(status => (
              <button key={status} className={filter === status ? 'active' : ''} onClick={() => setFilter(status)}>
                {status === 'Confirm Booking' ? 'Confirmed' : status}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="alert alert-error" role="alert">{error}</div>}
        {bookings.state === 'loading' && <div className="admin-bookings-state">Loading bookings…</div>}
        {bookings.state === 'error' && <div className="admin-bookings-state" role="alert">{bookings.error}</div>}
        {bookings.state !== 'loading' && bookings.state !== 'error' && visibleBookings.length === 0 && (
          <div className="admin-bookings-state">No bookings match this view.</div>
        )}

        {visibleBookings.length > 0 && (
          <div className="admin-bookings-table-wrap">
            <table className="table admin-bookings-table">
              <thead>
                <tr><th>Customer</th><th>Booking</th><th>Payment</th><th>Status</th><th aria-label="Actions" /></tr>
              </thead>
              <tbody>
                {visibleBookings.map(booking => (
                  <tr key={booking.id}>
                    <td>
                      <strong>{booking.customer_name}</strong>
                      <small>{booking.customer_email}</small>
                    </td>
                    <td>
                      <strong>{booking.seats} seat{booking.seats !== 1 ? 's' : ''}</strong>
                      <small>{formatDate(booking.booked_at)}</small>
                    </td>
                    <td>
                      <strong>{booking.payment_method ?? 'Not recorded'}</strong>
                      <small>{booking.payment_slip ? 'Proof attached' : 'No proof attached'}</small>
                    </td>
                    <td><StatusBadge value={booking.status} /></td>
                    <td>
                      <div className="admin-bookings-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => openDetails(booking)}>Details</button>
                        {booking.status === 'Pending' && (
                          <button className="btn btn-primary btn-sm" onClick={() => changeStatus(booking, 'Confirm Booking')} disabled={busyId === booking.id}>
                            {busyId === booking.id ? 'Saving…' : 'Confirm'}
                          </button>
                        )}
                        {booking.status !== 'Cancelled' && (
                          <button className="btn btn-danger btn-sm" onClick={() => changeStatus(booking, 'Cancelled')} disabled={busyId === booking.id}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Booking details" size="lg"
        footer={<button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>}>
        {selected && (
          <div className="admin-booking-detail">
            <div className="admin-booking-detail-head">
              <div>
                <small>REFERENCE</small>
                <strong>{selected.id.slice(0, 8).toUpperCase()}</strong>
              </div>
              <StatusBadge value={selected.status} />
            </div>
            <div className="admin-booking-detail-grid">
              <div><small>Customer</small><strong>{selected.customer_name}</strong></div>
              <div><small>Phone</small><strong>{selected.customer_phone}</strong></div>
              <div><small>Email</small><strong>{selected.customer_email}</strong></div>
              <div><small>Booked</small><strong>{formatDate(selected.booked_at)}</strong></div>
              <div><small>Event</small><strong>{selectedEvent?.name ?? 'Event unavailable'}</strong></div>
              <div><small>Venue</small><strong>{selectedVenue?.name ?? 'Venue unavailable'}</strong></div>
              <div><small>Session</small><strong>{selectedEvent ? formatDate(selectedEvent.started_at) : '—'}</strong></div>
              <div><small>Seats · Total</small><strong>{selected.seats} · {total}</strong></div>
              <div><small>Payment method</small><strong>{selected.payment_method ?? 'Not recorded'}</strong></div>
            </div>
            <section className="admin-booking-proof">
              <div>
                <small>PAYMENT SLIP</small>
                <strong>{selected.payment_slip ? 'Payment proof attached' : 'No payment proof uploaded'}</strong>
              </div>
              {detailLoading && <p className="admin-bookings-state">Loading payment details…</p>}
              {!detailLoading && selected.payment_slip && (
                <a href={selected.payment_slip} target="_blank" rel="noreferrer" className="admin-booking-proof-link">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selected.payment_slip} alt={`Payment proof for booking ${selected.id.slice(0, 8)}`} />
                  <span>Open full image</span>
                </a>
              )}
            </section>
            {selected.status === 'Pending' && (
              <button className="btn btn-primary" onClick={() => changeStatus(selected, 'Confirm Booking')} disabled={busyId === selected.id}>
                {busyId === selected.id ? 'Saving…' : 'Confirm booking'}
              </button>
            )}
            {selected.status !== 'Cancelled' && (
              <button className="btn btn-danger" style={{ marginLeft: 8 }} onClick={() => changeStatus(selected, 'Cancelled')} disabled={busyId === selected.id}>
                Cancel booking
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}