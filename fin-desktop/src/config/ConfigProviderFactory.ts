import type { IConfigProvider } from "./IConfigProvider";
import { DemoConfigProvider } from "./DemoConfigProvider";

export type ConfigProviderKind = "demo" | "remote" | "custom";

export interface ConfigProviderFactoryOptions {
  kind?: ConfigProviderKind;
  // optional hook for client to inject their own instance
  customProvider?: IConfigProvider;
}

export class ConfigProviderFactory {
  static create(options: ConfigProviderFactoryOptions = {}): IConfigProvider {
    // 1. If a custom provider is passed, always prefer that
    if (options.customProvider) {
      return options.customProvider;
    }

    // 2. Determine kind from options or environment variable
    const kind: ConfigProviderKind =
      options.kind ||
      (import.meta.env.VITE_CONFIG_PROVIDER as ConfigProviderKind | undefined) ||
      "demo";

    switch (kind) {
      case "demo":
        return new DemoConfigProvider();
      // case "remote":
      //   return new RemoteConfigProvider(); // (to be implemented by client)
      // case "custom":
      //   throw new Error("custom kind requires customProvider instance");
      default:
        return new DemoConfigProvider();
    }
  }
}
