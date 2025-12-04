import type { ILayoutManager } from "./ILayoutManager";
import { LocalStorageLayoutManager } from "./LocalStorageLayoutManager";

export type LayoutManagerKind = "localStorage" | "remote" | "custom";

export interface LayoutManagerFactoryOptions {
  kind?: LayoutManagerKind;
  customManager?: ILayoutManager;
}

export class LayoutManagerFactory {
  static create(options: LayoutManagerFactoryOptions = {}): ILayoutManager {
    if (options.customManager) {
      return options.customManager;
    }

    const kind: LayoutManagerKind =
      options.kind ||
      (import.meta.env.VITE_LAYOUT_MANAGER as LayoutManagerKind | undefined) ||
      "localStorage";

    switch (kind) {
      case "localStorage":
      default:
        return new LocalStorageLayoutManager();
    }
  }
}
