/**
 * Security permission model.
 *
 * The set of capabilities an application can request and the states a permission can hold.
 * Framework-agnostic; the policy engine and (later) runtime prompts build on these.
 */

export const Capabilities = {
  ClipboardRead: 'clipboard-read',
  ClipboardWrite: 'clipboard-write',
  Notifications: 'notifications',
  FileSystemRead: 'filesystem-read',
  FileSystemWrite: 'filesystem-write',
  Network: 'network',
  ExternalProcess: 'external-process',
  LaunchApplication: 'launch-application',
  SystemTray: 'system-tray',
  GlobalHotkeys: 'global-hotkeys',
  Fdc3: 'fdc3',
  Screenshot: 'screenshot',
} as const;

export type Capability = (typeof Capabilities)[keyof typeof Capabilities];

export type PermissionState = 'granted' | 'denied' | 'prompt';

const CAPABILITY_SET = new Set<string>(Object.values(Capabilities));

export function isCapability(value: string): value is Capability {
  return CAPABILITY_SET.has(value);
}

export function listCapabilities(): Capability[] {
  return Object.values(Capabilities);
}
