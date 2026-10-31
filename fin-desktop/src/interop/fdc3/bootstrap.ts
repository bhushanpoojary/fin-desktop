/**
 * FDC3 bootstrap — wires the interop engine to a message bus and installs `window.fdc3`.
 *
 * Each window creates its own broker + DesktopAgent synced across windows through the host
 * bus (the Electron preload bus, which excludes the sender). `createDesktopAgent` is pure
 * (takes any PubSubBus) so it is unit-testable; `installFdc3` performs the window side-effect.
 */

import { InteropBroker } from './broker';
import { DesktopAgent } from './desktopAgent';
import { AppDirectory, type AppDirectoryApp } from './appDirectory';
import { createBusTransport, type PubSubBus } from './fdc3Transport';

declare global {
  interface Window {
    fdc3?: DesktopAgent;
  }
}

export interface Fdc3BootstrapOptions {
  appId?: string;
  apps?: AppDirectoryApp[];
  topic?: string;
}

/** Build a DesktopAgent backed by a broker that syncs over the given bus. */
export function createDesktopAgent(bus: PubSubBus, options: Fdc3BootstrapOptions = {}): DesktopAgent {
  const broker = new InteropBroker({
    transport: createBusTransport(bus, options.topic),
    directory: new AppDirectory(options.apps ?? []),
  });
  return new DesktopAgent(broker, { appId: options.appId });
}

/** Install the agent as `window.fdc3` and fire the FDC3 `fdc3Ready` event. */
export function installFdc3(agent: DesktopAgent): void {
  if (typeof window === 'undefined') return;
  window.fdc3 = agent;
  window.dispatchEvent(new Event('fdc3Ready'));
}

/** Convenience: create + install a DesktopAgent in one call. */
export function initializeFdc3(bus: PubSubBus, options: Fdc3BootstrapOptions = {}): DesktopAgent {
  const agent = createDesktopAgent(bus, options);
  installFdc3(agent);
  return agent;
}
