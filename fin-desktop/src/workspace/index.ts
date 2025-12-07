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

// Window Docking System (custom windowing with snapping)
export { Workspace, useWorkspaceWindows } from "./Workspace";
export type { WorkspaceProps } from "./Workspace";

export { DesktopWindow } from "./DesktopWindow";
export type { DesktopWindowProps } from "./DesktopWindow";

export { DockingOverlay } from "./DockingOverlay";
export type { DockingOverlayProps } from "./DockingOverlay";

export { computeDockingPreview } from "./DockingManager";
export type { WindowLayout, DockingResult, WorkspaceRect } from "./DockingManager";

export { WindowDockingDemo } from "./WindowDockingDemo";
