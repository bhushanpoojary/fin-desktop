/**
 * @findesktop/sdk — the public API surface for FinDesktop apps.
 *
 * Namespaced re-exports of the stable modules (so names never clash), plus runtime accessors
 * and testing utilities. A future `@findesktop/sdk` npm package would publish this entry.
 *
 *   import { fdc3, platform, manifest, getFdc3, createMockFdc3 } from '@findesktop/sdk';
 */

export * as fdc3 from '../interop/fdc3';
export * as platform from '../platform';
export * as manifest from '../manifest';
export * as deeplink from '../deeplink';
export * as security from '../security';

export * from './accessors';
export * from './testing';
