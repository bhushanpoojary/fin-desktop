/**
 * FinDesktop Platform core (framework-agnostic).
 *
 * Pure building blocks for the Platform API: layout tree, snapshots, and snap/dock
 * geometry. The Electron `WebContentsView` runtime and the renderer SDK consume these.
 */

export type { Rect, ViewId, WindowId, ViewState } from './types';

export * from './layout/layoutTree';
export * from './snapshot/snapshot';
export * from './snap/snapGeometry';
