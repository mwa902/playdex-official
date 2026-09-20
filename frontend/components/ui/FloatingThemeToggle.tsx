'use client';

import { useTheme } from '@/context/ThemeContext';

function SunIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2"  x2="12" y2="5"  />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="4.22"  y1="4.22"   x2="6.34"  y2="6.34"   />
      <line x1="17.66" y1="17.66"  x2="19.78" y2="19.78"  />
      <line x1="2"  y1="12" x2="5"  y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.22"  y1="19.78"  x2="6.34"  y2="17.66"  />
      <line x1="17.66" y1="6.34"   x2="19.78" y2="4.22"   />
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
    <button
      className="floating-theme-btn"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      data-label={dark ? 'Light mode' : 'Dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      {/* Top — sun indicator */}
      <span
        className="floating-dim-icon"
        style={{ color: dark ? 'var(--color-text-muted)' : 'var(--color-accent)' }}
      >
        <SunIcon />
      </span>

      {/* Sliding thumb */}
      <span className={`floating-thumb ${dark ? 'is-dark' : 'is-light'}`}>
        {dark ? <MoonIcon /> : <SunIcon />}
      </span>

      {/* Bottom — moon indicator */}
      <span
        className="floating-dim-icon"
        style={{ color: dark ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
      >
        <MoonIcon />
      </span>
    </button>
  );
}
