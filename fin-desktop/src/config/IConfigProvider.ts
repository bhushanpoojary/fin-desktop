import type { AppDefinition, WorkspaceLayout, PlatformConfig } from "./types";

export interface IConfigProvider {
  /** Load all platform config (apps, layouts, etc.) */
  getPlatformConfig(): Promise<PlatformConfig>;

  /** Helper: just return the list of apps */
  getApps(): Promise<AppDefinition[]>;

  /** Helper: return all saved layouts */
  getLayouts(): Promise<WorkspaceLayout[]>;

  /** Helper: find layout by id (or return undefined) */
  getLayoutById(id: string): Promise<WorkspaceLayout | undefined>;
}
