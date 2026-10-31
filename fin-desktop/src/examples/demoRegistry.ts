/**
 * Single source of truth for the built-in demo pages. Each entry maps a `?test=<id>` route to a
 * title/description so the Demo Gallery and the floating Demo Launcher stay in sync.
 */

export interface DemoEntry {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
}

export const DEMOS: DemoEntry[] = [
  // Platform & windows
  { id: 'platform', title: 'Platform Playground', description: 'Layout engine, drag-dock, and snapshots.', icon: '🧩', category: 'Platform & Windows' },
  { id: 'platform-control', title: 'Platform Control', description: 'Controller for real WebContentsView windows.', icon: '🎛️', category: 'Platform & Windows' },
  { id: 'docking', title: 'Window Docking', description: 'Magnetic edge snapping between windows.', icon: '🧲', category: 'Platform & Windows' },

  // Interop / FDC3
  { id: 'fdc3', title: 'FDC3 Demo', description: 'FDC3 2.0 channels + intents via window.fdc3.', icon: '🔗', category: 'Interop (FDC3)' },
  { id: 'fdc3-inspector', title: 'FDC3 Inspector', description: 'Live context/intent traffic inspector.', icon: '🔎', category: 'Interop (FDC3)' },

  // Messaging
  { id: 'messaging', title: 'Messaging', description: 'Inter-App Bus (pub/sub) + Channels RPC.', icon: '📨', category: 'Messaging' },
  { id: 'external', title: 'External Connections', description: 'Remote (non-Electron) client over a duplex transport.', icon: '🌐', category: 'Messaging' },

  // Integration
  { id: 'integration', title: 'Clipboard & Hotkeys', description: 'Multi-format clipboard + global hotkey registry.', icon: '⌨️', category: 'Integration' },
  { id: 'dragdrop', title: 'Drag & Drop', description: 'Drag files and typed data between apps.', icon: '👆', category: 'Integration' },

  // Workspace components
  { id: 'palette', title: 'Command Palette', description: 'Spotlight launcher with fuzzy search + recents.', icon: '⌨️', category: 'Workspace Components' },
  { id: 'dock', title: 'Dock / App Bar', description: 'Configurable dock with pinned apps and groups.', icon: '📌', category: 'Workspace Components' },
  { id: 'store', title: 'App Store', description: 'Browsable catalog: install, pin, launch.', icon: '🛍️', category: 'Workspace Components' },
  { id: 'browser', title: 'Browser', description: 'Multi-tab container with split view + channels.', icon: '🗂️', category: 'Workspace Components' },
  { id: 'notifications', title: 'Notification Center', description: 'Grouped history, priority, DND, rich actions.', icon: '🔔', category: 'Workspace Components' },

  // Deployment
  { id: 'update', title: 'Auto-Update', description: 'Version channels + staged rollout + rollback.', icon: '⬆️', category: 'Deployment' },
  { id: 'logging', title: 'Logging & Rotation', description: 'Structured logger with rotating file sink.', icon: '📜', category: 'Deployment' },
  { id: 'diagnostics', title: 'Self-Diagnostics', description: 'Health checks + --diagnostics report.', icon: '🩺', category: 'Deployment' },

  // Enterprise
  { id: 'health', title: 'System Health', description: 'Per-process CPU/memory process explorer.', icon: '💓', category: 'Enterprise' },
  { id: 'crash', title: 'Crash Reporting', description: 'Capture crashes, opt-in upload, redaction.', icon: '💥', category: 'Enterprise' },
  { id: 'config', title: 'Remote Config & Flags', description: 'Layered config + feature-flag targeting.', icon: '🎛️', category: 'Enterprise' },

  // Theming & shells
  { id: 'theme', title: 'Theme Engine', description: 'Live theme tokens and switching.', icon: '🎨', category: 'Theming & Shells' },
  { id: 'minimal', title: 'Launcher Workspace', description: 'Clean launcher workspace shell.', icon: '🚀', category: 'Theming & Shells' },
  { id: 'full', title: 'Full Workspace', description: 'Full docking workspace (FlexLayout).', icon: '🏢', category: 'Theming & Shells' },
];

/** Category order for grouped display. */
export const DEMO_CATEGORIES: string[] = [
  'Platform & Windows',
  'Interop (FDC3)',
  'Messaging',
  'Integration',
  'Workspace Components',
  'Deployment',
  'Enterprise',
  'Theming & Shells',
];

export function findDemo(id: string | null | undefined): DemoEntry | undefined {
  return id ? DEMOS.find((d) => d.id === id) : undefined;
}

/** Navigate to a demo (or home when `id` is 'home'), preserving the rest of the URL. */
export function gotoDemo(id: string): void {
  const url = new URL(window.location.href);
  if (id === 'home') {
    url.searchParams.delete('test');
    url.searchParams.delete('entry');
    url.searchParams.delete('appId');
  } else {
    url.searchParams.set('test', id);
  }
  window.location.href = url.toString();
}
