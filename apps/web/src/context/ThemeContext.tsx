'use client';

import React, { createContext, useContext, useEffect, useCallback, useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'theme';

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  listeners.add(callback);

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      callback();
    }
  };

  window.addEventListener('storage', handleStorage);

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleMedia = () => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        callback();
      }
    } catch {
      // Ignore
    }
  };

  mediaQuery.addEventListener('change', handleMedia);

  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', handleStorage);
    mediaQuery.removeEventListener('change', handleMedia);
  };
}

function getSnapshot(): Theme {
  if (typeof window === 'undefined') return 'light';

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch {
    // Ignore localStorage access errors (e.g. private browsing)
  }

  return 'light';
}

function getServerSnapshot(): Theme {
  return 'light';
}

function applyThemeToDocument(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Ignore
    }
    applyThemeToDocument(newTheme);
    notify();
  }, []);

  const toggleTheme = useCallback(() => {
    const current = getSnapshot();
    const nextTheme: Theme = current === 'light' ? 'dark' : 'light';
    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch {
      // Ignore
    }
    applyThemeToDocument(nextTheme);
    notify();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
