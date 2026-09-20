'use client';

import { useTheme } from '@/context/ThemeContext';

/* ─────────────────────────────────────────────────────────────
   Floating theme toggle
   Fixed to the right edge, vertically centred — sits right next
   to the scrollbar so it's always reachable without moving the
   user's eye away from content.
───────────────────────────────────────────────────────────── */

function SunIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2"  x2="12" y2="5"  />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="4.22" y1="4.22"   x2="6.34" y2="6.34"   />
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
      <line x1="2"  y1="12" x2="5"  y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78"  x2="6.34" y2="17.66"  />
      <line x1="17.66" y1="6.34"  x2="19.78" y2="4.22"  />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function FloatingThemeToggle() {
  const { dark, toggle } = useTheme();

  return (
    <>
      <style>{`
        .floating-theme-btn {
          position: fixed;
          right: 18px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 200;
          /* pill shape, taller than wide so it reads as vertical */
          width: 40px;
          height: 80px;
          border-radius: 20px;
          border: 1.5px solid var(--color-border);
          background: var(--color-surface);
          box-shadow: var(--shadow-md);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0;
          transition: box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
          outline: none;
        }
        .floating-theme-btn:hover {
          box-shadow: var(--shadow-lg);
          border-color: var(--color-primary);
        }
        .floating-theme-btn:focus-visible {
          outline: 2px solid var(--color-primary);
          outline-offset: 2px;
        }

        /* The sliding thumb inside the pill */
        .floating-thumb {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--color-primary);
          box-shadow: 0 2px 8px rgba(15,91,120,.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          /* slides between top-half and bottom-half */
          transition: top 0.35s cubic-bezier(.34,1.56,.64,1);
        }
        .floating-thumb.is-light { top: 8px; }
        .floating-thumb.is-dark  { top: calc(100% - 36px); }

        /* Dim icon at the opposite end */
        .floating-dim-icon {
          color: var(--color-text-muted);
          opacity: 0.45;
          transition: opacity 0.2s;
        }
        .floating-theme-btn:hover .floating-dim-icon { opacity: 0.7; }

        /* Label tooltip on hover */
        .floating-theme-btn::after {
          content: attr(data-label);
          position: absolute;
          right: calc(100% + 10px);
          top: 50%;
          transform: translateY(-50%);
          background: var(--color-text);
          color: var(--color-text-inverse);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .03em;
          white-space: nowrap;
          padding: 5px 10px;
          border-radius: 6px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.15s ease;
        }
        .floating-theme-btn:hover::after { opacity: 1; }

        @media (max-width: 640px) {
          .floating-theme-btn {
            right: 12px;
            width: 36px;
            height: 70px;
          }
          .floating-thumb { width: 24px; height: 24px; }
          .floating-thumb.is-light { top: 7px; }
          .floating-thumb.is-dark  { top: calc(100% - 31px); }
        }
      `}</style>

      <button
        className="floating-theme-btn"
        onClick={toggle}
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        data-label={dark ? 'Light mode' : 'Dark mode'}
        title={dark ? 'Light mode' : 'Dark mode'}
      >
        {/* Top icon — sun (light mode indicator) */}
        <span className="floating-dim-icon" style={{ color: dark ? 'var(--color-text-muted)' : 'var(--color-accent)' }}>
          <SunIcon />
        </span>

        {/* Sliding thumb */}
        <span className={`floating-thumb ${dark ? 'is-dark' : 'is-light'}`}>
          {dark ? <MoonIcon /> : <SunIcon />}
        </span>

        {/* Bottom icon — moon (dark mode indicator) */}
        <span className="floating-dim-icon" style={{ color: dark ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
          <MoonIcon />
        </span>
      </button>
    </>
  );
}
