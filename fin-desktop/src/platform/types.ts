/**
 * FinDesktop Platform API — shared contracts.
 *
 * Framework-agnostic types shared by the layout engine, snapshot model, and snap
 * geometry. The Electron main-process runtime (WebContentsView) and the renderer SDK
 * both build on these.
 */

/** A pixel rectangle in screen or container coordinates. */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Unique identifier for a hosted View (a web page embedded in a window). */
export type ViewId = string;

/** Unique identifier for a platform Window. */
export type WindowId = string;

/** Serializable description of a single View. */
export interface ViewState {
  id: ViewId;
  url: string;
  title?: string;
}
