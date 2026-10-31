/**
 * Manifest validation.
 *
 * Validates an untrusted JSON payload against the FinDesktop manifest schema, returning a
 * typed manifest or a list of path-tagged errors. Pure and dependency-free.
 */

import type { Manifest } from './manifest';

export interface ValidationError {
  path: string;
  message: string;
}

export type ValidationResult =
  | { ok: true; manifest: Manifest }
  | { ok: false; errors: ValidationError[] };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateWindowOptions(value: unknown, path: string, errors: ValidationError[]): void {
  if (value === undefined) return;
  if (!isObject(value)) {
    errors.push({ path, message: 'windowOptions must be an object' });
    return;
  }
  const numberKeys = [
    'defaultWidth',
    'defaultHeight',
    'defaultLeft',
    'defaultTop',
    'minWidth',
    'minHeight',
    'maxWidth',
    'maxHeight',
  ];
  for (const key of numberKeys) {
    if (value[key] !== undefined && typeof value[key] !== 'number') {
      errors.push({ path: `${path}.${key}`, message: 'must be a number' });
    }
  }
  const boolKeys = ['frame', 'resizable', 'maximizable', 'alwaysOnTop', 'autoShow'];
  for (const key of boolKeys) {
    if (value[key] !== undefined && typeof value[key] !== 'boolean') {
      errors.push({ path: `${path}.${key}`, message: 'must be a boolean' });
    }
  }
}

function validateRuntime(value: unknown, errors: ValidationError[]): void {
  if (value === undefined) return;
  if (!isObject(value)) {
    errors.push({ path: 'runtime', message: 'runtime must be an object' });
    return;
  }
  if (value.version !== undefined && typeof value.version !== 'string') {
    errors.push({ path: 'runtime.version', message: 'must be a string' });
  }
}

function validateStringArray(value: unknown, path: string, errors: ValidationError[]): void {
  if (value === undefined) return;
  if (!Array.isArray(value) || value.some((v) => typeof v !== 'string')) {
    errors.push({ path, message: 'must be an array of strings' });
  }
}

function validatePermissions(value: unknown, errors: ValidationError[]): void {
  if (value === undefined) return;
  if (!isObject(value)) {
    errors.push({ path: 'permissions', message: 'permissions must be an object' });
    return;
  }
  validateStringArray(value.request, 'permissions.request', errors);
  if (value.domains !== undefined) {
    if (!isObject(value.domains)) {
      errors.push({ path: 'permissions.domains', message: 'must be an object' });
    } else {
      validateStringArray(value.domains.allow, 'permissions.domains.allow', errors);
      validateStringArray(value.domains.deny, 'permissions.domains.deny', errors);
    }
  }
}

export function validateManifest(input: unknown): ValidationResult {
  if (!isObject(input)) {
    return { ok: false, errors: [{ path: '', message: 'manifest must be an object' }] };
  }

  if (input.type !== 'application' && input.type !== 'platform') {
    return {
      ok: false,
      errors: [{ path: 'type', message: "type must be 'application' or 'platform'" }],
    };
  }

  const errors: ValidationError[] = [];
  validateRuntime(input.runtime, errors);
  validatePermissions(input.permissions, errors);

  if (input.type === 'application') {
    const app = input.startupApp;
    if (!isObject(app)) {
      errors.push({ path: 'startupApp', message: 'startupApp is required' });
    } else {
      if (typeof app.appId !== 'string') errors.push({ path: 'startupApp.appId', message: 'must be a string' });
      if (typeof app.name !== 'string') errors.push({ path: 'startupApp.name', message: 'must be a string' });
      if (typeof app.url !== 'string') errors.push({ path: 'startupApp.url', message: 'must be a string' });
      validateWindowOptions(app.windowOptions, 'startupApp.windowOptions', errors);
    }
  } else {
    const platform = input.platform;
    if (!isObject(platform)) {
      errors.push({ path: 'platform', message: 'platform is required' });
    } else {
      validateWindowOptions(platform.defaultWindowOptions, 'platform.defaultWindowOptions', errors);
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, manifest: input as unknown as Manifest };
}
