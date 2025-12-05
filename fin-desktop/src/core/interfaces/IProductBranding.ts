/**
 * IProductBranding Interface
 * 
 * Public extension contract – do not break without major version bump.
 * 
 * This interface defines the product branding contract for FinDesktop.
 * Implement this interface to customize the look and feel of your FinDesktop instance.
 */

export interface IProductBranding {
  /**
   * Get the product name
   */
  getProductName(): string;

  /**
   * Get the product logo URL
   */
  getLogoUrl(): string;

  /**
   * Get the small logo/icon URL (for navigation, etc.)
   */
  getIconUrl(): string;

  /**
   * Get the product tagline/description
   */
  getTagline(): string;

  /**
   * Get the company name
   */
  getCompanyName(): string;

  /**
   * Get the product version
   */
  getVersion(): string;

  /**
   * Get copyright text
   */
  getCopyright(): string;

  /**
   * Get support/help URL
   */
  getSupportUrl(): string;

  /**
   * Get documentation URL
   */
  getDocumentationUrl(): string;

  /**
   * Get brand colors
   */
  getBrandColors(): BrandColors;

  /**
   * Get custom CSS classes for theming
   */
  getCustomClasses(): BrandingClasses;

  /**
   * Get footer configuration
   */
  getFooterConfig(): FooterConfig;

  /**
   * Get system tray icon path
   * @returns Absolute or relative path to the tray icon image
   */
  getTrayIconPath(): string;

  /**
   * Get system tray tooltip text
   * @returns Tooltip text displayed when hovering over the tray icon
   */
  getTrayTooltip(): string;
}

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

export interface BrandingClasses {
  header?: string;
  sidebar?: string;
  content?: string;
  footer?: string;
}

export interface FooterConfig {
  showCopyright: boolean;
  showVersion: boolean;
  customLinks?: FooterLink[];
}

export interface FooterLink {
  label: string;
  url: string;
  external?: boolean;
}
