/**
 * FDC3 2.0 DesktopAgent API types.
 *
 * The channel / listener / intent surface of the FDC3 DesktopAgent, used by the in-process
 * Interop broker and (later) the `window.fdc3` shim.
 */

import type { Context } from './context';

export interface Listener {
  unsubscribe(): void;
}

export interface ContextMetadata {
  source?: { appId?: string };
}

export type ContextHandler = (context: Context, metadata?: ContextMetadata) => void;
export type IntentHandler = (context: Context, metadata?: ContextMetadata) => void | Promise<void>;

export type ChannelType = 'user' | 'app' | 'private';

export interface DisplayMetadata {
  name?: string;
  color?: string;
  glyph?: string;
}

export interface Channel {
  readonly id: string;
  readonly type: ChannelType;
  readonly displayMetadata?: DisplayMetadata;
  broadcast(context: Context): void;
  getCurrentContext(contextType?: string): Context | null;
  addContextListener(contextType: string | null, handler: ContextHandler): Listener;
}

export interface IntentResolution {
  intent: string;
  source: { appId?: string };
  /** How many registered intent listeners received the context. */
  deliveredTo: number;
}

export interface ImplementationMetadata {
  fdc3Version: string;
  provider: string;
  providerVersion?: string;
  optionalFeatures?: Record<string, boolean>;
}
