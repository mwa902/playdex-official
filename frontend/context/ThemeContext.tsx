'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface ThemeContextValue {
  dark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  dark: false,
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start with false — always matches the server-rendered HTML (data-theme="light")
  const [dark, setDark]       = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only runs on the client, after hydration — safe to touch localStorage & window
  useEffect(() => {
    try {
      const stored      = localStorage.getItem('playdex-theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark      = stored ? stored === 'dark' : prefersDark;

      if (isDark) {
        setDark(true);
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    } catch {
      // SSR / private-browsing safety
    } finally {
      setMounted(true);
    }
  }, []);

  const toggle = useCallback(() => {
    setDark(prev => {
      const next = !prev;
      try {
        document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
        localStorage.setItem('playdex-theme', next ? 'dark' : 'light');
      } catch {
        // safety
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ dark: mounted ? dark : false, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
