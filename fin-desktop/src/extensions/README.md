/**
 * Extensions README
 * 
 * ⚠️ SAFE CUSTOMIZATION ZONE ⚠️
 * 
 * This folder is specifically designed for customer-specific customizations.
 * Files in this directory will NOT be overwritten by git pulls from the core FinDesktop repository.
 * 
 * ## What Goes Here?
 * 
 * Custom implementations of core interfaces:
 * - IAuthProvider - Custom authentication logic
 * - INotificationProvider - Custom notification systems
 * - IThemeProvider - Custom themes and branding
 * - IChannelProvider - Custom inter-app communication
 * - IProductBranding - Custom product branding
 * 
 * ## How to Use Extensions
 * 
 * 1. Create your custom implementation by implementing one of the core interfaces
 * 2. Export it from this folder's index.ts
 * 3. Wire it up in src/config/FinDesktopConfig.ts
 * 
 * ## Example: Custom Authentication
 * 
 * ```typescript
 * // 1. Create CustomAuthProvider.ts
 * import type { IAuthProvider } from '../core/interfaces';
 * 
 * export class CustomAuthProvider implements IAuthProvider {
 *   // Your implementation here
 * }
 * 
 * // 2. Export from index.ts
 * export * from './CustomAuthProvider';
 * 
 * // 3. Use in FinDesktopConfig.ts
 * import { CustomAuthProvider } from '../extensions';
 * 
 * export const finDesktopConfig = {
 *   authProvider: new CustomAuthProvider(),
 *   // ... other providers
 * };
 * ```
 * 
 * ## Git Strategy
 * 
 * Consider adding this to your .gitignore if you want to keep customizations private:
 * ```
 * # Keep core updates, ignore customer customizations
 * src/extensions/**
 * !src/extensions/README.md
 * ```
 * 
 * Or create a separate branch for customizations:
 * - main: track upstream FinDesktop core
 * - custom: your customizations in /extensions
 * 
 * ## Future: NPM Package Model
 * 
 * In the future, FinDesktop core will be published as an NPM package.
 * Your extensions folder can then live in a completely separate repository:
 * 
 * ```
 * my-findesktop-app/
 *   package.json (depends on @bhushan/fin-desktop-core)
 *   src/
 *     extensions/  ← Your customizations
 *     config/      ← Your configuration
 * ```
 */

// This file serves as documentation for the extensions folder
