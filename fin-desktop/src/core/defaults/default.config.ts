/**
 * Default Configuration for FinDesktop Core
 * 
 * This file wires up all the default providers for FinDesktop.
 * Customers should not modify this file directly. Instead, create
 * your own configuration in src/config/FinDesktopConfig.ts
 */

import { DefaultAuthProvider } from './DefaultAuthProvider';
import { DefaultNotificationProvider } from './DefaultNotificationProvider';
import { DefaultThemeProvider } from './DefaultThemeProvider';
import { DefaultChannelProvider } from './DefaultChannelProvider';
import { DefaultBranding } from './DefaultBranding';

import type { IAuthProvider } from '../interfaces/IAuthProvider';
import type { INotificationProvider } from '../interfaces/INotificationProvider';
import type { IThemeProvider } from '../interfaces/IThemeProvider';
import type { IChannelProvider } from '../interfaces/IChannelProvider';
import type { IProductBranding } from '../interfaces/IProductBranding';

export interface FinDesktopDefaultConfig {
  authProvider: IAuthProvider;
  notificationProvider: INotificationProvider;
  themeProvider: IThemeProvider;
  channelProvider: IChannelProvider;
  branding: IProductBranding;
}

/**
 * Default configuration with all default providers
 */
export const defaultConfig: FinDesktopDefaultConfig = {
  authProvider: new DefaultAuthProvider(),
  notificationProvider: new DefaultNotificationProvider(),
  themeProvider: new DefaultThemeProvider(),
  channelProvider: new DefaultChannelProvider(),
  branding: new DefaultBranding(),
};

/**
 * Create a custom configuration by overriding specific providers
 */
export function createConfig(
  overrides: Partial<FinDesktopDefaultConfig> = {}
): FinDesktopDefaultConfig {
  return {
    ...defaultConfig,
    ...overrides,
  };
}
