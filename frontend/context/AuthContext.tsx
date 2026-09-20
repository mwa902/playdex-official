'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError, type User, type UserRole } from '@/lib/api-client';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = 'playdex_user';

function safeGetStorage(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSetStorage(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* noop */ }
}
function safeRemoveStorage(key: string): void {
  try { localStorage.removeItem(key); } catch { /* noop */ }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session — only runs on client after hydration
  useEffect(() => {
    try {
      const stored = safeGetStorage(SESSION_KEY);
      if (stored) setUser(JSON.parse(stored) as User);
    } catch {
      safeRemoveStorage(SESSION_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await api.loginUser(email, password);
    setUser(u);
    safeSetStorage(SESSION_KEY, JSON.stringify(u));
    router.push('/dashboard');
  }, [router]);

  const logout = useCallback(() => {
    setUser(null);
    safeRemoveStorage(SESSION_KEY);
    router.push('/login');
  }, [router]);

  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin      = user?.role === 'admin' || user?.role === 'superadmin';
  const hasRole      = useCallback((role: UserRole) => user?.role === role, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isSuperAdmin, isAdmin, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
