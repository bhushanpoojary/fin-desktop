/**
 * ThemeEngine - Core Component
 * 
 * Central theme management system using the configured IThemeProvider.
 * This is a core component - do not modify directly. Use extension points instead.
 */

import type { IThemeProvider, Theme } from '../interfaces/IThemeProvider';

export class ThemeEngine {
  private provider: IThemeProvider | null = null;
  private listeners: Set<(theme: Theme) => void> = new Set();

  /**
   * Initialize the theme engine with a provider
   */
  async initialize(provider: IThemeProvider): Promise<void> {
    this.provider = provider;
    await provider.initialize();
    console.log('ThemeEngine initialized with provider');
    
    // Subscribe to theme changes from provider
    provider.onThemeChange((theme) => {
      this.notifyListeners(theme);
    });
    
    // Apply the current theme
    const currentTheme = provider.getCurrentTheme();
    provider.applyTheme(currentTheme);
  }

  /**
   * Get the current theme
   */
  getCurrentTheme(): Theme | null {
    return this.provider?.getCurrentTheme() || null;
  }

  /**
   * Set the active theme
   */
  setTheme(themeId: string): void {
    if (this.provider) {
      this.provider.setTheme(themeId);
    }
  }

  /**
   * Get all available themes
   */
  getAvailableThemes(): Theme[] {
    return this.provider?.getAvailableThemes() || [];
  }

  /**
   * Register a custom theme
   */
  registerTheme(theme: Theme): void {
    if (this.provider) {
      this.provider.registerTheme(theme);
    }
  }

  /**
   * Subscribe to theme changes
   */
  onThemeChange(callback: (theme: Theme) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Get a color from the current theme
   */
  getColor(key: string): string | null {
    return this.provider?.getColor(key) || null;
  }

  /**
   * Notify all listeners of theme change
   */
  private notifyListeners(theme: Theme): void {
    this.listeners.forEach((listener) => listener(theme));
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const availableThemes = this.getAvailableThemes();
    const currentTheme = this.getCurrentTheme();
    
    if (availableThemes.length > 1 && currentTheme) {
      const currentIndex = availableThemes.findIndex(t => t.id === currentTheme.id);
      const nextIndex = (currentIndex + 1) % availableThemes.length;
      this.setTheme(availableThemes[nextIndex].id);
    }
  }
}
