/**
 * FinDesktop Configuration
 * 
 * ⚠️ CUSTOMER CONFIGURATION FILE ⚠️
 * 
 * This is the main configuration file where you wire up your custom providers.
 * This file is safe to modify - it's where you choose between default and custom implementations.
 * 
 * ## How This Works
 * 
 * 1. Import the default providers from core
 * 2. Import your custom providers from extensions
 * 3. Choose which implementation to use for each provider
 * 4. Export the final configuration
 * 
 * ## Upgrade Strategy
 * 
 * When pulling updates from the core FinDesktop repository:
 * - Core files (src/core/**) will be updated
 * - Your extensions (src/extensions/**) remain untouched
 * - This config file may have merge conflicts, but they're easy to resolve
 * 
 * ## Switching Between Default and Custom
 * 
 * To use defaults:
 *   branding: new DefaultBranding()
 * 
 * To use custom:
 *   branding: new CustomBranding()
 * 
 * To conditionally switch based on environment:
 *   branding: process.env.USE_CUSTOM_BRANDING === 'true' 
 *     ? new CustomBranding() 
 *     : new DefaultBranding()
 */

// Import default providers
import {
  // DefaultAuthProvider,      // Uncomment to use default auth
  DefaultNotificationProvider,
  // DefaultThemeProvider,      // Uncomment to use default theme
  DefaultChannelProvider,
  // DefaultBranding,           // Uncomment to use default branding
} from '../core/defaults';

// Import custom providers
import {
  CustomBranding,
  CustomAuthProvider,
  CustomThemeProvider,
} from '../extensions';

// Import types
import type { IAuthProvider } from '../core/interfaces/IAuthProvider';
import type { INotificationProvider } from '../core/interfaces/INotificationProvider';
import type { IThemeProvider } from '../core/interfaces/IThemeProvider';
import type { IChannelProvider } from '../core/interfaces/IChannelProvider';
import type { IProductBranding } from '../core/interfaces/IProductBranding';

export interface FinDesktopConfig {
  authProvider: IAuthProvider;
  notificationProvider: INotificationProvider;
  themeProvider: IThemeProvider;
  channelProvider: IChannelProvider;
  branding: IProductBranding;
}

/**
 * Main FinDesktop Configuration
 * 
 * TODO: Customize this configuration to use your custom providers
 * 
 * Current setup uses a mix of custom and default providers as an example.
 * Modify as needed for your deployment.
 */
export const finDesktopConfig: FinDesktopConfig = {
  // Custom branding - replace DefaultBranding with CustomBranding when ready
  branding: new CustomBranding(), // or new DefaultBranding()

  // Custom authentication - replace with your auth system
  authProvider: new CustomAuthProvider(), // or new DefaultAuthProvider()

  // Custom theming - replace with your themes
  themeProvider: new CustomThemeProvider(), // or new DefaultThemeProvider()

  // Using default implementations for these (customize as needed)
  notificationProvider: new DefaultNotificationProvider(),
  channelProvider: new DefaultChannelProvider(),
};

/**
 * Helper function to get the current configuration
 */
export function getFinDesktopConfig(): FinDesktopConfig {
  return finDesktopConfig;
}

/**
 * Helper function to create a custom configuration at runtime
 * Useful for testing or environment-specific configurations
 */
export function createCustomConfig(overrides: Partial<FinDesktopConfig>): FinDesktopConfig {
  return {
    ...finDesktopConfig,
    ...overrides,
  };
}
