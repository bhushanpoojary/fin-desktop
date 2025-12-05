/**
 * DefaultThemeProvider
 * 
 * Default implementation of IThemeProvider for FinDesktop.
 * This provides light and dark theme support.
 * 
 * Customers can extend or replace this with their own implementation.
 */

import type { IThemeProvider, Theme } from '../interfaces/IThemeProvider';

export class DefaultThemeProvider implements IThemeProvider {
  private themes: Map<string, Theme> = new Map();
  private currentThemeId: string = 'light';
  private listeners: Set<(theme: Theme) => void> = new Set();

  async initialize(): Promise<void> {
    console.log('DefaultThemeProvider initialized');
    
    // Register default themes
    this.registerTheme(this.createLightTheme());
    this.registerTheme(this.createDarkTheme());

    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme_preference');
    if (savedTheme && this.themes.has(savedTheme)) {
      this.currentThemeId = savedTheme;
    } else {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentThemeId = prefersDark ? 'dark' : 'light';
    }

    // Apply the current theme
    this.applyTheme(this.getCurrentTheme());
  }

  getCurrentTheme(): Theme {
    return this.themes.get(this.currentThemeId) || this.createLightTheme();
  }

  setTheme(themeId: string): void {
    if (this.themes.has(themeId)) {
      this.currentThemeId = themeId;
      localStorage.setItem('theme_preference', themeId);
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
    console.log('Theme registered:', theme.name);
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

    // Apply typography if provided
    if (theme.typography) {
      root.style.setProperty('--font-family', theme.typography.fontFamily);
      Object.entries(theme.typography.fontSize).forEach(([size, value]) => {
        root.style.setProperty(`--font-size-${size}`, value);
      });
    }

    // Apply spacing if provided
    if (theme.spacing) {
      Object.entries(theme.spacing).forEach(([size, value]) => {
        root.style.setProperty(`--spacing-${size}`, value);
      });
    }

    // Set data attribute for CSS targeting
    root.setAttribute('data-theme', theme.id);

    console.log('Theme applied:', theme.name);
  }

  private notifyListeners(theme: Theme): void {
    this.listeners.forEach((listener) => listener(theme));
  }

  private createLightTheme(): Theme {
    return {
      id: 'light',
      name: 'Light',
      description: 'Default light theme',
      colors: {
        primary: '#0066cc',
        secondary: '#6c757d',
        background: '#ffffff',
        surface: '#f8f9fa',
        error: '#dc3545',
        warning: '#ffc107',
        success: '#28a745',
        info: '#17a2b8',
        text: '#212529',
        textSecondary: '#6c757d',
        border: '#dee2e6',
      },
      typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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

  private createDarkTheme(): Theme {
    return {
      id: 'dark',
      name: 'Dark',
      description: 'Default dark theme',
      colors: {
        primary: '#4da6ff',
        secondary: '#adb5bd',
        background: '#1a1a1a',
        surface: '#2d2d2d',
        error: '#ff6b6b',
        warning: '#ffd93d',
        success: '#51cf66',
        info: '#4dabf7',
        text: '#f8f9fa',
        textSecondary: '#adb5bd',
        border: '#495057',
      },
      typography: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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
}
