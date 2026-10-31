/**
 * Deep linking — the `findesktop://` protocol.
 *
 * Parses/builds deep links that launch a manifest, launch an app, or raise an FDC3 intent,
 * and dispatches a parsed link to injected handlers. Pure and unit-testable; the OS protocol
 * registration + wiring to the real Platform/fdc3 is a thin runtime adapter.
 *
 *   findesktop://launch?manifest=<url>
 *   findesktop://app?appId=<id>[&url=<url>]
 *   findesktop://intent?name=<intent>[&context=<json>|&ticker=<symbol>]
 */

import { createInstrument, type Context } from '../interop/fdc3';

export const DEEP_LINK_PROTOCOL = 'findesktop:';

export type DeepLinkAction =
  | { type: 'launch-manifest'; manifestUrl: string }
  | { type: 'launch-app'; appId: string; url?: string }
  | { type: 'raise-intent'; intent: string; context?: Context };

function parseContextParam(params: URLSearchParams): Context | undefined {
  const raw = params.get('context');
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && typeof (parsed as Context).type === 'string') {
        return parsed as Context;
      }
    } catch {
      /* fall through to shorthand */
    }
  }
  const ticker = params.get('ticker');
  return ticker ? createInstrument(ticker) : undefined;
}

/** Parse a `findesktop://` deep link into an action, or null if it is not a valid link. */
export function parseDeepLink(input: string): DeepLinkAction | null {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return null;
  }
  if (url.protocol !== DEEP_LINK_PROTOCOL) return null;

  const action = url.hostname || url.pathname.replace(/^\/+/, '').split('/')[0];
  const params = url.searchParams;

  switch (action) {
    case 'launch': {
      const manifestUrl = params.get('manifest');
      return manifestUrl ? { type: 'launch-manifest', manifestUrl } : null;
    }
    case 'app': {
      const appId = params.get('appId');
      if (!appId) return null;
      return { type: 'launch-app', appId, url: params.get('url') ?? undefined };
    }
    case 'intent': {
      const intent = params.get('name') ?? params.get('intent');
      if (!intent) return null;
      return { type: 'raise-intent', intent, context: parseContextParam(params) };
    }
    default:
      return null;
  }
}

/** Build a `findesktop://` deep link from an action. */
export function buildDeepLink(action: DeepLinkAction): string {
  switch (action.type) {
    case 'launch-manifest':
      return `findesktop://launch?manifest=${encodeURIComponent(action.manifestUrl)}`;
    case 'launch-app': {
      const params = new URLSearchParams({ appId: action.appId });
      if (action.url) params.set('url', action.url);
      return `findesktop://app?${params.toString()}`;
    }
    case 'raise-intent': {
      const params = new URLSearchParams({ name: action.intent });
      if (action.context) params.set('context', JSON.stringify(action.context));
      return `findesktop://intent?${params.toString()}`;
    }
  }
}

export interface DeepLinkHandlers {
  launchManifestUrl: (manifestUrl: string) => void | Promise<void>;
  launchApp: (appId: string, url?: string) => void | Promise<void>;
  raiseIntent: (intent: string, context?: Context) => void | Promise<void>;
}

/** Dispatch a deep link to the matching handler. Returns false if the link is invalid. */
export async function handleDeepLink(input: string, handlers: DeepLinkHandlers): Promise<boolean> {
  const action = parseDeepLink(input);
  if (!action) return false;
  switch (action.type) {
    case 'launch-manifest':
      await handlers.launchManifestUrl(action.manifestUrl);
      return true;
    case 'launch-app':
      await handlers.launchApp(action.appId, action.url);
      return true;
    case 'raise-intent':
      await handlers.raiseIntent(action.intent, action.context);
      return true;
  }
}
