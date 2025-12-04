import type { ILayoutManager } from "./ILayoutManager";
import type { SavedLayout, LayoutStoreSnapshot } from "./types";

const STORAGE_KEY = "finDesktop.layoutStore.v1";

function nowIso(): string {
  return new Date().toISOString();
}

function loadSnapshotFromLocalStorage(): LayoutStoreSnapshot {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { layouts: [] };
  }
  try {
    const parsed = JSON.parse(raw) as LayoutStoreSnapshot;
    if (!Array.isArray(parsed.layouts)) {
      return { layouts: [] };
    }
    return parsed;
  } catch {
    return { layouts: [] };
  }
}

function saveSnapshotToLocalStorage(snapshot: LayoutStoreSnapshot): void {
  const json = JSON.stringify(snapshot);
  window.localStorage.setItem(STORAGE_KEY, json);
}

let idCounter = 0;
function generateId(): string {
  // simple deterministic id; later can be replaced with uuid
  idCounter += 1;
  return `layout-${Date.now()}-${idCounter}`;
}

export class LocalStorageLayoutManager implements ILayoutManager {
  async getSnapshot(): Promise<LayoutStoreSnapshot> {
    return loadSnapshotFromLocalStorage();
  }

  async getAllLayouts(): Promise<SavedLayout[]> {
    const snapshot = loadSnapshotFromLocalStorage();
    return snapshot.layouts;
  }

  async getActiveLayoutId(): Promise<string | undefined> {
    const snapshot = loadSnapshotFromLocalStorage();
    return snapshot.activeLayoutId;
  }

  async getActiveLayout(): Promise<SavedLayout | undefined> {
    const snapshot = loadSnapshotFromLocalStorage();
    if (!snapshot.activeLayoutId) {
      return undefined;
    }
    return snapshot.layouts.find(l => l.id === snapshot.activeLayoutId);
  }

  async saveLayout(
    layout: Omit<SavedLayout, "id" | "createdAt" | "updatedAt"> & Partial<Pick<SavedLayout, "id">>
  ): Promise<SavedLayout> {
    const snapshot = loadSnapshotFromLocalStorage();
    const now = nowIso();

    if (layout.id) {
      const existingIndex = snapshot.layouts.findIndex(l => l.id === layout.id);
      if (existingIndex >= 0) {
        const existing = snapshot.layouts[existingIndex];
        const updated: SavedLayout = {
          ...existing,
          ...layout,
          id: existing.id,
          createdAt: existing.createdAt,
          updatedAt: now
        };
        snapshot.layouts[existingIndex] = updated;
        saveSnapshotToLocalStorage(snapshot);
        return updated;
      }
    }

    const newLayout: SavedLayout = {
      id: generateId(),
      name: layout.name,
      data: layout.data,
      createdAt: now,
      updatedAt: now,
      isDefault: layout.isDefault
    };

    snapshot.layouts.push(newLayout);
    saveSnapshotToLocalStorage(snapshot);

    return newLayout;
  }

  async deleteLayout(id: string): Promise<void> {
    const snapshot = loadSnapshotFromLocalStorage();
    snapshot.layouts = snapshot.layouts.filter(l => l.id !== id);
    if (snapshot.activeLayoutId === id) {
      snapshot.activeLayoutId = undefined;
    }
    saveSnapshotToLocalStorage(snapshot);
  }

  async setActiveLayout(id: string): Promise<void> {
    const snapshot = loadSnapshotFromLocalStorage();
    const exists = snapshot.layouts.some(l => l.id === id);
    if (!exists) {
      throw new Error(`Cannot set active layout. Layout with id '${id}' not found.`);
    }
    snapshot.activeLayoutId = id;
    saveSnapshotToLocalStorage(snapshot);
  }
}
