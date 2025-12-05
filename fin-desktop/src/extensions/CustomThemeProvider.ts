/**
 * CustomThemeProvider - Customer Extension Example
 * 
 * ⚠️ SAFE CUSTOMIZATION ZONE ⚠️
 * 
 * Users can modify anything under /extensions without fear of git pulls overwriting it.
 * This folder is meant for customer-specific customizations.
 * 
 * This is an example implementation of IThemeProvider that demonstrates
 * how to add custom themes to your FinDesktop instance.
 * 
 * Common use cases:
 * - Corporate brand colors
 * - High contrast themes for accessibility
 * - Multiple theme variants (light/dark/auto)
 * - Department-specific color schemes
 */

import type { IThemeProvider, Theme } from '../core/interfaces/IThemeProvider';

export class CustomThemeProvider implements IThemeProvider {
  private themes: Map<string, Theme> = new Map();
  private currentThemeId: string = 'corporate-light';
  private listeners: Set<(theme: Theme) => void> = new Set();

  async initialize(): Promise<void> {
    console.log('CustomThemeProvider initialized');
    
    // Register your custom themes
    this.registerTheme(this.createCorporateLightTheme());
    this.registerTheme(this.createCorporateDarkTheme());
    this.registerTheme(this.createHighContrastTheme());

    // Load saved theme preference
    const savedTheme = localStorage.getItem('custom_theme_preference');
    if (savedTheme && this.themes.has(savedTheme)) {
      this.currentThemeId = savedTheme;
    }

    // Apply the current theme
    this.applyTheme(this.getCurrentTheme());
  }

  getCurrentTheme(): Theme {
    return this.themes.get(this.currentThemeId) || this.createCorporateLightTheme();
  }

  setTheme(themeId: string): void {
    if (this.themes.has(themeId)) {
      this.currentThemeId = themeId;
      localStorage.setItem('custom_theme_preference', themeId);
      const theme = this.getCurrentTheme();
      this.applyTheme(theme);
      this.notifyListeners(theme);
    }
  }

  getAvailableThemes(): Theme[] {
    return Array.from(this.themes.values());
  }

  registerTheme(theme: Theme): void {
    this.themes.set(theme.id, theme);
    console.log('Custom theme registered:', theme.name);
  }

  onThemeChange(callback: (theme: Theme) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  getColor(key: string): string {
    const theme = this.getCurrentTheme();
    return theme.colors[key] || '#000000';
  }

  applyTheme(theme: Theme): void {
    const root = document.documentElement;

    // Apply color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Apply typography
    if (theme.typography) {
      root.style.setProperty('--font-family', theme.typography.fontFamily);
      Object.entries(theme.typography.fontSize).forEach(([size, value]) => {
        root.style.setProperty(`--font-size-${size}`, value);
      });
    }

    // Apply spacing
    if (theme.spacing) {
      Object.entries(theme.spacing).forEach(([size, value]) => {
        root.style.setProperty(`--spacing-${size}`, value);
      });
    }

    root.setAttribute('data-theme', theme.id);
    console.log('Custom theme applied:', theme.name);
  }

  private notifyListeners(theme: Theme): void {
    this.listeners.forEach((listener) => listener(theme));
  }

  // TODO: Customize these themes with your brand colors
  private createCorporateLightTheme(): Theme {
    return {
      id: 'corporate-light',
      name: 'Corporate Light',
      description: 'Custom corporate light theme',
      colors: {
        primary: '#1e40af',        // Your primary brand color
        secondary: '#64748b',      // Secondary brand color
        background: '#f8fafc',     // Light background
        surface: '#ffffff',        // Card/surface color
        error: '#dc2626',          // Error red
        warning: '#f59e0b',        // Warning amber
        success: '#059669',        // Success green
        info: '#0284c7',           // Info blue
        text: '#0f172a',           // Text color
        textSecondary: '#475569',  // Secondary text
        border: '#cbd5e1',         // Border color
      },
      typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: {
          small: '0.875rem',
          medium: '1rem',
          large: '1.25rem',
          xlarge: '1.5rem',
        },
        fontWeight: {
          light: 300,
          regular: 400,
          medium: 500,
          bold: 700,
        },
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
      },
    };
  }

  private createCorporateDarkTheme(): Theme {
    return {
      id: 'corporate-dark',
      name: 'Corporate Dark',
      description: 'Custom corporate dark theme',
      colors: {
        primary: '#60a5fa',        // Lighter primary for dark mode
        secondary: '#94a3b8',      // Lighter secondary
        background: '#0f172a',     // Dark background
        surface: '#1e293b',        // Dark surface
        error: '#ef4444',          // Brighter error
        warning: '#fbbf24',        // Brighter warning
        success: '#10b981',        // Brighter success
        info: '#38bdf8',           // Brighter info
        text: '#f1f5f9',           // Light text
        textSecondary: '#cbd5e1',  // Secondary text
        border: '#334155',         // Dark border
      },
      typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: {
          small: '0.875rem',
          medium: '1rem',
          large: '1.25rem',
          xlarge: '1.5rem',
        },
        fontWeight: {
          light: 300,
          regular: 400,
          medium: 500,
          bold: 700,
        },
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
      },
    };
  }

  private createHighContrastTheme(): Theme {
    return {
      id: 'high-contrast',
      name: 'High Contrast',
      description: 'High contrast theme for accessibility',
      colors: {
        primary: '#0000ff',        // Pure blue
        secondary: '#808080',      // Gray
        background: '#000000',     // Pure black
        surface: '#1a1a1a',        // Near black
        error: '#ff0000',          // Pure red
        warning: '#ffff00',        // Pure yellow
        success: '#00ff00',        // Pure green
        info: '#00ffff',           // Cyan
        text: '#ffffff',           // Pure white
        textSecondary: '#cccccc',  // Light gray
        border: '#ffffff',         // White border
      },
      typography: {
        fontFamily: '"Arial", sans-serif',
        fontSize: {
          small: '0.875rem',
          medium: '1rem',
          large: '1.25rem',
          xlarge: '1.5rem',
        },
        fontWeight: {
          light: 400,
          regular: 400,
          medium: 700,
          bold: 700,
        },
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
      },
    };
  }
}
