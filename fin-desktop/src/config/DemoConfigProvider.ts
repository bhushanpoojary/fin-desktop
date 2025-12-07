import type { IConfigProvider } from "./IConfigProvider";
import type { AppDefinition, WorkspaceLayout, PlatformConfig } from "./types";

export class DemoConfigProvider implements IConfigProvider {
  private platformConfigPromise: Promise<PlatformConfig> | null = null;

  private async loadPlatformConfig(): Promise<PlatformConfig> {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const [appsRes, layoutsRes] = await Promise.all([
      fetch(`${baseUrl}config/demo-apps.json`),
      fetch(`${baseUrl}config/demo-layouts.json`)
    ]);

    if (!appsRes.ok) {
      throw new Error(`Failed to load demo-apps.json: ${appsRes.status}`);
    }
    if (!layoutsRes.ok) {
      // layouts are optional, so we can tolerate a 404 and just return an empty array
      if (layoutsRes.status === 404) {
        const apps: AppDefinition[] = await appsRes.json();
        return { apps, layouts: [] };
      }
      throw new Error(`Failed to load demo-layouts.json: ${layoutsRes.status}`);
    }

    const apps: AppDefinition[] = await appsRes.json();
    const layouts: WorkspaceLayout[] = await layoutsRes.json();

    return { apps, layouts };
  }

  private ensurePlatformConfigLoaded(): Promise<PlatformConfig> {
    if (!this.platformConfigPromise) {
      this.platformConfigPromise = this.loadPlatformConfig();
    }
    return this.platformConfigPromise;
  }

  async getPlatformConfig(): Promise<PlatformConfig> {
    return this.ensurePlatformConfigLoaded();
  }

  async getApps(): Promise<AppDefinition[]> {
    const config = await this.ensurePlatformConfigLoaded();
    return config.apps;
  }

  async getLayouts(): Promise<WorkspaceLayout[]> {
    const config = await this.ensurePlatformConfigLoaded();
    return config.layouts ?? [];
  }

  async getLayoutById(id: string): Promise<WorkspaceLayout | undefined> {
    const layouts = await this.getLayouts();
    return layouts.find(l => l.id === id);
  }
}
