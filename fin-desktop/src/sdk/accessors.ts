/**
 * SDK runtime accessors.
 *
 * Helpers for app code to reach the injected FinDesktop APIs with clear errors when running
 * outside the container.
 */

import type { DesktopAgent } from '../interop/fdc3';

/** Whether the code is running inside FinDesktop (a `window.fdc3` agent is present). */
export function isInFinDesktop(): boolean {
  return typeof window !== 'undefined' && Boolean(window.fdc3);
}

/** Get the FDC3 DesktopAgent, throwing a helpful error if not inside the container. */
export function getFdc3(): DesktopAgent {
  const agent = typeof window !== 'undefined' ? window.fdc3 : undefined;
  if (!agent) {
    throw new Error(
      'window.fdc3 is not available — is this app running inside FinDesktop? ' +
        'For tests, use createMockFdc3() from the SDK testing utilities.',
    );
  }
  return agent;
}
