/**
 * Theme Types for FinDesktop
 * 
 * This module defines the core theme structure used throughout the application.
 * Themes control visual appearance including colors, spacing, and density.
 * 
 * ## Usage
 * 
 * Themes are registered in extensions/themes.config.ts and provided to the app
 * via FinDesktopConfig. The ThemeManager converts theme values to CSS variables
 * that components can reference.
 * 
 * ## Extending Themes
 * 
 * To add custom themes, create theme objects in extensions/themes.config.ts:
 * 
 * ```typescript
 * export const customThemes: ThemeRegistry = {
 *   light: { name: "light", palette: {...}, density: "hd", borderRadius: 4 },
 *   dark: { name: "dark", palette: {...}, density: "hd", borderRadius: 4 },
 *   terminal: { name: "terminal", palette: {...}, density: "sd", borderRadius: 0 },
 *   financeGreen: { name: "financeGreen", palette: {...}, density: "hd", borderRadius: 6 },
 * };
 * ```
 */

/**
 * Color palette for a theme
 * 
 * Defines all color values used throughout the application.
 * Colors should be valid CSS color values (hex, rgb, hsl, etc.)
 */
export interface ThemePalette {
  /**
   * Primary background color
   * Used for main app background, typically the darkest/lightest color
   * @example "#0a0a0a" (dark) or "#ffffff" (light)
   */
  background: string;

  /**
   * Surface color for elevated elements
   * Used for cards, panels, modals - slightly lighter/darker than background
   * @example "#1a1a1a" (dark) or "#f5f5f5" (light)
   */
  surface: string;

  /**
   * Primary brand/action color
   * Used for primary buttons, links, active states
   * @example "#3b82f6" (blue) or "#10b981" (green)
   */
  primary: string;

  /**
   * Accent color for highlights and emphasis
   * Used for selected items, focus rings, highlights
   * @example "#8b5cf6" (purple) or "#f59e0b" (amber)
   */
  accent: string;

  /**
   * Primary text color
   * Used for body text, headings
   * @example "#e5e5e5" (dark theme) or "#171717" (light theme)
   */
  text: string;

  /**
   * Danger/error color
   * Used for error messages, destructive actions, alerts
   * @example "#ef4444" (red)
   */
  danger: string;

  /**
   * Success/positive color
   * Used for success messages, positive indicators, completed states
   * @example "#10b981" (green)
   */
  success: string;

  /**
   * Border color (optional)
   * Used for dividers, borders, outlines
   * If not specified, derived from surface or text with opacity
   * @example "#262626" (dark) or "#e5e5e5" (light)
   */
  border?: string;

  /**
   * Warning color (optional)
   * Used for warning messages, caution indicators
   * @example "#f59e0b" (amber)
   */
  warning?: string;

  /**
   * Info color (optional)
   * Used for informational messages, hints
   * @example "#3b82f6" (blue)
   */
  info?: string;

  /**
   * Muted/secondary text color (optional)
   * Used for secondary text, placeholders, disabled states
   * @example "#737373" (gray)
   */
  textSecondary?: string;
}

/**
 * Display density setting
 * 
 * Controls spacing, padding, and component sizes throughout the UI
 * - "sd" (Standard Definition): Compact, high information density
 * - "hd" (High Definition): Balanced, comfortable spacing
 * - "uhd" (Ultra High Definition): Spacious, large touch targets
 */
export type ThemeDensity = "sd" | "hd" | "uhd";

/**
 * Complete theme definition
 * 
 * A theme defines all visual parameters for the application including
 * colors, spacing, and shape. Themes are applied globally via CSS variables.
 */
export interface Theme {
  /**
   * Unique theme identifier
   * Used for theme selection and persistence
   * @example "light", "dark", "terminal", "financeGreen"
   */
  name: string;

  /**
   * Display name for UI (optional)
   * Shown in theme picker, defaults to `name` if not provided
   * @example "Light Mode", "Dark Mode", "Terminal Green"
   */
  displayName?: string;

  /**
   * Color palette
   * Defines all colors used in the theme
   */
  palette: ThemePalette;

  /**
   * UI density
   * Controls spacing and component sizes
   * @default "hd"
   */
  density: ThemeDensity;

  /**
   * Border radius in pixels
   * Applied to buttons, cards, inputs, and other elements
   * @example 4 (rounded), 0 (sharp), 8 (very rounded)
   */
  borderRadius: number;

  /**
   * Font family (optional)
   * Override default font family for this theme
   * @example "Inter, sans-serif" or "'JetBrains Mono', monospace"
   */
  fontFamily?: string;

  /**
   * Additional metadata (optional)
   * Can include theme author, version, description, etc.
   */
  metadata?: {
    author?: string;
    version?: string;
    description?: string;
    tags?: string[];
  };
}

/**
 * Theme Registry
 * 
 * A collection of themes keyed by their name.
 * Used in FinDesktopConfig to register all available themes.
 * 
 * @example
 * ```typescript
 * const themes: ThemeRegistry = {
 *   light: { name: "light", ... },
 *   dark: { name: "dark", ... },
 *   terminal: { name: "terminal", ... },
 * };
 * ```
 */
export interface ThemeRegistry {
  [name: string]: Theme;
}

/**
 * Theme name type helper
 * Extract theme names from a registry for type safety
 */
export type ThemeName<T extends ThemeRegistry> = keyof T & string;

/**
 * CSS Variable mapping
 * Defines how theme properties map to CSS custom properties
 */
export const CSS_VARIABLES = {
  // Colors
  background: '--fd-bg',
  surface: '--fd-surface',
  primary: '--fd-primary',
  accent: '--fd-accent',
  text: '--fd-text',
  danger: '--fd-danger',
  success: '--fd-success',
  border: '--fd-border',
  warning: '--fd-warning',
  info: '--fd-info',
  textSecondary: '--fd-text-secondary',

  // Shape
  borderRadius: '--fd-radius',
  
  // Density
  density: '--fd-density',
  
  // Typography
  fontFamily: '--fd-font-family',
} as const;

/**
 * Density spacing values
 * Maps density levels to actual spacing multipliers
 */
export const DENSITY_SPACING = {
  sd: 0.75,  // 75% of base spacing (compact)
  hd: 1.0,   // 100% of base spacing (comfortable)
  uhd: 1.25, // 125% of base spacing (spacious)
} as const;

/**
 * Helper type for CSS variable names
 */
export type CSSVariableName = typeof CSS_VARIABLES[keyof typeof CSS_VARIABLES];
