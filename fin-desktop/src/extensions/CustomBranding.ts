/**
 * CustomBranding - Customer Extension Example
 * 
 * ⚠️ SAFE CUSTOMIZATION ZONE ⚠️
 * 
 * Users can modify anything under /extensions without fear of git pulls overwriting it.
 * This folder is meant for customer-specific customizations.
 * 
 * This is an example implementation of IProductBranding that demonstrates
 * how to customize the branding of your FinDesktop instance.
 * 
 * To use this:
 * 1. Modify the values below to match your company's branding
 * 2. Update src/config/FinDesktopConfig.ts to use this custom branding
 */

import type { IProductBranding, BrandColors, BrandingClasses, FooterConfig } from '../core/interfaces/IProductBranding';

export class CustomBranding implements IProductBranding {
  getProductName(): string {
    // TODO: Replace with your product name
    return 'My Custom FinDesktop';
  }

  getLogoUrl(): string {
    // TODO: Replace with your logo URL
    return '/custom-logo.svg';
  }

  getIconUrl(): string {
    // TODO: Replace with your icon URL
    return '/custom-icon.svg';
  }

  getTagline(): string {
    // TODO: Replace with your tagline
    return 'Your Custom Financial Platform';
  }

  getCompanyName(): string {
    // TODO: Replace with your company name
    return 'My Company Inc.';
  }

  getVersion(): string {
    // TODO: Update version as needed
    return '1.0.0';
  }

  getCopyright(): string {
    const year = new Date().getFullYear();
    return `© ${year} ${this.getCompanyName()}. All rights reserved.`;
  }

  getSupportUrl(): string {
    // TODO: Replace with your support URL
    return 'https://mycompany.com/support';
  }

  getDocumentationUrl(): string {
    // TODO: Replace with your documentation URL
    return 'https://mycompany.com/docs';
  }

  getBrandColors(): BrandColors {
    // TODO: Customize your brand colors
    return {
      primary: '#1e40af',      // Deep blue
      secondary: '#64748b',    // Slate gray
      accent: '#f59e0b',       // Amber
      background: '#ffffff',   // White
    };
  }

  getCustomClasses(): BrandingClasses {
    // TODO: Add your custom CSS class names
    return {
      header: 'custom-header',
      sidebar: 'custom-sidebar',
      content: 'custom-content',
      footer: 'custom-footer',
    };
  }

  getFooterConfig(): FooterConfig {
    return {
      showCopyright: true,
      showVersion: true,
      customLinks: [
        { label: 'About Us', url: 'https://mycompany.com/about', external: true },
        { label: 'Privacy', url: 'https://mycompany.com/privacy', external: true },
        { label: 'Contact', url: 'https://mycompany.com/contact', external: true },
      ],
    };
  }
}
