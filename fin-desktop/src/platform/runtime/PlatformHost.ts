/**
 * PlatformHost — the injection boundary between the Platform runtime brain and the
 * native windowing layer.
 *
 * The runtime (`Platform` / `PlatformWindow`) decides *what* views exist and *where* they
 * go; a host implements *how* they are realized. The Electron adapter implements this with
 * `BaseWindow` + `WebContentsView`; tests implement it with an in-memory fake.
 */

import type { Rect, ViewId, WindowId } from '../types';

export interface PlatformHost {
  /** Create the native container window. Optional for hosts that pre-create windows. */
  createWindowHost?(windowId: WindowId, bounds: Rect): void;
  /** Destroy the native container window. */
  destroyWindowHost?(windowId: WindowId): void;
  /** Move/resize the native container window. */
  setWindowHostBounds?(windowId: WindowId, bounds: Rect): void;

  /** Create a native view (e.g. a WebContentsView) loading `url`, owned by a window. */
  createView(windowId: WindowId, viewId: ViewId, url: string): void;
  /** Destroy a native view. */
  destroyView(viewId: ViewId): void;
  /** Position a view within its window (window-local coordinates). */
  setViewBounds(viewId: ViewId, bounds: Rect): void;
  /** Show or hide a view (hidden views stay alive for tab switching). */
  setViewVisible(viewId: ViewId, visible: boolean): void;
}
