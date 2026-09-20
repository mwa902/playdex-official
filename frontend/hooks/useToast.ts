import { useCallback, useState } from 'react';

export type ToastIntent = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  intent: ToastIntent;
  message: string;
}

let seq = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((intent: ToastIntent, message: string) => {
    const id = ++seq;
    setToasts(prev => [...prev, { id, intent, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, push, dismiss };
}
