import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { getTheme, ThemeTokens } from '../lib/theme';
import { getSecure, setSecure } from '../lib/storage';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: ThemeTokens;
}

const ThemeContext = createContext<ThemeContextType>({ isDarkMode: false, toggleTheme: () => {}, theme: getTheme(false) });

const THEME_PREF_KEY = 'user_theme_preference';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemScheme === 'dark');
  const [hasManualPreference, setHasManualPreference] = useState(false);

  useEffect(() => {
    async function loadThemePreference() {
      try {
        const saved = await getSecure(THEME_PREF_KEY);
        if (saved !== null) {
          setIsDarkMode(saved === 'dark');
          setHasManualPreference(true);
        }
      } catch {}
    }
    loadThemePreference();
  }, []);

  useEffect(() => {
    if (!hasManualPreference) {
      setIsDarkMode(systemScheme === 'dark');
    }
  }, [systemScheme, hasManualPreference]);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      setHasManualPreference(true);
      setSecure(THEME_PREF_KEY, next ? 'dark' : 'light').catch(() => {});
      return next;
    });
  };

  const theme = getTheme(isDarkMode);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

