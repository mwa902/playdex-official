'use client';

import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/context/AuthContext';
import {
  api, ApiError,
  type BookingRecord, type CreateBookingDto,
  type EventRecord, type VenueRecord,
} from '@/lib/api-client';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';

// ─── Payment accounts ─────────────────────────────────────────────────────────
const PHONE = '03322024160';
const PAYMENT_METHODS = [
  { id: 'sadapay',   name: 'SadaPay',   color: '#7c3aed', number: PHONE },
  { id: 'nayapay',   name: 'NayaPay',   color: '#0891b2', number: PHONE },
  { id: 'easypaisa', name: 'Easypaisa', color: '#16a34a', number: PHONE },
  { id: 'raast',     name: 'Raast',     color: '#dc2626', number: PHONE },
];

// ─── Admin roles that cannot book ────────────────────────────────────────────
function isAdminRole(role?: string) {
  return role === 'superadmin' || role === 'admin' || role === 'Admin';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(dt: string) {
  return new Date(dt).toLocaleString('en-PK', {
    weekday: 'short', day: 'numeric', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}
function fmtDate(dt: string) {
  return new Date(dt).toLocaleDateString('en-PK', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}
function fmtTime(dt: string) {
  return new Date(dt).toLocaleTimeString('en-PK', {
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Extract sport from slot name ─────────────────────────────────────────────
// "Morning Cricket — Venue Name" → "Cricket"
// "Afternoon Gym Session — Venue" → "Gym Session"
function extractSport(name: string, fallback: string): string {
  const m = name.match(/^(?:Morning|Afternoon|Evening)\s+(.+?)\s*(?:—|-|–)/);
  return m ? m[1].trim() : fallback;
}

// ─── E-Slip ───────────────────────────────────────────────────────────────────
interface ESlipProps {
  booking: BookingRecord;
  event: EventRecord;
  venue: VenueRecord;
  paymentMethod: string;
  screenshotUrl: string | null;
  onClose: () => void;
}
export function ESlip({ booking, event, venue, paymentMethod, screenshotUrl, onClose }: ESlipProps) {
  const slipRef = useRef<HTMLDivElement>(null);
  const sport   = extractSport(event.name, venue.sport_type);
  const total   = event.price != null
    ? `PKR ${(event.price * booking.seats).toLocaleString()}`
    : 'Free';

  const handlePrint = () => {
    if (!slipRef.current) return;
    const win = window.open('', '_blank', 'width=700,height=1100');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Booking Slip — ${booking.id.slice(0, 8).toUpperCase()}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Segoe UI',system-ui,sans-serif; background:#f4f6f8; padding:32px; color:#17212b; }
        .slip { max-width:600px; margin:0 auto; background:#fff; border-radius:14px; box-shadow:0 6px 32px rgba(0,0,0,.12); overflow:hidden; }
        .slip-header { background:linear-gradient(120deg,#0d1f2d,#0f5b78); color:#fff; padding:28px 32px; }
        .slip-header h1 { font-size:22px; font-weight:800; letter-spacing:-.02em; margin-bottom:4px; }
        .slip-header p  { font-size:13px; opacity:.7; }
        .slip-ref-bar   { background:#f8fafc; border-bottom:1px solid #dde3e8; padding:14px 32px; display:flex; align-items:center; justify-content:space-between; }
        .slip-ref-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:#8094a2; }
        .slip-ref-value { font-size:22px; font-weight:900; color:#0f5b78; letter-spacing:.06em; }
        .slip-body      { padding:24px 32px; }
        .slip-section   { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:#8094a2; margin:18px 0 12px; }
        .slip-grid      { display:grid; grid-template-columns:1fr 1fr; gap:14px 28px; }
        .slip-field dt  { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.07em; color:#8094a2; margin-bottom:3px; }
        .slip-field dd  { font-size:14px; font-weight:600; color:#17212b; }
        .slip-divider   { height:1px; background:#dde3e8; margin:18px 0; }
        .slip-price-box { background:#e8f4f8; border:1px solid #b8dce9; border-radius:10px; padding:14px 20px; display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
        .slip-price-lbl { font-size:13px; color:#4e5f6d; font-weight:600; }
        .slip-price-val { font-size:26px; font-weight:900; color:#0f5b78; }
        .slip-pay       { background:#fef3c7; border:1px solid #fcd34d; border-radius:10px; padding:14px 20px; }
        .slip-pay-title { font-size:12px; font-weight:800; color:#92400e; margin-bottom:8px; }
        .slip-pay-row   { display:flex; justify-content:space-between; font-size:12px; color:#78350f; padding:4px 0; border-bottom:1px solid rgba(252,211,77,.4); }
        .slip-pay-row:last-child { border-bottom:none; }
        .slip-pay-row span:last-child { font-weight:700; font-family:monospace; }
        .slip-screenshot { margin-top:14px; }
        .slip-screenshot img { width:100%; border-radius:8px; border:1px solid #dde3e8; }
        .slip-status    { display:inline-flex; align-items:center; gap:5px; background:#dcfce7; color:#16a34a; padding:3px 10px; border-radius:999px; font-size:12px; font-weight:700; }
        .slip-status::before { content:''; width:6px; height:6px; border-radius:50%; background:currentColor; }
        .slip-footer    { padding:14px 32px; background:#f8fafc; border-top:1px solid #dde3e8; font-size:11px; color:#8094a2; display:flex; justify-content:space-between; }
      </style></head>
      <body>${slipRef.current.outerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 350);
  };

  return (
    <Modal open onClose={onClose} title="✅ Booking Confirmed!" size="lg"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print / Save Slip
          </button>
        </>
      }
    >
      <div ref={slipRef} className="slip">
        {/* Header */}
        <div className="slip-header">
          <h1>Playdex · Booking Confirmation</h1>
          <p>Show this slip at the venue along with your payment screenshot.</p>
        </div>

        {/* Ref bar */}
        <div className="slip-ref-bar">
          <div>
            <div className="slip-ref-label">Booking Reference</div>
            <div className="slip-ref-value">{booking.id.slice(0, 8).toUpperCase()}</div>
          </div>
          <span className="slip-status">{booking.status}</span>
        </div>

        <div className="slip-body">
          {/* Venue & Sport */}
          <p className="slip-section">Venue &amp; Sport</p>
          <dl className="slip-grid">
            <div className="slip-field"><dt>Arena / Venue</dt><dd>{venue.name}</dd></div>
            <div className="slip-field"><dt>Sport</dt><dd>{sport}</dd></div>
            <div className="slip-field"><dt>Address</dt><dd style={{ fontSize: 12 }}>{venue.address}</dd></div>
            <div className="slip-field"><dt>Type</dt><dd>{venue.sport_type}</dd></div>
          </dl>

          <div className="slip-divider" />

          {/* Slot */}
          <p className="slip-section">Slot Details</p>
          <dl className="slip-grid">
            <div className="slip-field"><dt>Session</dt><dd>{event.name}</dd></div>
            <div className="slip-field"><dt>Capacity</dt><dd>{event.capacity} seats</dd></div>
            <div className="slip-field"><dt>Date</dt><dd>{fmtDate(event.started_at)}</dd></div>
            <div className="slip-field"><dt>Time</dt><dd>{fmtTime(event.started_at)} – {fmtTime(event.ended_at)}</dd></div>
          </dl>

          <div className="slip-divider" />

          {/* Customer */}
          <p className="slip-section">Customer</p>
          <dl className="slip-grid">
            <div className="slip-field"><dt>Full Name</dt><dd>{booking.customer_name}</dd></div>
            <div className="slip-field"><dt>Seats Booked</dt><dd>{booking.seats}</dd></div>
            <div className="slip-field"><dt>Phone</dt><dd>{booking.customer_phone}</dd></div>
            <div className="slip-field"><dt>Email</dt><dd style={{ fontSize: 12 }}>{booking.customer_email}</dd></div>
            <div className="slip-field"><dt>Booked At</dt><dd style={{ fontSize: 12 }}>{fmt(booking.booked_at)}</dd></div>
          </dl>

          <div className="slip-divider" />

          {/* Price */}
          <div className="slip-price-box">
            <div className="slip-price-lbl">
              Total Paid<br />
              <span style={{ fontSize: 11, fontWeight: 400 }}>
                {booking.seats} seat{booking.seats !== 1 ? 's' : ''} × PKR {event.price?.toLocaleString() ?? 0}
              </span>
            </div>
            <div className="slip-price-val">{total}</div>
          </div>

          {/* Payment details */}
          <div className="slip-pay">
            <div className="slip-pay-title">💳 Payment via {paymentMethod}</div>
            <div className="slip-pay-row"><span>Service</span><span>{paymentMethod}</span></div>
            <div className="slip-pay-row"><span>Account Number</span><span>{PHONE}</span></div>
            <div className="slip-pay-row"><span>Amount</span><span>{total}</span></div>
            <div className="slip-pay-row"><span>Reference</span><span>{booking.id.slice(0, 8).toUpperCase()}</span></div>
          </div>

          {/* Screenshot */}
          {screenshotUrl && (
            <div className="slip-screenshot">
              <p className="slip-section" style={{ marginTop: 14 }}>Payment Screenshot</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={screenshotUrl} alt="Payment screenshot" />
            </div>
          )}
        </div>

        <div className="slip-footer">
          <span>Playdex Lahore Sports Directory · playdex.io</span>
          <span>Reference: {booking.id.slice(0, 8).toUpperCase()}</span>
        </div>
      </div>
    </Modal>
  );
}

// ─── Slot Booking Modal ───────────────────────────────────────────────────────
interface SlotBookingModalProps {
  open: boolean;
  onClose: () => void;
  event: EventRecord;
  venue: VenueRecord;
  onBooked: (b: BookingRecord, method: string, screenshot: string | null) => void;
}

type BookingStep = 'form' | 'payment' | 'done';

function SlotBookingModal({ open, onClose, event, venue, onBooked }: SlotBookingModalProps) {
  const { user } = useAuth();

  const [step, setStep]     = useState<BookingStep>('form');
  const [form, setForm]     = useState<Partial<CreateBookingDto>>({
    event_id:       event.id,
    seats:          1,
    status:         'Pending',
    customer_name:  user?.name  ?? '',
    customer_email: user?.email ?? '',
    customer_phone: '',
  });
  const [saving,          setSaving]         = useState(false);
  const [err,             setErr]            = useState<string | null>(null);
  const [selectedMethod,  setSelectedMethod] = useState(PAYMENT_METHODS[0].id);
  const [screenshot,      setScreenshot]     = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);

  const set = (k: keyof CreateBookingDto, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const total = event.price != null
    ? `PKR ${(event.price * (form.seats ?? 1)).toLocaleString()}`
    : 'Free';

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name || !form.customer_email || !form.customer_phone) {
      setErr('Name, email, and phone are all required.'); return;
    }
    if (!form.seats || form.seats < 1) { setErr('Seats must be at least 1.'); return; }
    setSaving(true); setErr(null);
    try {
      const booking = await api.createBooking(form as CreateBookingDto);
      setConfirmedBooking(booking);
      setStep('payment');
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Booking failed. Please try again.');
    } finally { setSaving(false); }
  };

  const handleScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setScreenshot(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const confirmPayment = () => {
    if (!confirmedBooking) return;
    const method = PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name ?? selectedMethod;
    onBooked(confirmedBooking, method, screenshot);
  };

  const methodObj = PAYMENT_METHODS.find(m => m.id === selectedMethod) ?? PAYMENT_METHODS[0];

  // Step 1 — booking form
  if (step === 'form') {
    return (
      <Modal open={open} onClose={onClose} title="Book a Slot" size="md"
        footer={
          <>
            <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button form="slot-booking-form" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" /> Confirming…</> : `Reserve — ${total}`}
            </button>
          </>
        }
      >
        {/* Slot summary */}
        <div className="slot-modal-summary">
          <div className="slot-modal-summary-venue">{venue.name}</div>
          <div className="slot-modal-summary-name">{event.name}</div>
          <div className="slot-modal-summary-meta">
            <span>📅 {fmtDate(event.started_at)}</span>
            <span>🕐 {fmtTime(event.started_at)} – {fmtTime(event.ended_at)}</span>
            <span>👥 {event.capacity} seats</span>
          </div>
          {event.price != null && (
            <div className="slot-modal-price">PKR {event.price.toLocaleString()} <span>per seat</span></div>
          )}
        </div>

        <form id="slot-booking-form" onSubmit={submitForm}>
          <div className="form-group" style={{ marginTop: 14 }}>
            {err && <div className="alert alert-error"><span>✕</span><span>{err}</span></div>}
            <div className="form-field">
              <label>Full name *</label>
              <input className="form-input" value={form.customer_name ?? ''}
                onChange={e => set('customer_name', e.target.value)} placeholder="Your full name" required />
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Email *</label>
                <input type="email" className="form-input" value={form.customer_email ?? ''}
                  onChange={e => set('customer_email', e.target.value)} required />
              </div>
              <div className="form-field">
                <label>Phone *</label>
                <input type="tel" className="form-input" value={form.customer_phone ?? ''}
                  onChange={e => set('customer_phone', e.target.value)} placeholder="03xx xxxxxxx" required />
              </div>
            </div>
            <div className="form-field">
              <label>Seats</label>
              <input type="number" className="form-input" min={1} max={event.capacity}
                value={form.seats ?? 1} onChange={e => set('seats', Number(e.target.value))} />
            </div>
            {event.price != null && (
              <div className="slot-modal-total">
                <span>Total to pay</span>
                <span className="slot-modal-total-value">{total}</span>
              </div>
            )}
          </div>
        </form>
      </Modal>
    );
  }

  // Step 2 — payment
  return (
    <Modal open={open} onClose={onClose} title="💳 Complete Payment" size="md"
      footer={
        <>
          <button className="btn btn-secondary" onClick={() => setStep('form')}>Back</button>
          <button className="btn btn-primary" onClick={confirmPayment}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            Done — Show My Slip
          </button>
        </>
      }
    >
      {/* Amount */}
      <div className="slot-pay-amount">
        <div className="slot-pay-amount-label">Amount to transfer</div>
        <div className="slot-pay-amount-value">{total}</div>
        <div className="slot-pay-amount-ref">Reference: <strong>{confirmedBooking?.id.slice(0, 8).toUpperCase()}</strong></div>
      </div>

      {/* Method picker */}
      <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--color-text-muted)', margin: '16px 0 10px' }}>
        Choose payment method
      </p>
      <div className="slot-pay-methods">
        {PAYMENT_METHODS.map(m => (
          <button
            key={m.id}
            type="button"
            className={`slot-pay-method-btn${selectedMethod === m.id ? ' active' : ''}`}
            style={{ borderColor: selectedMethod === m.id ? m.color : undefined,
                     background: selectedMethod === m.id ? m.color + '18' : undefined }}
            onClick={() => setSelectedMethod(m.id)}
          >
            <span className="slot-pay-method-name" style={{ color: m.color }}>{m.name}</span>
            <span className="slot-pay-method-num">{m.number}</span>
          </button>
        ))}
      </div>

      {/* Instructions */}
      <div className="slot-pay-instructions">
        <div className="slot-pay-inst-title">
          <span style={{ fontSize: 18 }}>
            {selectedMethod === 'sadapay' ? '🟣' :
             selectedMethod === 'nayapay' ? '🔵' :
             selectedMethod === 'easypaisa' ? '🟢' : '🔴'}
          </span>
          Send to {methodObj.name}
        </div>
        <div className="slot-pay-inst-row">
          <span>Account Number</span>
          <strong>{methodObj.number}</strong>
        </div>
        <div className="slot-pay-inst-row">
          <span>Amount</span>
          <strong>{total}</strong>
        </div>
        <div className="slot-pay-inst-row">
          <span>Reference / Note</span>
          <strong>{confirmedBooking?.id.slice(0, 8).toUpperCase()}</strong>
        </div>
      </div>

      {/* Screenshot upload */}
      <div className="slot-pay-upload">
        <p className="slot-pay-upload-label">
          📸 Upload payment screenshot <span>(optional — attaches to your slip)</span>
        </p>
        <label className="slot-pay-upload-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          {screenshot ? 'Change screenshot' : 'Choose screenshot'}
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleScreenshot} />
        </label>
        {screenshot && (
          <div className="slot-pay-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={screenshot} alt="Payment screenshot preview" />
            <button type="button" onClick={() => setScreenshot(null)} className="slot-pay-preview-remove">✕</button>
          </div>
        )}
      </div>

      <p style={{ fontSize: 11.5, color: 'var(--color-text-muted)', marginTop: 12, lineHeight: 1.55 }}>
        After sending the payment, click <strong>Done — Show My Slip</strong> to get your booking e-slip.
      </p>
    </Modal>
  );
}

// ─── Login Gate ───────────────────────────────────────────────────────────────
function LoginGate({ onClose }: { onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title="Sign in to book" size="sm"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <Link href="/login" className="btn btn-primary">Sign in</Link>
        </>
      }
    >
      <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🔒</div>
        <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--color-text)' }}>
          Login required to book
        </p>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.65 }}>
          Create a free Playdex account to book slots.<br />
          Payment via SadaPay · NayaPay · Easypaisa · Raast.
        </p>
      </div>
    </Modal>
  );
}

// ─── Admin Gate ───────────────────────────────────────────────────────────────
function AdminGate({ onClose }: { onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title="Not allowed" size="sm"
      footer={<button className="btn btn-secondary" onClick={onClose}>OK</button>}
    >
      <div style={{ textAlign: 'center', padding: '8px 0 12px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🚫</div>
        <p style={{ fontWeight: 700, marginBottom: 8, color: 'var(--color-text)' }}>
          Admins cannot book slots
        </p>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          Superadmin and admin accounts are for managing venues only. Please use a regular user account to book.
        </p>
      </div>
    </Modal>
  );
}

// ─── Slot card ────────────────────────────────────────────────────────────────
function SlotCard({ event, onBook }: { event: EventRecord; onBook: (e: EventRecord) => void }) {
  const available = event.status === 'Available';
  const parts     = event.name.split(/—|-/)[0].trim().split(' ');
  const timeLabel = parts[0] ?? '';
  const sportLabel = parts.slice(1).join(' ');

  return (
    <div className={`slot-card${available ? '' : ' slot-card-unavailable'}`}>
      <div className="slot-card-top">
        <div>
          <div className="slot-card-name">
            {timeLabel && (
              <span className={`slot-label-pill slot-label-${timeLabel.toLowerCase()}`}>{timeLabel}</span>
            )}
            {sportLabel && <span style={{ marginLeft: 6, fontWeight: 600 }}>{sportLabel}</span>}
          </div>
        </div>
        <StatusBadge value={event.status} />
      </div>

      <div className="slot-timing-block">
        <div className="slot-timing-row">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          {fmtDate(event.started_at)}
        </div>
        <div className="slot-timing-time">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {fmtTime(event.started_at)}
          <span className="slot-timing-sep">→</span>
          {fmtTime(event.ended_at)}
        </div>
      </div>

      <div className="slot-card-footer-row">
        <span className="slot-seats-pill">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          {event.capacity} seats
        </span>
        {event.price != null
          ? <span className="slot-price-pill">PKR {event.price.toLocaleString()}</span>
          : <span className="slot-free-pill">Free</span>
        }
      </div>

      <div className="slot-cash-badge" style={{ background: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>
        SadaPay · NayaPay · Easypaisa · Raast
      </div>

      <button
        className={`btn btn-sm${available ? ' btn-primary' : ' btn-secondary'}`}
        style={{ marginTop: 12, width: '100%' }}
        disabled={!available}
        onClick={() => available && onBook(event)}
      >
        {available ? '🎟️ Book this slot' : 'Not available'}
      </button>
    </div>
  );
}

// ─── Main detail page ─────────────────────────────────────────────────────────
export function ArenaDetailPage({ id }: { id: string }) {
  const { user } = useAuth();
  const venue  = useData(() => api.getVenue(id), [id]);
  const events = useData(() => api.listEvents(), [id]);

  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  const [showLoginGate, setLoginGate]     = useState(false);
  const [showAdminGate, setAdminGate]     = useState(false);
  const [slipData, setSlipData] = useState<{
    booking: BookingRecord;
    event: EventRecord;
    method: string;
    screenshot: string | null;
  } | null>(null);

  const venueEvents = events.data?.filter(e => e.venue_id === id) ?? [];
  const available   = venueEvents.filter(e => e.status === 'Available');
  const unavailable = venueEvents.filter(e => e.status !== 'Available');

  const handleBookClick = useCallback((e: EventRecord) => {
    if (!user) { setLoginGate(true); return; }
    if (isAdminRole(user.role)) { setAdminGate(true); return; }
    setSelectedEvent(e);
  }, [user]);

  const handleBooked = useCallback((
    booking: BookingRecord,
    bookedEvent: EventRecord,
    method: string,
    screenshot: string | null,
  ) => {
    setSelectedEvent(null);
    setSlipData({ booking, event: bookedEvent, method, screenshot });
    events.reload();
  }, [events]);

  const v = venue.data;

  return (
    <div className="arenas-layout">

      {/* Nav */}
      <nav className="mkt-nav">
        <div className="mkt-nav-inner">
          <Link href="/" className="mkt-nav-brand">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            Playdex
          </Link>
          <div className="mkt-nav-links">
            <Link href="/" className="mkt-nav-link">Home</Link>
            <Link href="/arenas" className="mkt-nav-link">Find a Venue</Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user ? (
              <>
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  Hi, {user.name.split(' ')[0]}
                </span>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-secondary btn-sm">Sign up</Link>
                <Link href="/login" className="btn btn-primary btn-sm">Sign in</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="mkt-section" style={{ paddingTop: 32, paddingBottom: 64 }}>
        <Link href="/arenas" className="btn btn-secondary btn-sm" style={{ marginBottom: 24, display: 'inline-flex' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          All venues
        </Link>

        {venue.state === 'loading' && (
          <div style={{ display: 'grid', gap: 14 }}>
            {[200, 140, 100].map(w => (
              <div key={w} className="skeleton" style={{ height: 22, width: `${w}px`, borderRadius: 6 }} />
            ))}
          </div>
        )}
        {venue.state === 'error' && (
          <div className="alert alert-error">
            <span>⚠</span>
            <div>
              <strong>Could not load venue</strong>
              <p style={{ margin: '4px 0 8px', fontSize: 13 }}>{venue.error}</p>
              <button className="btn btn-secondary btn-sm" onClick={venue.reload}>Retry</button>
            </div>
          </div>
        )}

        {v && (
          <>
            <div className="arena-detail-header">
              <div className="arena-detail-header-left">
                <div className="arena-detail-type">{v.sport_type}</div>
                <h1 className="arena-detail-title">{v.name}</h1>
                {v.description && <p className="arena-detail-desc">{v.description}</p>}
              </div>
              {v.google_maps_url && (
                <a href={v.google_maps_url} target="_blank" rel="noreferrer"
                  className="btn btn-secondary" style={{ flexShrink: 0 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Open in Maps
                </a>
              )}
            </div>

            <div className="arena-detail-pills">
              <span className="arena-detail-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {v.address}
              </span>
              <span className="arena-detail-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                {v.capacity} capacity
              </span>
              {v.phone && (
                <a href={`tel:${v.phone}`} className="arena-detail-pill arena-detail-pill-link">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9A16 16 0 0 0 15 15.91l.82-.82a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  {v.phone}
                </a>
              )}
            </div>

            {/* Slots */}
            <div className="arena-slots-section">
              <div className="arena-slots-heading">
                <h2>Available slots</h2>
                <span className="badge badge-success">{available.length} open</span>
                <span className="badge badge-info">PKR 2,500 each</span>
              </div>

              {events.state === 'loading' && (
                <div className="arenas-grid" style={{ marginTop: 16 }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="slot-card">
                      <div className="skeleton" style={{ height: 18, width: '60%', borderRadius: 5, marginBottom: 8 }} />
                      <div className="skeleton" style={{ height: 13, width: '80%', borderRadius: 4 }} />
                    </div>
                  ))}
                </div>
              )}

              {events.state !== 'loading' && venueEvents.length === 0 && (
                <div className="empty-state" style={{ padding: '40px 16px' }}>
                  <span style={{ fontSize: 36 }}>📅</span>
                  <p className="empty-title">No slots scheduled yet</p>
                  <p className="empty-body">Check back later or contact the venue directly.</p>
                </div>
              )}

              {available.length > 0 && (
                <div className="arenas-grid" style={{ marginTop: 16 }}>
                  {available.slice(0, 24).map(e => (
                    <SlotCard key={e.id} event={e} onBook={handleBookClick} />
                  ))}
                </div>
              )}

              {unavailable.length > 0 && (
                <>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-muted)', marginTop: 28, marginBottom: 10 }}>
                    Past / Not available
                  </h3>
                  <div className="arenas-grid">
                    {unavailable.slice(0, 6).map(e => (
                      <SlotCard key={e.id} event={e} onBook={handleBookClick} />
                    ))}
                  </div>
                </>
              )}

              {!user && venueEvents.length > 0 && (
                <div className="arenas-info-strip" style={{ marginTop: 24 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>
                    <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Sign in</Link>
                    {' '}to book. Pay via SadaPay · NayaPay · Easypaisa · Raast to{' '}
                    <strong>{PHONE}</strong>
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Booking modal */}
      {selectedEvent && v && (
        <SlotBookingModal
          open
          onClose={() => setSelectedEvent(null)}
          event={selectedEvent}
          venue={v}
          onBooked={(booking, method, screenshot) =>
            handleBooked(booking, selectedEvent, method, screenshot)
          }
        />
      )}

      {/* Login gate */}
      {showLoginGate && <LoginGate onClose={() => setLoginGate(false)} />}

      {/* Admin gate */}
      {showAdminGate && <AdminGate onClose={() => setAdminGate(false)} />}

      {/* E-Slip */}
      {slipData && v && (
        <ESlip
          booking={slipData.booking}
          event={slipData.event}
          venue={v}
          paymentMethod={slipData.method}
          screenshotUrl={slipData.screenshot}
          onClose={() => setSlipData(null)}
        />
      )}
    </div>
  );
}
