/**
 * FinDesktop security — capability permissions, domain allow-lists, and the policy engine.
 *
 * Pure, framework-agnostic building blocks for the permissions model. The Electron runtime
 * (permission prompts, CSP enforcement, API gating) consumes these.
 */

export * from './permissions';
export * from './domainAllowList';
export * from './permissionPolicy';
export * from './auth';
