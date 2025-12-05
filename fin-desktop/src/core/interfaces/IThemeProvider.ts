/**
 * IThemeProvider Interface
 * 
 * Public extension contract – do not break without major version bump.
 * 
 * This interface defines the theming contract for FinDesktop.
 * Implement this interface to provide custom themes and styling.
 */

export interface IThemeProvider {
  /**
   * Initialize the theme provider
   */
  initialize(): Promise<void>;

  /**
   * Get the current theme
   */
  getCurrentTheme(): Theme;

  /**
   * Set the active theme
   * @param themeId Theme identifier
   */
  setTheme(themeId: string): void;

  /**
   * Get all available themes
   */
  getAvailableThemes(): Theme[];

  /**
   * Register a custom theme
   * @param theme Theme configuration
   */
  registerTheme(theme: Theme): void;

  /**
   * Subscribe to theme changes
   * @param callback Function to call when theme changes
   * @returns Unsubscribe function
   */
  onThemeChange(callback: (theme: Theme) => void): () => void;

  /**
   * Get a specific color from the current theme
   * @param key Color key
   */
  getColor(key: string): string;

  /**
   * Apply theme to the document
   */
  applyTheme(theme: Theme): void;
}

export interface Theme {
  id: string;
  name: string;
  description?: string;
  colors: ThemeColors;
  typography?: ThemeTypography;
  spacing?: ThemeSpacing;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  error: string;
  warning: string;
  success: string;
  info: string;
  text: string;
  textSecondary: string;
  border: string;
  [key: string]: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSize: {
    small: string;
    medium: string;
    large: string;
    xlarge: string;
  };
  fontWeight: {
    light: number;
    regular: number;
    medium: number;
    bold: number;
  };
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}
