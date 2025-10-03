import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, themes, defaultTheme } from '@/lib/themes';

interface ThemeContextType {
  currentTheme: Theme;
  themeName: string;
  setTheme: (themeName: string) => void;
  themes: Record<string, Theme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<string>(() => {
    const stored = localStorage.getItem('pnw-theme');
    return stored && themes[stored] ? stored : defaultTheme;
  });

  const currentTheme = themes[themeName] || themes[defaultTheme];

  useEffect(() => {
    localStorage.setItem('pnw-theme', themeName);
    applyTheme(currentTheme);
  }, [themeName, currentTheme]);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;

    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });

    root.style.setProperty('--heading-font', theme.typography.headingFont);
    root.style.setProperty('--body-font', theme.typography.bodyFont);
    root.style.setProperty('--mono-font', theme.typography.monoFont);

    Object.entries(theme.typography.headingSizes).forEach(([key, value]) => {
      root.style.setProperty(`--${key}-size`, value);
    });

    Object.entries(theme.typography.fontWeights).forEach(([key, value]) => {
      root.style.setProperty(`--font-${key}`, value);
    });

    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });

    root.style.setProperty('--border-radius', theme.borderRadius);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, themeName, setTheme: setThemeName, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
