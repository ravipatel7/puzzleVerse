// src/hooks/use-theme.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'puzzleverse-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light'); // Default theme

  // Function to apply theme class to HTML element
  const applyTheme = useCallback((selectedTheme: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(selectedTheme);
  }, []);

  // Effect to load theme from localStorage or system preference on initial mount
  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');

    setThemeState(initialTheme);
    applyTheme(initialTheme);

    // Listener for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
        // Only change if no theme is explicitly set in localStorage
         if (!localStorage.getItem(THEME_STORAGE_KEY)) {
            const newSystemTheme = e.matches ? 'dark' : 'light';
            setThemeState(newSystemTheme);
            applyTheme(newSystemTheme);
         }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);

  }, [applyTheme]);

  // Function to set theme and update localStorage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  return { theme, setTheme };
}
