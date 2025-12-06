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

// Import custom themes
import { customThemes } from '../extensions/themes.config';

// Import types
import type { IAuthProvider } from '../core/interfaces/IAuthProvider';
import type { INotificationProvider } from '../core/interfaces/INotificationProvider';
import type { IThemeProvider } from '../core/interfaces/IThemeProvider';
import type { IChannelProvider } from '../core/interfaces/IChannelProvider';
import type { IProductBranding } from '../core/interfaces/IProductBranding';
import type { Notification, NotificationAction } from '../core/notifications/NotificationTypes';
import type { ThemeRegistry } from '../core/theme/ThemeTypes';
import type { AppDefinition } from '../core/fdc3/Fdc3AppDirectory';

/**
 * Notification Action Handler
 * Callback function invoked when a notification action button is clicked
 */
export type NotificationActionHandler = (
  notification: Notification,
  action: NotificationAction
) => void;

/**
 * Notification Actions Map
 * Maps action IDs to their handler functions
 */
export interface NotificationActionsMap {
  [actionId: string]: NotificationActionHandler;
}

/**
 * Window Docking Configuration
 * Controls OS-level window snapping behavior for FinDesktop windows
 */
export interface WindowDockingConfig {
  /**
   * Enable or disable window docking/snapping
   * @default true
   */
  dockingEnabled: boolean;
  
  /**
   * Distance in pixels from screen edge to trigger docking
   * @default 10
   */
  edgeThreshold: number;
}

export interface FinDesktopConfig {
  authProvider: IAuthProvider;
  notificationProvider: INotificationProvider;
  themeProvider: IThemeProvider;
  channelProvider: IChannelProvider;
  branding: IProductBranding;
  notificationActions?: NotificationActionsMap;
  windowDocking?: WindowDockingConfig;
  themes?: ThemeRegistry;
  appDirectory?: AppDefinition[];
}

/**
 * Default Notification Actions
 * Provides basic handlers for common notification actions
 */
export const DefaultNotificationActions: NotificationActionsMap = {
  "DISMISS": (notification) => {
    console.log("Notification dismissed:", notification.id);
  },
  "VIEW_DETAILS": (notification) => {
    console.log("View details for notification:", notification.id);
  },
};

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

  // Notification action handlers (can be overridden in extensions)
  notificationActions: DefaultNotificationActions,

  // Window docking configuration
  windowDocking: {
    dockingEnabled: true,
    edgeThreshold: 10,
  },

  // Theme registry - custom themes from extensions
  themes: customThemes,
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

/**
 * FDC3 App Directory Configuration
 * 
 * Defines the applications that can handle FDC3 intents.
 * Each app definition specifies which intents it can handle and whether it's the default handler.
 */
export const appDirectory: AppDefinition[] = [
  {
    id: "chartApp",
    title: "Price Chart",
    componentId: "ChartApp",
    intents: ["ViewChart"],
    isDefaultForIntent: ["ViewChart"],
  },
  {
    id: "newsApp",
    title: "Market News",
    componentId: "NewsApp",
    intents: ["ViewNews"],
    isDefaultForIntent: ["ViewNews"],
  },
  {
    id: "tradeTicketApp",
    title: "Trade Ticket",
    componentId: "TradeTicketApp",
    intents: ["Trade", "ViewChart"],
    isDefaultForIntent: ["Trade"],
  },
  {
    id: "liveMarketApp",
    title: "Live Market Data",
    componentId: "LiveMarketApp",
    intents: ["ViewChart", "ViewNews"],
  },
  {
    id: "orderTicketApp",
    title: "Order Ticket",
    componentId: "OrderTicketApp",
    intents: ["Trade"],
  },
];

// Add app directory to the config
finDesktopConfig.appDirectory = appDirectory;
