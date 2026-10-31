/**
 * App Store / Catalog model — a browsable, searchable catalog of apps backed by the FDC3
 * app directory, with install / pin state and per-user persistence.
 *
 * Pure and framework-agnostic: wraps `CatalogApp` records (app-directory record + store metadata
 * such as categories, tags, publisher, featured flag), supports category/tag filtering and fuzzy
 * search, and tracks which apps are installed/pinned. `serialize()`/`deserialize()` persist state;
 * `onChange` notifies a UI to re-render. Private/enterprise entries are hidden unless opted in.
 */

import type { AppDirectoryApp } from '../interop/fdc3/appDirectory';
import { fuzzyMatch } from '../search';

export interface CatalogApp extends AppDirectoryApp {
  categories?: string[];
  tags?: string[];
  publisher?: string;
  version?: string;
  featured?: boolean;
  /** Enterprise/private app — hidden from search/browse unless `includePrivate` is set. */
  private?: boolean;
}

export interface CatalogState {
  installed: string[];
  pinned: string[];
}

export interface CatalogQuery {
  category?: string;
  tag?: string;
  includePrivate?: boolean;
}

export interface CatalogOptions {
  installed?: string[];
  pinned?: string[];
  onChange?: (state: CatalogState) => void;
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function searchText(app: CatalogApp): string {
  return [app.name, app.title, app.description, app.publisher, ...(app.tags ?? [])]
    .filter(Boolean)
    .join(' ');
}

export class AppCatalog {
  private readonly apps: Map<string, CatalogApp>;
  private readonly installedSet: Set<string>;
  private readonly pinnedSet: Set<string>;
  private readonly onChange?: (state: CatalogState) => void;

  constructor(apps: CatalogApp[] = [], options: CatalogOptions = {}) {
    this.apps = new Map(apps.map((a) => [a.appId, a]));
    this.installedSet = new Set(options.installed ?? []);
    this.pinnedSet = new Set(options.pinned ?? []);
    this.onChange = options.onChange;
  }

  private emit(): void {
    this.onChange?.(this.serialize());
  }

  private visible(app: CatalogApp, includePrivate?: boolean): boolean {
    return includePrivate === true || app.private !== true;
  }

  getApps(includePrivate?: boolean): CatalogApp[] {
    return [...this.apps.values()].filter((a) => this.visible(a, includePrivate));
  }

  getApp(appId: string): CatalogApp | undefined {
    return this.apps.get(appId);
  }

  categories(includePrivate?: boolean): string[] {
    return uniqueSorted(this.getApps(includePrivate).flatMap((a) => a.categories ?? []));
  }

  tags(includePrivate?: boolean): string[] {
    return uniqueSorted(this.getApps(includePrivate).flatMap((a) => a.tags ?? []));
  }

  featured(includePrivate?: boolean): CatalogApp[] {
    return this.getApps(includePrivate).filter((a) => a.featured === true);
  }

  byCategory(category: string, includePrivate?: boolean): CatalogApp[] {
    return this.getApps(includePrivate).filter((a) => (a.categories ?? []).includes(category));
  }

  /** Fuzzy search with optional category/tag narrowing. Empty query returns the (filtered) catalog. */
  search(query: string, filter: CatalogQuery = {}): CatalogApp[] {
    const pool = this.getApps(filter.includePrivate).filter((a) => {
      if (filter.category && !(a.categories ?? []).includes(filter.category)) return false;
      if (filter.tag && !(a.tags ?? []).includes(filter.tag)) return false;
      return true;
    });

    const q = query.trim();
    if (q.length === 0) {
      return pool.sort((a, b) => a.name.localeCompare(b.name));
    }

    return pool
      .map((app) => ({ app, match: fuzzyMatch(q, searchText(app)) }))
      .filter((r) => r.match.matched)
      .sort((a, b) => b.match.score - a.match.score || a.app.name.localeCompare(b.app.name))
      .map((r) => r.app);
  }

  isInstalled(appId: string): boolean {
    return this.installedSet.has(appId);
  }

  install(appId: string): boolean {
    if (!this.apps.has(appId) || this.installedSet.has(appId)) return false;
    this.installedSet.add(appId);
    this.emit();
    return true;
  }

  uninstall(appId: string): boolean {
    if (!this.installedSet.delete(appId)) return false;
    this.pinnedSet.delete(appId); // uninstalling also unpins
    this.emit();
    return true;
  }

  installedApps(): CatalogApp[] {
    return [...this.installedSet]
      .map((id) => this.apps.get(id))
      .filter((a): a is CatalogApp => a !== undefined);
  }

  isPinned(appId: string): boolean {
    return this.pinnedSet.has(appId);
  }

  /** Pin an app to the dock. Installs it first if needed. */
  pin(appId: string): boolean {
    if (!this.apps.has(appId) || this.pinnedSet.has(appId)) return false;
    this.installedSet.add(appId);
    this.pinnedSet.add(appId);
    this.emit();
    return true;
  }

  unpin(appId: string): boolean {
    if (!this.pinnedSet.delete(appId)) return false;
    this.emit();
    return true;
  }

  pinnedApps(): CatalogApp[] {
    return [...this.pinnedSet]
      .map((id) => this.apps.get(id))
      .filter((a): a is CatalogApp => a !== undefined);
  }

  serialize(): CatalogState {
    return { installed: [...this.installedSet], pinned: [...this.pinnedSet] };
  }

  static deserialize(apps: CatalogApp[], state: Partial<CatalogState>): AppCatalog {
    return new AppCatalog(apps, { installed: state.installed, pinned: state.pinned });
  }
}
