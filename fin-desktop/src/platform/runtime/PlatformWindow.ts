/**
 * PlatformWindow — owns one native window's content: its hosted Views and its layout tree.
 *
 * It translates high-level operations (addView, splitView, closeView, activateView, resize)
 * into native calls on a `PlatformHost`, using the pure layout engine to compute where each
 * View should sit. It never touches Electron directly, so it is fully unit-testable.
 */

import type { Rect, ViewId, ViewState, WindowId } from '../types';
import {
  addView as addViewToTree,
  computeLayout,
  createRoot,
  findStack,
  findStackOfView,
  listStacks,
  listViewIds,
  moveView as moveViewInTree,
  removeView as removeViewFromTree,
  setActiveView as setActiveViewInTree,
  splitStack,
  type LayoutNode,
  type SplitDirection,
} from '../layout/layoutTree';
import type { WindowSnapshot } from '../snapshot/snapshot';
import type { PlatformHost } from './PlatformHost';
import type { EmitFn } from './events';

export type IdFactory = (prefix: string) => string;

/** A simple monotonic id factory: `prefix-1`, `prefix-2`, … (shared counter). */
export function createCounterIdFactory(): IdFactory {
  let n = 0;
  return (prefix) => `${prefix}-${++n}`;
}

export interface ContentInset {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const NO_INSET: ContentInset = { top: 0, right: 0, bottom: 0, left: 0 };

export interface PlatformWindowOptions {
  id: WindowId;
  bounds: Rect;
  host: PlatformHost;
  createId: IdFactory;
  emit: EmitFn;
  /** Gap in pixels between adjacent layout panes. */
  gap?: number;
  /** Reserved space inside the window (e.g. for a tab strip). */
  contentInset?: Partial<ContentInset>;
  /** Security guard: return false to block opening a View for a URL. */
  canOpenUrl?: (url: string) => boolean;
}

export class PlatformWindow {
  readonly id: WindowId;

  private bounds: Rect;
  private layout: LayoutNode | null = null;
  private activeStackId: string | null = null;
  private readonly views = new Map<ViewId, ViewState>();

  private readonly host: PlatformHost;
  private readonly createId: IdFactory;
  private readonly emit: EmitFn;
  private readonly gap: number;
  private readonly inset: ContentInset;
  private readonly canOpenUrl?: (url: string) => boolean;

  constructor(options: PlatformWindowOptions) {
    this.id = options.id;
    this.bounds = options.bounds;
    this.host = options.host;
    this.createId = options.createId;
    this.emit = options.emit;
    this.gap = options.gap ?? 0;
    this.inset = { ...NO_INSET, ...options.contentInset };
    this.canOpenUrl = options.canOpenUrl;
  }

  /** Add a View, tabbed into the active (or specified) stack. Returns the new view id. */
  addView(url: string, targetStackId?: string): ViewId {
    this.assertUrlAllowed(url);
    const viewId = this.createId('view');
    this.views.set(viewId, { id: viewId, url });

    if (!this.layout) {
      const stackId = this.createId('stack');
      this.layout = createRoot(stackId, viewId);
      this.activeStackId = stackId;
    } else {
      const target = targetStackId ?? this.activeStackId ?? listStacks(this.layout)[0]?.id ?? null;
      if (target && findStack(this.layout, target)) {
        this.layout = addViewToTree(this.layout, target, viewId);
        this.activeStackId = target;
      } else {
        const stackId = this.createId('stack');
        this.layout = createRoot(stackId, viewId);
        this.activeStackId = stackId;
      }
    }

    this.host.createView(this.id, viewId, url);
    this.relayout();
    this.emit('view-created', { windowId: this.id, viewId });
    return viewId;
  }

  /** Split the stack containing `targetViewId`, placing a new View beside it. */
  splitView(targetViewId: ViewId, direction: SplitDirection, url: string): ViewId {
    if (!this.layout) throw new Error('cannot split an empty window');
    const stack = findStackOfView(this.layout, targetViewId);
    if (!stack) throw new Error(`view ${targetViewId} not found`);
    this.assertUrlAllowed(url);

    const viewId = this.createId('view');
    const stackId = this.createId('stack');
    const splitId = this.createId('split');
    this.views.set(viewId, { id: viewId, url });

    this.layout = splitStack(this.layout, stack.id, direction, viewId, { splitId, stackId });
    this.activeStackId = stackId;

    this.host.createView(this.id, viewId, url);
    this.relayout();
    this.emit('view-created', { windowId: this.id, viewId });
    return viewId;
  }

  /** Close a View, collapsing empty stacks/splits and destroying the native view. */
  closeView(viewId: ViewId): void {
    if (!this.views.has(viewId)) return;

    if (this.layout) this.layout = removeViewFromTree(this.layout, viewId);
    this.host.destroyView(viewId);
    this.views.delete(viewId);

    if (!this.layout || (this.activeStackId && !findStack(this.layout, this.activeStackId))) {
      this.activeStackId = this.layout ? (listStacks(this.layout)[0]?.id ?? null) : null;
    }

    this.relayout();
    this.emit('view-closed', { windowId: this.id, viewId });
  }

  /** Make a View the active (visible) tab of its stack. */
  activateView(viewId: ViewId): void {
    if (!this.layout) return;
    const stack = findStackOfView(this.layout, viewId);
    if (!stack) return;
    this.layout = setActiveViewInTree(this.layout, viewId);
    this.activeStackId = stack.id;
    this.relayout();
  }

  /** Move a View into another stack. */
  moveView(viewId: ViewId, toStackId: string): void {
    if (!this.layout) return;
    this.layout = moveViewInTree(this.layout, viewId, toStackId);
    if (!this.layout || (this.activeStackId && !findStack(this.layout, this.activeStackId))) {
      this.activeStackId = this.layout ? (listStacks(this.layout)[0]?.id ?? null) : null;
    }
    this.relayout();
  }

  /** Move/resize the window; views are repositioned to the new content area. */
  setBounds(bounds: Rect): void {
    this.bounds = bounds;
    this.host.setWindowHostBounds?.(this.id, bounds);
    this.relayout();
  }

  /** Replace the whole layout + views (used by snapshot restore). */
  applyLayout(layout: LayoutNode | null, views: ViewState[]): void {
    for (const id of this.views.keys()) this.host.destroyView(id);
    this.views.clear();

    this.layout = layout;
    for (const view of views) {
      this.views.set(view.id, view);
      this.host.createView(this.id, view.id, view.url);
    }
    this.activeStackId = layout ? (listStacks(layout)[0]?.id ?? null) : null;
    this.relayout();
  }

  getLayout(): LayoutNode | null {
    return this.layout;
  }

  getBounds(): Rect {
    return this.bounds;
  }

  listViews(): ViewState[] {
    return [...this.views.values()];
  }

  getSnapshot(): WindowSnapshot {
    return {
      id: this.id,
      bounds: this.bounds,
      views: this.listViews(),
      layout: this.layout,
    };
  }

  /** Destroy all native views (called when the window is closed). */
  destroy(): void {
    for (const id of this.views.keys()) this.host.destroyView(id);
    this.views.clear();
    this.layout = null;
    this.activeStackId = null;
  }

  private assertUrlAllowed(url: string): void {
    if (this.canOpenUrl && !this.canOpenUrl(url)) {
      throw new Error(`Blocked by policy: ${url}`);
    }
  }

  private contentRect(): Rect {
    return {
      x: this.inset.left,
      y: this.inset.top,
      width: Math.max(0, this.bounds.width - this.inset.left - this.inset.right),
      height: Math.max(0, this.bounds.height - this.inset.top - this.inset.bottom),
    };
  }

  private relayout(): void {
    if (!this.layout) {
      for (const id of this.views.keys()) this.host.setViewVisible(id, false);
      this.emit('layout-changed', { windowId: this.id });
      return;
    }

    const rects = computeLayout(this.layout, this.contentRect(), this.gap);
    const inLayout = new Set(listViewIds(this.layout));

    // Views no longer in the layout are hidden.
    for (const id of this.views.keys()) {
      if (!inLayout.has(id)) this.host.setViewVisible(id, false);
    }

    // Each stack shows its active view at the stack's rect; others are hidden.
    for (const stack of listStacks(this.layout)) {
      const rect = rects.get(stack.id);
      for (const viewId of stack.viewIds) {
        if (viewId === stack.activeViewId && rect) {
          this.host.setViewBounds(viewId, rect);
          this.host.setViewVisible(viewId, true);
        } else {
          this.host.setViewVisible(viewId, false);
        }
      }
    }

    this.emit('layout-changed', { windowId: this.id });
  }
}
