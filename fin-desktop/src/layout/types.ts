// A single saved workspace layout (per user)
export interface SavedLayout {
  id: string;           // unique id (e.g. uuid)
  name: string;         // friendly name e.g. "Default Workspace"
  data: unknown;        // raw layout payload (e.g. GoldenLayout config later)
  createdAt: string;    // ISO timestamp
  updatedAt: string;    // ISO timestamp
  // optional flags for UI
  isDefault?: boolean;
}

export interface LayoutStoreSnapshot {
  layouts: SavedLayout[];
  activeLayoutId?: string;
}
