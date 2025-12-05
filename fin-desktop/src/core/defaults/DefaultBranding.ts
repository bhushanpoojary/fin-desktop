/**
 * DefaultBranding
 * 
 * Default implementation of IProductBranding for FinDesktop.
 * This provides the default FinDesktop branding.
 * 
 * Customers should override this with their own branding.
 */

import type { IProductBranding, BrandColors, BrandingClasses, FooterConfig } from '../interfaces/IProductBranding';

export class DefaultBranding implements IProductBranding {
  getProductName(): string {
    return 'FinDesktop';
  }

  getLogoUrl(): string {
    return '/logo.svg';
  }

  getIconUrl(): string {
    return '/icon.svg';
  }

  getTagline(): string {
    return 'The Ultimate Financial Desktop Platform';
  }

  getCompanyName(): string {
    return 'FinDesktop Inc.';
  }

  getVersion(): string {
    return '1.0.0';
  }

  getCopyright(): string {
    const year = new Date().getFullYear();
    return `© ${year} ${this.getCompanyName()}. All rights reserved.`;
  }

  getSupportUrl(): string {
    return 'https://findesktop.io/support';
  }

  getDocumentationUrl(): string {
    return 'https://findesktop.io/docs';
  }

  getBrandColors(): BrandColors {
    return {
      primary: '#0066cc',
      secondary: '#6c757d',
      accent: '#17a2b8',
      background: '#ffffff',
    };
  }

  getCustomClasses(): BrandingClasses {
    return {
      header: 'findesktop-header',
      sidebar: 'findesktop-sidebar',
      content: 'findesktop-content',
      footer: 'findesktop-footer',
    };
  }

  getFooterConfig(): FooterConfig {
    return {
      showCopyright: true,
      showVersion: true,
      customLinks: [
        { label: 'Privacy Policy', url: 'https://findesktop.io/privacy', external: true },
        { label: 'Terms of Service', url: 'https://findesktop.io/terms', external: true },
        { label: 'Support', url: this.getSupportUrl(), external: true },
      ],
    };
  }
}
