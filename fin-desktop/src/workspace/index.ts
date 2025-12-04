/**
 * Workspace module - In-workspace docking with FlexLayout
 * 
 * This module provides a complete workspace docking solution with:
 * - Tab groups
 * - Drag-to-dock
 * - Split views (horizontal/vertical)
 * - Floating windows (popouts)
 * - Layout save/load integration with ILayoutManager
 */

export { WorkspaceDock } from "./WorkspaceDock";
export type { WorkspaceDockProps, WorkspaceDockHandle, OpenAppOptions } from "./WorkspaceDock";

export { WorkspaceShell } from "./WorkspaceShell";
export type { WorkspaceShellProps } from "./WorkspaceShell";

export { WorkspaceProvider, useWorkspace } from "./WorkspaceContext";

export { defaultAppRegistry } from "./appRegistry";
export type { AppComponentRegistry } from "./appRegistry";
