/**
 * Custom Themes Configuration
 * 
 * This file is where you define and register custom themes for FinDesktop.
 * These themes are merged into FinDesktopConfig and automatically picked up
 * by the ThemeProvider.
 * 
 * ## How to Add Custom Themes
 * 
 * 1. Define your theme objects following the Theme interface
 * 2. Add them to the customThemes registry below
 * 3. They will be automatically available in the theme switcher
 * 
 * ## Theme Design Guidelines
 * 
 * - **Light themes**: Use light backgrounds (#ffffff, #f5f5f5) with dark text
 * - **Dark themes**: Use dark backgrounds (#0a0a0a, #1a1a1a) with light text
 * - **Contrast**: Ensure sufficient contrast between text and background (WCAG AA: 4.5:1)
 * - **Consistency**: Use consistent spacing patterns (density) across similar themes
 * - **Accessibility**: Test themes with screen readers and high contrast modes
 * 
 * ## Density Guidelines
 * 
 * - **sd** (Standard Definition): Compact UI, high information density, ideal for traders
 * - **hd** (High Definition): Balanced spacing, comfortable for general use
 * - **uhd** (Ultra High Definition): Spacious UI, large touch targets, good for accessibility
 */

import type { ThemeRegistry } from '../core/theme/ThemeTypes';

/**
 * Custom Themes for FinDesktop
 * 
 * Add your custom themes here. Each theme should have:
 * - name: Unique identifier (used in code and localStorage)
 * - displayName: User-friendly name (shown in UI)
 * - palette: Complete color scheme
 * - density: UI spacing level
 * - borderRadius: Roundness of corners (0 = sharp, 8 = rounded)
 */
export const customThemes: ThemeRegistry = {
  /**
   * Light Theme - Clean, professional light mode
   */
  light: {
    name: 'light',
    displayName: 'Light Mode',
    palette: {
      background: '#ffffff',
      surface: '#f5f5f5',
      primary: '#3b82f6',      // Blue
      accent: '#8b5cf6',       // Purple
      text: '#171717',
      textSecondary: '#737373',
      danger: '#ef4444',       // Red
      success: '#10b981',      // Green
      warning: '#f59e0b',      // Amber
      info: '#3b82f6',         // Blue
      border: '#e5e5e5',
    },
    density: 'hd',
    borderRadius: 4,
    fontFamily: 'Inter, system-ui, sans-serif',
    metadata: {
      description: 'Clean and professional light theme for daytime trading',
      tags: ['light', 'professional', 'default'],
    },
  },

  /**
   * Dark Theme - Modern dark mode with good contrast
   */
  dark: {
    name: 'dark',
    displayName: 'Dark Mode',
    palette: {
      background: '#0a0a0a',
      surface: '#1a1a1a',
      primary: '#3b82f6',      // Blue
      accent: '#8b5cf6',       // Purple
      text: '#e5e5e5',
      textSecondary: '#737373',
      danger: '#ef4444',       // Red
      success: '#10b981',      // Green
      warning: '#f59e0b',      // Amber
      info: '#3b82f6',         // Blue
      border: '#262626',
    },
    density: 'hd',
    borderRadius: 4,
    fontFamily: 'Inter, system-ui, sans-serif',
    metadata: {
      description: 'Modern dark theme with excellent contrast for extended use',
      tags: ['dark', 'modern', 'default'],
    },
  },

  /**
   * Terminal Theme - Classic terminal/Bloomberg style
   * High information density, sharp corners, monospace font
   */
  terminal: {
    name: 'terminal',
    displayName: 'Terminal',
    palette: {
      background: '#000000',
      surface: '#0a1a0a',
      primary: '#00ff00',      // Bright green
      accent: '#00ffff',       // Cyan
      text: '#00ff00',         // Green text
      textSecondary: '#00aa00',
      danger: '#ff0000',       // Red
      success: '#00ff00',      // Green
      warning: '#ffff00',      // Yellow
      info: '#00ffff',         // Cyan
      border: '#003300',
    },
    density: 'sd',              // Compact for high information density
    borderRadius: 0,            // Sharp corners like classic terminals
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    metadata: {
      description: 'Classic terminal theme inspired by Bloomberg terminals',
      tags: ['dark', 'terminal', 'compact', 'trader'],
    },
  },

  /**
   * Finance Green Theme - Sophisticated green-based theme for traders
   */
  financeGreen: {
    name: 'financeGreen',
    displayName: 'Finance Green',
    palette: {
      background: '#0a1410',
      surface: '#132620',
      primary: '#10b981',      // Emerald green
      accent: '#34d399',       // Light green
      text: '#ecfdf5',
      textSecondary: '#86efac',
      danger: '#f87171',       // Soft red
      success: '#10b981',      // Green
      warning: '#fbbf24',      // Gold
      info: '#60a5fa',         // Blue
      border: '#1a3a2a',
    },
    density: 'hd',
    borderRadius: 6,
    fontFamily: 'Inter, system-ui, sans-serif',
    metadata: {
      description: 'Sophisticated green theme optimized for financial data',
      tags: ['dark', 'green', 'finance', 'trader'],
    },
  },

  /**
   * Blue Professional Theme - Corporate blue theme
   */
  blueProfessional: {
    name: 'blueProfessional',
    displayName: 'Blue Professional',
    palette: {
      background: '#0f1729',
      surface: '#1e293b',
      primary: '#3b82f6',      // Blue
      accent: '#60a5fa',       // Light blue
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      danger: '#ef4444',
      success: '#10b981',
      warning: '#f59e0b',
      info: '#3b82f6',
      border: '#334155',
    },
    density: 'hd',
    borderRadius: 4,
    fontFamily: 'Inter, system-ui, sans-serif',
    metadata: {
      description: 'Professional blue theme for corporate environments',
      tags: ['dark', 'blue', 'professional', 'corporate'],
    },
  },

  /**
   * High Contrast Theme - Maximum contrast for accessibility
   */
  highContrast: {
    name: 'highContrast',
    displayName: 'High Contrast',
    palette: {
      background: '#000000',
      surface: '#1a1a1a',
      primary: '#ffffff',
      accent: '#ffff00',       // Yellow
      text: '#ffffff',
      textSecondary: '#cccccc',
      danger: '#ff0000',
      success: '#00ff00',
      warning: '#ffff00',
      info: '#00ffff',
      border: '#ffffff',
    },
    density: 'uhd',             // Spacious for accessibility
    borderRadius: 2,
    fontFamily: 'Inter, system-ui, sans-serif',
    metadata: {
      description: 'Maximum contrast theme for accessibility and low vision',
      tags: ['dark', 'accessible', 'high-contrast'],
    },
  },
};

/**
 * Default theme name
 * Used as fallback if no theme is selected
 */
export const DEFAULT_THEME_NAME = 'dark';

/**
 * Export individual themes for direct imports
 */
export const {
  light: lightTheme,
  dark: darkTheme,
  terminal: terminalTheme,
  financeGreen: financeGreenTheme,
  blueProfessional: blueProfessionalTheme,
  highContrast: highContrastTheme,
} = customThemes;
