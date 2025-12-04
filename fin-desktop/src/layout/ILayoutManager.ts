import type { SavedLayout, LayoutStoreSnapshot } from "./types";

export interface ILayoutManager {
  /** Load all saved layouts from storage. */
  getAllLayouts(): Promise<SavedLayout[]>;

  /** Return the currently active layout (if any). */
  getActiveLayout(): Promise<SavedLayout | undefined>;

  /** Return the id of the active layout (if any). */
  getActiveLayoutId(): Promise<string | undefined>;

  /**
   * Save or update a layout.
   * If layout.id exists, update; otherwise create a new layout with new id.
   * Returns the saved layout (with id + timestamps).
   */
  saveLayout(layout: Omit<SavedLayout, "id" | "createdAt" | "updatedAt"> & Partial<Pick<SavedLayout, "id">>): Promise<SavedLayout>;

  /** Delete a layout by id. If it was active, clear active layout id. */
  deleteLayout(id: string): Promise<void>;

  /** Mark the given layout as active (does not modify the layout content). */
  setActiveLayout(id: string): Promise<void>;

  /** Load the raw snapshot (for debugging / migrations, optional). */
  getSnapshot(): Promise<LayoutStoreSnapshot>;
}
