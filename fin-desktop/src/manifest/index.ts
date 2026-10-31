/**
 * FinDesktop manifest — declarative app/platform launch descriptors.
 *
 * Pure, framework-agnostic model + validation + loading. The runtime (manifest launching,
 * deep links) consumes these.
 */

export * from './manifest';
export * from './validateManifest';
export * from './loadManifest';
export * from './manifestLauncher';
