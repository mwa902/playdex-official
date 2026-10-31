'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/hooks/useData';
import { api, filterVenues, type SportTypeFilter, type VenueRecord } from '@/lib/api-client';

// ─── Sport list for dropdown ─────────────────────────────────────────────────
const SPORT_OPTIONS = [
  'All Sports', 'Cricket', 'Futsal', 'Football', 'Padel', 'Badminton',
  'Squash', 'Tennis', 'Swimming', 'Gym Session', 'CrossFit',
  'Basketball', 'Volleyball', 'Table Tennis', 'Snooker', 'Karting', 'Multi-Sport',
];

// ─── Sport type tab config ───────────────────────────────────────────────────
const TABS: { label: string; value: SportTypeFilter; emoji: string; desc: string }[] = [
  { label: 'All',    value: 'All',   emoji: '🏟️', desc: 'All venues' },
  { label: 'Arenas', value: 'Arena', emoji: '⚽', desc: 'Sports arenas & courts' },
  { label: 'Gyms',   value: 'Gym',   emoji: '🏋️', desc: 'Gyms & fitness centres' },
  { label: 'Pools',  value: 'Pool',  emoji: '🏊', desc: 'Swimming pools' },
];

// ─── Venue card ──────────────────────────────────────────────────────────────
function VenueCard({ v }: { v: VenueRecord }) {
  const typeColor: Record<string, { bg: string; text: string }> = {
    Arena: { bg: '#e8f4f8', text: '#0f5b78' },
    Gym:   { bg: '#fef3c7', text: '#92400e' },
    Pool:  { bg: '#e0f2fe', text: '#0369a1' },
  };
  const color = typeColor[v.sport_type] ?? { bg: '#f0f4f6', text: '#4e5f6d' };

  return (
    <Link href={`/arenas/${v.id}`} className="arena-card" aria-label={`View ${v.name}`}>
      {/* top strip */}
      <div className="arena-card-top" style={{ background: color.bg }}>
        <span className="arena-type-badge" style={{ color: color.text, background: 'rgba(255,255,255,.7)' }}>
          {v.sport_type}
        </span>
        <span className="arena-capacity-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          {v.capacity}
        </span>
      </div>

      {/* body */}
      <div className="arena-card-body">
        <h3 className="arena-card-name">{v.name}</h3>
        {v.description && (
          <p className="arena-card-desc">{v.description}</p>
        )}

        <div className="arena-card-meta">
          <span className="arena-card-address">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {v.address.length > 52 ? v.address.slice(0, 50) + '…' : v.address}
          </span>
          {v.phone && (
            <span className="arena-card-phone">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9A16 16 0 0 0 15 15.91l.82-.82a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              {v.phone}
            </span>
          )}
        </div>

        <div className="arena-card-cta">
          View slots &amp; book
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </div>
      </div>
    </Link>
  );
}

// ─── Skeleton card ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="arena-card arena-card-skeleton">
      <div className="arena-card-top skeleton" style={{ height: 60 }} />
      <div className="arena-card-body" style={{ gap: 10 }}>
        <div className="skeleton" style={{ height: 18, width: '70%', borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 13, width: '90%', borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 13, width: '60%', borderRadius: 4 }} />
      </div>
    </div>
  );
}

// ─── Map placeholder section ─────────────────────────────────────────────────
function MapPlaceholder({ search }: { search: string }) {
  const query = search.trim()
    ? `${search} sports venue Lahore`
    : 'sports arenas gyms Lahore Pakistan';
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  const mapsUrl  = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <div className="arenas-map-section">
      <div className="arenas-map-header">
        <div>
          <span className="arenas-map-kicker">Map Preview</span>
          <h2>Lahore sports venues</h2>
        </div>
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="arenas-map-link">
          Open in Google Maps
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </a>
      </div>
      <iframe
        className="arenas-map-iframe"
        src={embedUrl}
        title="Lahore sports venues map"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <p className="arenas-map-note">
        Google Maps preview — showing venues near Lahore. Select a card below to see exact location and book a slot.
      </p>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export function ArenasPage() {
  const { dark } = useTheme();
  const { user, logout } = useAuth();
  const searchParams = useSearchParams();
  const venues = useData(() => api.listVenues());

  // Initialise from URL params (set by landing page search)
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '');
  const [tab,    setTab]    = useState<SportTypeFilter>('All');
  const [sport,  setSport]  = useState(() => searchParams.get('sport') ?? 'All Sports');

  // When URL params change, sync state
  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    const s = searchParams.get('sport') ?? 'All Sports';
    setSearch(q); setSport(s);
  }, [searchParams]);

  // Combined filter: name/address search + sport type tab
  const filtered = (venues.data ?? []).filter(v => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || v.name.toLowerCase().includes(q)
      || v.address.toLowerCase().includes(q)
      || (v.description ?? '').toLowerCase().includes(q);
    const matchTab  = tab === 'All' || v.sport_type === tab;
    return matchSearch && matchTab;
  });

  const counts = {
    All:   venues.data?.length ?? 0,
    Arena: venues.data?.filter(v => v.sport_type === 'Arena').length ?? 0,
    Gym:   venues.data?.filter(v => v.sport_type === 'Gym').length   ?? 0,
    Pool:  venues.data?.filter(v => v.sport_type === 'Pool').length  ?? 0,
  };

  const clearAll = () => { setSearch(''); setSport('All Sports'); setTab('All'); };

  return (
    <div className="arenas-layout">

      {/* ── Nav ── */}
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
            <Link href="/arenas" className="mkt-nav-link mkt-nav-link-active">Find a Venue</Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user ? (
              <>
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                  Hi, {user.name.split(' ')[0]}
                </span>
                <button onClick={logout} className="btn btn-secondary btn-sm">Sign out</button>
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

      {/* ── Hero ── */}
      <section className="arenas-hero">
        <div className="mkt-section">
          <div className="arenas-hero-eyebrow">Lahore · 135 venues listed</div>
          <h1 className="arenas-hero-title">Find an arena,<br /><span>gym, or pool.</span></h1>
          <p className="arenas-hero-sub">
            Browse sports arenas, fitness centres, and swimming pools across Lahore.
            Pick a venue, choose an available slot, and book — payment by cash on arrival.
          </p>

          {/* Search bar */}
          <div className="arenas-search-row">
            <div className="arenas-search-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="search"
                className="arenas-search-input"
                placeholder="Search by name or area (DHA, Gulberg…)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search venues"
              />
              {search && (
                <button className="arenas-search-clear" onClick={() => setSearch('')} aria-label="Clear search">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>

            {/* Sport game dropdown */}
            <select
              className="arenas-sport-select"
              value={sport}
              onChange={e => setSport(e.target.value)}
              aria-label="Filter by sport"
            >
              {SPORT_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {venues.state === 'data' && (
              <span className="arenas-search-count">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── Map ── */}
      <section className="mkt-section" style={{ paddingTop: 0 }}>
        <MapPlaceholder search={search} />
      </section>

      {/* ── Tabs + grid ── */}
      <section className="mkt-section arenas-grid-section">

        {/* Tab bar */}
        <div className="arenas-tabs" role="tablist">
          {TABS.map(t => (
            <button
              key={t.value}
              role="tab"
              aria-selected={tab === t.value}
              className={`arenas-tab${tab === t.value ? ' arenas-tab-active' : ''}`}
              onClick={() => setTab(t.value)}
            >
              <span>{t.emoji}</span>
              {t.label}
              <span className="arenas-tab-count">{counts[t.value]}</span>
            </button>
          ))}
        </div>

        {/* Loading skeletons */}
        {venues.state === 'loading' && (
          <div className="arenas-grid">
            {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {venues.state === 'error' && (
          <div className="alert alert-error" style={{ margin: '24px 0' }}>
            <span>⚠</span>
            <div>
              <strong>Could not load venues</strong>
              <p style={{ margin: '4px 0 8px', fontSize: 13 }}>{venues.error}</p>
              <button className="btn btn-secondary btn-sm" onClick={venues.reload}>Retry</button>
            </div>
          </div>
        )}

        {/* Empty */}
        {venues.state !== 'loading' && venues.state !== 'error' && filtered.length === 0 && (
          <div className="empty-state" style={{ padding: '60px 24px' }}>
            <span style={{ fontSize: 48 }}>🔍</span>
            <p className="empty-title">No venues match &ldquo;{search}&rdquo;</p>
            <p className="empty-body">Try a different keyword or clear the search.</p>
            <button className="btn btn-secondary btn-sm" onClick={clearAll}>Clear filters</button>
          </div>
        )}

        {/* Venue grid */}
        {venues.state !== 'loading' && venues.state !== 'error' && filtered.length > 0 && (
          <div className="arenas-grid" role="list">
            {filtered.map(v => <VenueCard key={v.id} v={v} />)}
          </div>
        )}

        {/* Info strip */}
        <div className="arenas-info-strip" style={{ background: dark ? 'rgba(56,169,201,.08)' : '#e8f4f8' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>
            All 135 venues are in Lahore. Booking is <strong>pay online</strong> — SadaPay · NayaPay · Easypaisa · Raast to <strong>03322024160</strong>.
            {!user && <> <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Sign in</Link> or <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>create a free account</Link> to reserve a slot.</>}
          </span>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="arenas-footer">
        <div className="mkt-section">
          <span>© {new Date().getFullYear()} Playdex · Lahore Sports Directory</span>
          <span>Data sourced from public listings — verify details before visiting</span>
        </div>
      </footer>

    </div>
  );
}
