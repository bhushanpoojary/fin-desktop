/**
 * SplashScreen Component
 * 
 * Displays a branded splash screen during app initialization.
 * 
 * Features:
 * - Centered logo, product name, and tagline
 * - Status text for loading feedback
 * - Fade-in/fade-out animations
 * - Uses branding colors and assets
 * 
 * Customization:
 * Customers can override the splash screen implementation by:
 * 1. Providing an ISplashProvider in /extensions
 * 2. Replacing this component with a custom implementation
 * 3. Modifying the splash styles in SplashScreen.css
 * 
 * @example
 * ```tsx
 * <SplashScreen
 *   branding={brandingInstance}
 *   statusText="Loading workspace..."
 * />
 * ```
 */

import React from 'react';
import type { IProductBranding } from '../core/interfaces/IProductBranding';
import './SplashScreen.css';

export interface SplashScreenProps {
  /**
   * Product branding configuration
   */
  branding: IProductBranding;

  /**
   * Optional status message to display (e.g., "Loading workspace...", "Connecting to bus...")
   */
  statusText?: string;

  /**
   * Optional className for custom styling
   */
  className?: string;

  /**
   * Controls the visibility state for fade animations
   * @default true
   */
  isVisible?: boolean;
}

/**
 * SplashScreen displays a full-screen branded loading screen
 * 
 * NOTE: Customers can override the default splash implementation by providing
 * an ISplashProvider or replacing this component from /extensions.
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({
  branding,
  statusText = 'Initializing...',
  className = '',
  isVisible = true,
}) => {
  const brandColors = branding.getBrandColors();
  const logoUrl = branding.getLogoUrl();
  const productName = branding.getProductName();
  const tagline = branding.getTagline();

  // Expose brand colors to CSS so glows/gradients can use them.
  const containerStyle = {
    ['--brand-primary']: brandColors.primary,
    ['--brand-accent']: brandColors.accent,
  } as React.CSSProperties;

  return (
    <div
      className={`splash-screen ${isVisible ? 'is-visible' : ''} ${className}`}
      style={containerStyle}
      role="alert"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="splash-aurora" aria-hidden="true" />
      <div className="splash-grid" aria-hidden="true" />

      <div className="splash-content">
        <div className="splash-logo-container">
          <span className="splash-logo-ring" aria-hidden="true" />
          <span className="splash-logo-glow" aria-hidden="true" />
          <img src={logoUrl} alt={`${productName} logo`} className="splash-logo" />
        </div>

        <h1 className="splash-product-name">{productName}</h1>

        {tagline && <p className="splash-tagline">{tagline}</p>}

        <div className="splash-status">
          <div className="splash-progress" aria-hidden="true">
            <div className="splash-progress-bar" />
          </div>
          <p className="splash-status-text">{statusText}</p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
