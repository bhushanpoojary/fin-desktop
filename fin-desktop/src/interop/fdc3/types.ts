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

/**
 * An intent handler may return a result (FDC3 2.0 "intents with results"): a `Context`, a
 * `Channel` (for streaming results), or nothing.
 */
export type IntentResult = Context | Channel | void;
export type IntentHandler = (context: Context, metadata?: ContextMetadata) => IntentResult | Promise<IntentResult>;

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
  /** Resolve the result returned by the handling app (FDC3 2.0 intents with results). */
  getResult(): Promise<IntentResult>;
}

/** FDC3 2.0 application metadata (`fdc3.getAppMetadata`). */
export interface AppMetadata {
  appId: string;
  name?: string;
  title?: string;
  description?: string;
  version?: string;
  publisher?: string;
  icons?: { src: string }[];
  screenshots?: { src: string }[];
}

export interface ImplementationMetadata {
  fdc3Version: string;
  provider: string;
  providerVersion?: string;
  optionalFeatures?: Record<string, boolean>;
}
