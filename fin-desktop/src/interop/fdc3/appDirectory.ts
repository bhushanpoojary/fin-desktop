/**
 * FDC3 2.0 App Directory (AppD) model + intent/context resolution.
 *
 * A standards-aligned subset of the AppD v2 application record, plus a directory that
 * resolves intents and contexts to apps — the data behind `fdc3.findIntent`,
 * `fdc3.findIntentsByContext`, and the intent resolver UI. Pure and framework-agnostic.
 * See https://fdc3.finos.org/docs/app-directory/overview
 */

import type { IntentName } from './intents';

/** What an app listens for: an intent + the context types it accepts. */
export interface AppIntentDefinition {
  displayName?: string;
  contexts: string[];
  resultType?: string;
}

/** A subset of the FDC3 AppD v2 application record. */
export interface AppDirectoryApp {
  appId: string;
  name: string;
  title?: string;
  description?: string;
  icons?: { src: string }[];
  interop?: {
    intents?: {
      listensFor?: Record<string, AppIntentDefinition>;
      raises?: Record<string, string[]>;
    };
  };
}

/** Resolution of a single intent to the apps that handle it (shape mirrors `fdc3.AppIntent`). */
export interface ResolvedAppIntent {
  intent: { name: string; displayName?: string };
  apps: AppDirectoryApp[];
}

function listensFor(app: AppDirectoryApp): Record<string, AppIntentDefinition> {
  return app.interop?.intents?.listensFor ?? {};
}

export class AppDirectory {
  private readonly apps: Map<string, AppDirectoryApp>;

  constructor(apps: AppDirectoryApp[] = []) {
    this.apps = new Map(apps.map((a) => [a.appId, a]));
  }

  getApps(): AppDirectoryApp[] {
    return [...this.apps.values()];
  }

  getApp(appId: string): AppDirectoryApp | undefined {
    return this.apps.get(appId);
  }

  add(app: AppDirectoryApp): void {
    this.apps.set(app.appId, app);
  }

  remove(appId: string): void {
    this.apps.delete(appId);
  }

  /**
   * Apps that handle `intent`, optionally narrowed to those accepting `contextType`.
   * Mirrors `fdc3.findIntent(intent, context?)`.
   */
  findIntent(intent: IntentName, contextType?: string): ResolvedAppIntent {
    const apps: AppDirectoryApp[] = [];
    let displayName: string | undefined;
    for (const app of this.apps.values()) {
      const def = listensFor(app)[intent];
      if (!def) continue;
      if (contextType && !def.contexts.includes(contextType)) continue;
      displayName = displayName ?? def.displayName;
      apps.push(app);
    }
    return { intent: { name: intent, displayName }, apps };
  }

  /**
   * All intents (with handling apps) that accept `contextType`.
   * Mirrors `fdc3.findIntentsByContext(context)`.
   */
  findIntentsByContext(contextType: string): ResolvedAppIntent[] {
    const byIntent = new Map<string, { displayName?: string; apps: AppDirectoryApp[] }>();
    for (const app of this.apps.values()) {
      for (const [intent, def] of Object.entries(listensFor(app))) {
        if (!def.contexts.includes(contextType)) continue;
        const entry = byIntent.get(intent) ?? { displayName: def.displayName, apps: [] };
        entry.apps.push(app);
        byIntent.set(intent, entry);
      }
    }
    return [...byIntent.entries()].map(([name, { displayName, apps }]) => ({
      intent: { name, displayName },
      apps,
    }));
  }

  /** Apps that accept `contextType` for any intent. */
  findAppsByContext(contextType: string): AppDirectoryApp[] {
    return this.getApps().filter((app) =>
      Object.values(listensFor(app)).some((def) => def.contexts.includes(contextType)),
    );
  }
}
