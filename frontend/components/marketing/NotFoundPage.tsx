'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

/* ─── Animated signal-line SVG ───────────────────────────────────────────── */
function SignalLine({
  delay = 0,
  opacity = 1,
}: {
  delay?: number;
  opacity?: number;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        animation: `pulse404 2.4s ease-in-out ${delay}s infinite`,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0 }}
      >
        <circle
          cx="200"
          cy="200"
          r="120"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="6 10"
          style={{ opacity: 0.15 }}
        />
        <circle
          cx="200"
          cy="200"
          r="160"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 14"
          style={{ opacity: 0.08 }}
        />
      </svg>
    </div>
  );
}

/* ─── Glitch digit ───────────────────────────────────────────────────────── */
function GlitchDigit({ char }: { char: string }) {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(
      () => {
        setGlitching(true);
        setTimeout(() => setGlitching(false), 180);
      },
      2800 + Math.random() * 2000,
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      style={{
        display: 'inline-block',
        position: 'relative',
        fontVariantNumeric: 'tabular-nums',
        animation: glitching ? 'glitch404 0.18s steps(2) forwards' : undefined,
      }}
    >
      {char}
      {glitching && (
        <>
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: 0,
              left: 2,
              color: '#f87171',
              opacity: 0.7,
              clipPath: 'inset(30% 0 40% 0)',
            }}
          >
            {char}
          </span>
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: 0,
              left: -2,
              color: '#60a5fa',
              opacity: 0.7,
              clipPath: 'inset(60% 0 10% 0)',
            }}
          >
            {char}
          </span>
        </>
      )}
    </span>
  );
}

/* ─── Breadcrumb path animation ──────────────────────────────────────────── */
function PathDisplay({ path }: { path: string }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone]           = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setDisplayed('');
    setDone(false);
    const t = setInterval(() => {
      idx.current++;
      setDisplayed(path.slice(0, idx.current));
      if (idx.current >= path.length) {
        setDone(true);
        clearInterval(t);
      }
    }, 38);
    return () => clearInterval(t);
  }, [path]);

  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        color: 'var(--color-text-muted)',
      }}
    >
      {displayed}
      {!done && (
        <span
          style={{
            display: 'inline-block',
            width: 2,
            height: '1em',
            background: 'var(--color-primary)',
            marginLeft: 2,
            verticalAlign: 'text-bottom',
            animation: 'blink404 0.85s step-end infinite',
          }}
        />
      )}
    </span>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function NotFoundPage() {
  const { dark } = useTheme();

  /* Inject keyframes once */
  useEffect(() => {
    const id = 'playdex-404-keyframes';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @keyframes pulse404 {
        0%, 100% { transform: scale(1);   opacity: 1; }
        50%       { transform: scale(1.06); opacity: .6; }
      }
      @keyframes glitch404 {
        0%   { transform: translate(0,0);    clip-path: inset(10% 0 80% 0); }
        25%  { transform: translate(-3px,0); clip-path: inset(40% 0 40% 0); }
        50%  { transform: translate(3px,0);  clip-path: inset(70% 0 10% 0); }
        75%  { transform: translate(-1px,0); clip-path: inset(20% 0 60% 0); }
        100% { transform: translate(0,0);    clip-path: inset(0% 0 100% 0); }
      }
      @keyframes blink404 {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0; }
      }
      @keyframes floatUp404 {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0);    }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        textAlign: 'center',
        fontFamily: 'var(--font-sans)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Background grid */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `
            linear-gradient(var(--color-border) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-border) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          opacity: dark ? 0.25 : 0.4,
          pointerEvents: 'none',
        }}
      />

      {/* Radial spotlight */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          background: `radial-gradient(ellipse 60% 50% at 50% 45%,
            ${dark ? 'rgba(15,91,120,.18)' : 'rgba(15,91,120,.07)'} 0%,
            transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
          animation: 'floatUp404 .55s ease both',
        }}
      >
        {/* ── Giant 404 ── */}
        <div
          style={{
            position: 'relative',
            width: 340,
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}
        >
          <SignalLine delay={0}   opacity={1} />
          <SignalLine delay={0.6} opacity={0.55} />
          <SignalLine delay={1.2} opacity={0.25} />

          <span
            style={{
              position: 'relative',
              zIndex: 1,
              fontSize: 'clamp(100px, 18vw, 160px)',
              fontWeight: 900,
              letterSpacing: '-0.06em',
              lineHeight: 1,
              color: 'var(--color-text)',
              userSelect: 'none',
            }}
            aria-label="404"
          >
            <GlitchDigit char="4" />
            <GlitchDigit char="0" />
            <GlitchDigit char="4" />
          </span>
        </div>

        {/* ── Status line ── */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 14px',
            marginBottom: 28,
            background: 'var(--color-error-bg)',
            border: '1px solid',
            borderColor: dark ? 'rgba(248,113,113,.25)' : '#fca5a5',
            borderRadius: 'var(--radius-full)',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--color-error)',
            letterSpacing: '.06em',
            textTransform: 'uppercase',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--color-error)',
              animation: 'pulse404 1.4s ease-in-out infinite',
              flexShrink: 0,
            }}
          />
          Page not found
        </div>

        {/* ── Headline ── */}
        <h1
          style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: 'var(--color-text)',
            maxWidth: '20ch',
            marginBottom: 14,
          }}
        >
          This route doesn&apos;t exist on the platform.
        </h1>

        {/* ── Subtext ── */}
        <p
          style={{
            fontSize: 15,
            color: 'var(--color-text-secondary)',
            maxWidth: '46ch',
            lineHeight: 1.7,
            marginBottom: 36,
          }}
        >
          The page you requested could not be located. It may have been moved,
          deleted, or the URL may be incorrect. Use the links below to get back
          on track.
        </p>

        {/* ── Animated path display ── */}
        <div
          style={{
            marginBottom: 36,
            padding: '10px 18px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-text-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            style={{ flexShrink: 0 }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <PathDisplay path="playdex.io → route not found → 404" />
        </div>

        {/* ── Action buttons ── */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: 52,
          }}
        >
          <Link
            href="/dashboard"
            className="btn btn-primary"
            style={{ padding: '11px 24px', fontSize: 14 }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            Go to Dashboard
          </Link>

          <Link
            href="/"
            className="btn btn-secondary"
            style={{ padding: '11px 24px', fontSize: 14 }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Home
          </Link>

          <Link
            href="/login"
            className="btn btn-secondary"
            style={{ padding: '11px 24px', fontSize: 14 }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Sign In
          </Link>
        </div>

        {/* ── Quick nav links ── */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: 'var(--color-text-muted)',
              marginRight: 4,
            }}
          >
            Quick links:
          </span>
          {[
            { href: '/events',        label: 'Events' },
            { href: '/venues',        label: 'Venues' },
            { href: '/bookings',      label: 'Bookings' },
            { href: '/organizations', label: 'Organizations' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--color-primary)',
                padding: '4px 10px',
                background: 'var(--color-primary-light)',
                borderRadius: 'var(--radius-full)',
                textDecoration: 'none',
                transition: 'opacity var(--transition)',
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Brand footer ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 28,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
          fontSize: 12,
          color: 'var(--color-text-muted)',
          opacity: 0.6,
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        Playdex Operations Platform
      </div>
    </div>
  );
}
