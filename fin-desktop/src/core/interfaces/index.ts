/**
 * Core Interfaces for FinDesktop
 * 
 * Public extension contracts – do not break without major version bump.
 * 
 * These interfaces form the stable API surface that customer extensions
 * can depend on. Any breaking changes to these interfaces should only
 * occur in major version releases.
 */

export * from './IAuthProvider';
export * from './INotificationProvider';
export * from './IThemeProvider';
export * from './IChannelProvider';
export * from './IProductBranding';
