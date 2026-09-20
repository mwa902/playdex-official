import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/lib/api-client';

export type DataState = 'idle' | 'loading' | 'data' | 'empty' | 'error';

export interface UseDataResult<T> {
  state: DataState;
  data: T | null;
  error: string | null;
  reload: () => void;
}

export function useData<T>(
  loader: () => Promise<T>,
  deps: unknown[] = [],
): UseDataResult<T> {
  const [state, setState] = useState<DataState>('loading');
  const [data, setData]   = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const load = useCallback(() => {
    setState('loading');
    setError(null);
    loaderRef.current()
      .then(value => {
        setData(value);
        setState(Array.isArray(value) && value.length === 0 ? 'empty' : 'data');
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'An unexpected error occurred.');
        setState('error');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { load(); }, [load]);
  return { state, data, error, reload: load };
}
