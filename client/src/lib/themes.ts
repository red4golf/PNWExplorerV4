export interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  card: string;
  cardForeground: string;
  border: string;
  input: string;
  muted: string;
  mutedForeground: string;
  destructive: string;
  destructiveForeground: string;
  ring: string;
}

export interface ThemeTypography {
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  headingSizes: {
    h1: string;
    h2: string;
    h3: string;
    h4: string;
  };
  fontWeights: {
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface Theme {
  name: string;
  displayName: string;
  description: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  shadows: ThemeShadows;
  borderRadius: string;
}

export const themes: Record<string, Theme> = {
  heritageRefined: {
    name: 'heritageRefined',
    displayName: 'Heritage Refined',
    description: 'Warm earth tones with sophisticated styling',
    colors: {
      background: 'hsl(30, 26%, 96%)',
      foreground: 'hsl(24, 45%, 20%)',
      primary: 'hsl(38, 69%, 59%)',
      primaryForeground: 'hsl(24, 45%, 20%)',
      secondary: 'hsl(120, 25%, 25%)',
      secondaryForeground: 'hsl(0, 0%, 100%)',
      accent: 'hsl(38, 69%, 59%)',
      accentForeground: 'hsl(24, 45%, 20%)',
      card: 'hsl(0, 0%, 100%)',
      cardForeground: 'hsl(24, 45%, 20%)',
      border: 'hsl(30, 15%, 85%)',
      input: 'hsl(30, 15%, 85%)',
      muted: 'hsl(30, 20%, 90%)',
      mutedForeground: 'hsl(24, 25%, 40%)',
      destructive: 'hsl(0, 84%, 60%)',
      destructiveForeground: 'hsl(0, 0%, 100%)',
      ring: 'hsl(38, 69%, 59%)',
    },
    typography: {
      headingFont: 'Georgia, "Times New Roman", serif',
      bodyFont: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      monoFont: '"Courier New", Courier, monospace',
      headingSizes: {
        h1: '2.5rem',
        h2: '2rem',
        h3: '1.5rem',
        h4: '1.25rem',
      },
      fontWeights: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
    spacing: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
    borderRadius: '0.5rem',
  },
  modernMinimal: {
    name: 'modernMinimal',
    displayName: 'Modern Minimal',
    description: 'Clean, contemporary design with generous spacing',
    colors: {
      background: 'hsl(0, 0%, 100%)',
      foreground: 'hsl(0, 0%, 10%)',
      primary: 'hsl(189, 94%, 43%)',
      primaryForeground: 'hsl(0, 0%, 100%)',
      secondary: 'hsl(215, 25%, 35%)',
      secondaryForeground: 'hsl(0, 0%, 100%)',
      accent: 'hsl(189, 94%, 43%)',
      accentForeground: 'hsl(0, 0%, 100%)',
      card: 'hsl(210, 40%, 98%)',
      cardForeground: 'hsl(0, 0%, 10%)',
      border: 'hsl(214, 32%, 91%)',
      input: 'hsl(214, 32%, 91%)',
      muted: 'hsl(210, 40%, 96%)',
      mutedForeground: 'hsl(215, 16%, 47%)',
      destructive: 'hsl(0, 84%, 60%)',
      destructiveForeground: 'hsl(0, 0%, 100%)',
      ring: 'hsl(189, 94%, 43%)',
    },
    typography: {
      headingFont: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      bodyFont: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      monoFont: '"SF Mono", Monaco, "Cascadia Code", monospace',
      headingSizes: {
        h1: '2.75rem',
        h2: '2.25rem',
        h3: '1.75rem',
        h4: '1.375rem',
      },
      fontWeights: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
    spacing: {
      xs: '0.75rem',
      sm: '1.25rem',
      md: '2rem',
      lg: '2.5rem',
      xl: '4rem',
    },
    shadows: {
      sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
      xl: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    },
    borderRadius: '0.75rem',
  },
  darkElegant: {
    name: 'darkElegant',
    displayName: 'Dark Elegant',
    description: 'Premium dark mode with golden accents',
    colors: {
      background: 'hsl(222, 47%, 11%)',
      foreground: 'hsl(0, 0%, 98%)',
      primary: 'hsl(38, 92%, 50%)',
      primaryForeground: 'hsl(222, 47%, 11%)',
      secondary: 'hsl(215, 25%, 27%)',
      secondaryForeground: 'hsl(0, 0%, 98%)',
      accent: 'hsl(45, 93%, 58%)',
      accentForeground: 'hsl(222, 47%, 11%)',
      card: 'hsl(217, 33%, 17%)',
      cardForeground: 'hsl(0, 0%, 98%)',
      border: 'hsl(215, 25%, 27%)',
      input: 'hsl(215, 25%, 27%)',
      muted: 'hsl(217, 33%, 17%)',
      mutedForeground: 'hsl(215, 20%, 65%)',
      destructive: 'hsl(0, 84%, 60%)',
      destructiveForeground: 'hsl(0, 0%, 98%)',
      ring: 'hsl(38, 92%, 50%)',
    },
    typography: {
      headingFont: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      bodyFont: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      monoFont: '"Fira Code", "Cascadia Code", monospace',
      headingSizes: {
        h1: '2.5rem',
        h2: '2rem',
        h3: '1.5rem',
        h4: '1.25rem',
      },
      fontWeights: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
    spacing: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 0 15px rgba(251, 191, 36, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 0 25px rgba(251, 191, 36, 0.15)',
    },
    borderRadius: '0.5rem',
  },
};

export const defaultTheme = 'heritageRefined';
