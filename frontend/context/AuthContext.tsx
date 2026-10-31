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

const SESSION_KEY  = 'playdex_user';
const EXPIRY_KEY   = 'playdex_exp';
const SESSION_TTL  = 8 * 60 * 60 * 1000; // 8 hours

function safeGetStorage(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSetStorage(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* noop */ }
}
function safeRemoveStorage(key: string): void {
  try { localStorage.removeItem(key); } catch { /* noop */ }
}

function clearSession() {
  safeRemoveStorage(SESSION_KEY);
  safeRemoveStorage(EXPIRY_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session — check expiry on every mount
  useEffect(() => {
    try {
      const stored  = safeGetStorage(SESSION_KEY);
      const expiry  = safeGetStorage(EXPIRY_KEY);
      const now     = Date.now();

      if (stored && expiry && parseInt(expiry, 10) > now) {
        setUser(JSON.parse(stored) as User);
      } else if (stored) {
        // Session expired — clear it silently
        clearSession();
      }
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, []);

  // Periodic expiry check every minute
  useEffect(() => {
    const id = setInterval(() => {
      const expiry = safeGetStorage(EXPIRY_KEY);
      if (expiry && parseInt(expiry, 10) < Date.now()) {
        clearSession();
        setUser(null);
        window.location.replace('/login');
      }
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await api.loginUser(email, password);
    const expiry = String(Date.now() + SESSION_TTL);
    setUser(u);
    safeSetStorage(SESSION_KEY, JSON.stringify(u));
    safeSetStorage(EXPIRY_KEY, expiry);
    // Admins → admin panel; regular users → arenas (public home)
    if (u.role === 'admin' || u.role === 'Admin' || u.role === 'superadmin') {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/arenas');
    }
  }, [router]);

  const logout = useCallback(() => {
    setUser(null);
    clearSession();
    // Hard replace — clears history so back button can't return
    window.location.replace('/login');
  }, []);

  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin      = user?.role === 'admin' || user?.role === 'Admin' || user?.role === 'superadmin';
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
