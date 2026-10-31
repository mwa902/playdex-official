'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/hooks/useData';
import { useToast } from '@/hooks/useToast';
import { ToastStack } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  api, ApiError,
  type CreateEventDto, type EventRecord,
  type VenueRecord, type User,
} from '@/lib/api-client';

const SESSION_KEY = 'playdex_user';

// ─── helpers ─────────────────────────────────────────────────────────────────
function fmtDate(dt: string) {
  return new Date(dt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtTime(dt: string) {
  return new Date(dt).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
}
function toLocal(iso: string) {
  // Convert ISO to datetime-local input value
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ─── Add Slot Modal ───────────────────────────────────────────────────────────
function AddSlotModal({
  open, onClose, onCreated, venue, adminUser,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  venue: VenueRecord;
  adminUser: User;
}) {
  const orgs       = useData(() => api.listOrganizations());
  const eventTypes = useData(() => api.listEventTypes());

  const defaultStart = (() => {
    const d = new Date(); d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return toLocal(d.toISOString());
  })();
  const defaultEnd = (() => {
    const d = new Date(); d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 2);
    return toLocal(d.toISOString());
  })();

  const [form, setForm] = useState<Partial<CreateEventDto>>({
    venue_id: venue.id,
    status: 'Available',
    capacity: 20,
    started_at: defaultStart,
    ended_at:   defaultEnd,
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState<string | null>(null);

  const set = (k: keyof CreateEventDto, v: unknown) =>
    setForm(f => ({ ...f, [k]: v }));

  const reset = () => {
    setForm({ venue_id: venue.id, status: 'Available', capacity: 20, started_at: defaultStart, ended_at: defaultEnd });
    setErr(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.organization_id) { setErr('Select an organisation.'); return; }
    if (!form.event_type_id)   { setErr('Select a sport type.'); return; }
    if (!form.name)            { setErr('Slot name is required.'); return; }
    if (!form.started_at || !form.ended_at) { setErr('Set start and end times.'); return; }
    if (new Date(form.ended_at!) <= new Date(form.started_at!)) {
      setErr('End time must be after start time.'); return;
    }
    setSaving(true); setErr(null);
    try {
      await api.createEvent(form as CreateEventDto);
      reset(); onCreated();
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : 'Failed to create slot.');
    } finally { setSaving(false); }
  };

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title={`Add slot — ${venue.name}`}
      size="lg"
      footer={
        <>
          <button className="btn btn-secondary" onClick={() => { reset(); onClose(); }} disabled={saving}>
            Cancel
          </button>
          <button form="add-slot-form" type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><span className="spinner" /> Saving…</> : 'Add Slot'}
          </button>
        </>
      }
    >
      <form id="add-slot-form" onSubmit={submit}>
        <div className="form-group">
          {err && <div className="alert alert-error"><span>✕</span><span>{err}</span></div>}

          {/* Venue (readonly) */}
          <div className="admin-slot-venue-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {venue.name} · {venue.sport_type} · {venue.city}
          </div>

          <div className="form-field">
            <label>Slot name *</label>
            <input
              className="form-input"
              placeholder="e.g. Morning Cricket — Pitch A"
              value={form.name ?? ''}
              onChange={e => set('name', e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label>Description</label>
            <input
              className="form-input"
              placeholder="Optional — e.g. includes coaching"
              value={form.description ?? ''}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Organisation *</label>
              <select
                className="form-select"
                value={form.organization_id ?? ''}
                onChange={e => set('organization_id', e.target.value)}
                required
              >
                <option value="">— select —</option>
                {orgs.data?.map(o => (
                  <option key={o.id} value={o.id}>{o.company_name}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label>Sport type *</label>
              <select
                className="form-select"
                value={form.event_type_id ?? ''}
                onChange={e => set('event_type_id', e.target.value)}
                required
              >
                <option value="">— select —</option>
                {eventTypes.data?.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Start time *</label>
              <input
                type="datetime-local"
                className="form-input"
                value={form.started_at ?? ''}
                onChange={e => set('started_at', e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label>End time *</label>
              <input
                type="datetime-local"
                className="form-input"
                value={form.ended_at ?? ''}
                onChange={e => set('ended_at', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Capacity (seats) *</label>
              <input
                type="number"
                className="form-input"
                min={1}
                value={form.capacity ?? ''}
                onChange={e => set('capacity', Number(e.target.value))}
                required
              />
            </div>
            <div className="form-field">
              <label>Price (PKR)</label>
              <input
                type="number"
                className="form-input"
                min={0}
                placeholder="Leave blank = free"
                value={form.price ?? ''}
                onChange={e => set('price', e.target.value === '' ? undefined : Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-field">
            <label>Availability</label>
            <select
              className="form-select"
              value={form.status ?? 'Available'}
              onChange={e => set('status', e.target.value)}
            >
              <option value="Available">Available</option>
              <option value="Not-Available">Not Available</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}

// ─── Venue row with its slots ─────────────────────────────────────────────────
function VenueRow({
  venue, events, onAddSlot, onDeleteSlot, deletingId,
}: {
  venue: VenueRecord;
  events: EventRecord[];
  onAddSlot: (v: VenueRecord) => void;
  onDeleteSlot: (id: string) => void;
  deletingId: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const venueSlots = events.filter(e => e.venue_id === venue.id);

  const typeColor: Record<string, string> = {
    Arena: '#e8f4f8', Gym: '#fef3c7', Pool: '#e0f2fe',
  };

  return (
    <div className="admin-venue-row">
      {/* header */}
      <div className="admin-venue-header" onClick={() => setExpanded(x => !x)}>
        <div className="admin-venue-left">
          <div
            className="admin-venue-type-dot"
            style={{ background: typeColor[venue.sport_type] ?? '#f0f4f6' }}
          />
          <div>
            <div className="admin-venue-name">{venue.name}</div>
            <div className="admin-venue-meta">{venue.address} · {venue.phone ?? 'No phone'}</div>
          </div>
        </div>
        <div className="admin-venue-right">
          <span className={`badge ${venueSlots.length ? 'badge-info' : 'badge-neutral'}`}>
            {venueSlots.length} slot{venueSlots.length !== 1 ? 's' : ''}
          </span>
          <button
            className="btn btn-primary btn-sm"
            onClick={e => { e.stopPropagation(); onAddSlot(venue); }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Slot
          </button>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ transition: 'transform .2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      {/* slots */}
      {expanded && (
        <div className="admin-venue-slots">
          {venueSlots.length === 0 ? (
            <div className="admin-no-slots">
              No slots yet — click <strong>Add Slot</strong> above to schedule one.
            </div>
          ) : (
            <div className="admin-slots-grid">
              {venueSlots.map(ev => (
                <div key={ev.id} className={`admin-slot-box${ev.status !== 'Available' ? ' admin-slot-box-off' : ''}`}>
                  <div className="admin-slot-box-top">
                    <StatusBadge value={ev.status} />
                    <button
                      className="btn btn-ghost btn-icon btn-sm"
                      style={{ color: 'var(--color-error)' }}
                      onClick={() => onDeleteSlot(ev.id)}
                      disabled={deletingId === ev.id}
                      title="Delete slot"
                    >
                      {deletingId === ev.id
                        ? <span className="spinner" style={{ width: 13, height: 13 }} />
                        : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                      }
                    </button>
                  </div>
                  <div className="admin-slot-name">{ev.name}</div>
                  {ev.description && <div className="admin-slot-desc">{ev.description}</div>}
                  <div className="admin-slot-time">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {fmtDate(ev.started_at)}
                  </div>
                  <div className="admin-slot-time">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {fmtTime(ev.started_at)} – {fmtTime(ev.ended_at)}
                  </div>
                  <div className="admin-slot-footer">
                    <span className="admin-slot-capacity">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                      {ev.capacity} seats
                    </span>
                    <span className={`admin-slot-price ${ev.price != null ? 'has-price' : 'free'}`}>
                      {ev.price != null ? `PKR ${ev.price.toLocaleString()}` : 'Free'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ─── Main admin page ──────────────────────────────────────────────────────────
export function ArenaManagePage() {
  const { toasts, push, dismiss } = useToast();
  const [adminUser, setAdminUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) setAdminUser(JSON.parse(stored) as User);
    } catch { /* noop */ }
  }, []);

  const venues = useData(() => api.listVenues());
  const events = useData(() => api.listEvents());

  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [addSlotFor, setAddSlotFor] = useState<VenueRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = (venues.data ?? []).filter(v => {
    const q = search.toLowerCase();
    const matchSearch = !q || v.name.toLowerCase().includes(q) || v.address.toLowerCase().includes(q);
    const matchType   = typeFilter === 'All' || v.sport_type === typeFilter;
    return matchSearch && matchType;
  });

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('Delete this slot? Existing bookings will also be removed.')) return;
    setDeletingId(id);
    try {
      await api.deleteEvent(id);
      push('success', 'Slot deleted.');
      events.reload();
    } catch (ex) {
      push('error', ex instanceof ApiError ? ex.message : 'Delete failed.');
    } finally { setDeletingId(null); }
  };

  const totalSlots  = events.data?.length ?? 0;
  const activeSlots = events.data?.filter(e => e.status === 'Available').length ?? 0;

  return (
    <div className="page-grid">
      <ToastStack toasts={toasts} dismiss={dismiss} />

      <div className="page-header">
        <div className="page-header-left">
          <p className="page-eyebrow">Lahore · {venues.data?.length ?? 0} venues</p>
          <h1>Manage Slots</h1>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
        {[
          { label: 'Venues',       value: venues.data?.length ?? '—', icon: '📍' },
          { label: 'Total slots',  value: totalSlots,  icon: '📅' },
          { label: 'Active slots', value: activeSlots, icon: '✅' },
          { label: 'Arenas',  value: venues.data?.filter(v => v.sport_type === 'Arena').length ?? '—', icon: '⚽' },
          { label: 'Gyms',    value: venues.data?.filter(v => v.sport_type === 'Gym').length   ?? '—', icon: '🏋️' },
          { label: 'Pools',   value: venues.data?.filter(v => v.sport_type === 'Pool').length  ?? '—', icon: '🏊' },
        ].map(s => (
          <div key={s.label} className="admin-stat-card">
            <span className="admin-stat-icon">{s.icon}</span>
            <div className="admin-stat-value">{s.value}</div>
            <div className="admin-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 400 }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--color-text-muted)', pointerEvents: 'none' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="form-input" style={{ paddingLeft: 38 }} placeholder="Search venues…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['All', 'Arena', 'Gym', 'Pool'].map(t => (
          <button key={t} className={`admin-filter-tab${typeFilter === t ? ' active' : ''}`} onClick={() => setTypeFilter(t)}>{t}</button>
        ))}
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>{filtered.length} venue{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {venues.state === 'loading' && (
        <div style={{ display: 'grid', gap: 10 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 10 }} />)}
        </div>
      )}
      {venues.state === 'error' && (
        <div className="alert alert-error">
          <span>⚠</span>
          <div><strong>Could not load venues</strong><p style={{ margin: '4px 0 8px', fontSize: 13 }}>{venues.error}</p><button className="btn btn-secondary btn-sm" onClick={venues.reload}>Retry</button></div>
        </div>
      )}
      {venues.state !== 'loading' && venues.state !== 'error' && filtered.length === 0 && (
        <div className="empty-state"><span style={{ fontSize: 40 }}>🔍</span><p className="empty-title">No venues found</p></div>
      )}
      {filtered.length > 0 && events.data && (
        <div style={{ display: 'grid', gap: 8 }}>
          {filtered.map(v => (
            <VenueRow key={v.id} venue={v} events={events.data!} onAddSlot={setAddSlotFor} onDeleteSlot={handleDeleteSlot} deletingId={deletingId} />
          ))}
        </div>
      )}

      {addSlotFor && adminUser && (
        <AddSlotModal
          open
          venue={addSlotFor}
          adminUser={adminUser}
          onClose={() => setAddSlotFor(null)}
          onCreated={() => { setAddSlotFor(null); events.reload(); push('success', 'Slot added!'); }}
        />
      )}
    </div>
  );
}
