'use client';

import type { DataState } from '@/hooks/useData';

interface StateViewProps {
  state: DataState;
  error?: string | null;
  retry: () => void;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyBody?: string;
  children: React.ReactNode;
}

function SkeletonRows() {
  return (
    <div style={{ padding: '20px 24px', display: 'grid', gap: 12 }}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height: 20, width: `${60 + i * 10}%`, borderRadius: 6 }}
        />
      ))}
    </div>
  );
}

export function StateView({
  state,
  error,
  retry,
  emptyIcon = '📋',
  emptyTitle = 'Nothing here yet',
  emptyBody = 'Records will appear once you create some.',
  children,
}: StateViewProps) {
  if (state === 'loading') return <SkeletonRows />;

  if (state === 'error') {
    return (
      <div className="alert alert-error" style={{ margin: '16px 24px', borderRadius: 8 }}>
        <span>⚠</span>
        <div style={{ flex: 1 }}>
          <strong>Failed to load</strong>
          <p style={{ margin: '2px 0 8px', fontSize: 13 }}>
            {error ?? 'An unexpected error occurred. Is the backend running?'}
          </p>
          <button className="btn btn-secondary btn-sm" onClick={retry}>
            ↺ Retry
          </button>
        </div>
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className="empty-state">
        <span className="empty-icon" style={{ fontSize: 48 }}>{emptyIcon}</span>
        <p className="empty-title">{emptyTitle}</p>
        <p className="empty-body">{emptyBody}</p>
      </div>
    );
  }

  return <>{children}</>;
}
