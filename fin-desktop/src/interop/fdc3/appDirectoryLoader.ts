/**
 * FDC3 App Directory loading.
 *
 * Loads AppD v2 records from one or more remote REST endpoints, validates/merges them, and
 * caches with a TTL. `fetch` is injected so this is pure and unit-testable (and works in both
 * renderer and main process).
 */

import { AppDirectory, type AppDirectoryApp } from './appDirectory';

export interface FetchResponseLike {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

export type FetchLike = (url: string) => Promise<FetchResponseLike>;

/** FDC3 app directory responses may be a bare array or `{ applications: [...] }`. */
interface AppDirectoryResponse {
  applications?: unknown;
}

function isAppRecord(value: unknown): value is AppDirectoryApp {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as AppDirectoryApp).appId === 'string' &&
    typeof (value as AppDirectoryApp).name === 'string'
  );
}

/** Extract and validate AppD records from a directory payload (drops malformed entries). */
export function parseAppDirectoryPayload(payload: unknown): AppDirectoryApp[] {
  let list: unknown;
  if (Array.isArray(payload)) {
    list = payload;
  } else if (payload && typeof payload === 'object') {
    list = (payload as AppDirectoryResponse).applications;
  }
  if (!Array.isArray(list)) {
    throw new Error('App directory payload must be an array or { applications: [...] }');
  }
  return list.filter(isAppRecord);
}

/** Fetch and parse a single app directory endpoint. */
export async function loadAppDirectory(url: string, fetchFn: FetchLike): Promise<AppDirectoryApp[]> {
  const res = await fetchFn(url);
  if (!res.ok) {
    throw new Error(`Failed to load app directory ${url}: ${res.status}`);
  }
  return parseAppDirectoryPayload(await res.json());
}

/** Merge app lists, de-duplicating by `appId` (later sources win). */
export function mergeApps(...lists: AppDirectoryApp[][]): AppDirectoryApp[] {
  const byId = new Map<string, AppDirectoryApp>();
  for (const list of lists) {
    for (const app of list) byId.set(app.appId, app);
  }
  return [...byId.values()];
}

export interface AppDirectoryLoaderOptions {
  sources: string[];
  fetch: FetchLike;
  /** Cache lifetime in ms. 0 (default) disables caching. */
  ttlMs?: number;
  now?: () => number;
}

/** Loads + merges multiple app directories with TTL caching. */
export class AppDirectoryLoader {
  private cache: AppDirectoryApp[] | null = null;
  private loadedAt = 0;
  private readonly options: AppDirectoryLoaderOptions;

  constructor(options: AppDirectoryLoaderOptions) {
    this.options = options;
  }

  private now(): number {
    return (this.options.now ?? Date.now)();
  }

  /** Returns a cached directory while within the TTL, otherwise fetches fresh. */
  async load(): Promise<AppDirectory> {
    const ttl = this.options.ttlMs ?? 0;
    if (this.cache && ttl > 0 && this.now() - this.loadedAt < ttl) {
      return new AppDirectory(this.cache);
    }
    return this.refresh();
  }

  /** Always fetches all sources and rebuilds the cache. */
  async refresh(): Promise<AppDirectory> {
    const lists = await Promise.all(
      this.options.sources.map((url) => loadAppDirectory(url, this.options.fetch)),
    );
    this.cache = mergeApps(...lists);
    this.loadedAt = this.now();
    return new AppDirectory(this.cache);
  }
}
