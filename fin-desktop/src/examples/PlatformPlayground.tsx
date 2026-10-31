/**
 * PlatformPlayground — a renderer-only visual demo of the FinDesktop Platform core.
 *
 * It drives the real pure modules (`computeLayout`, `computeDropTarget`, the layout tree
 * ops, and snapshots) using plain <div> panes as stand-in "Views" — no Electron required.
 * Drag an app tile onto a pane to see live drop-zone previews (edge = split, center = tab),
 * switch/close tabs, and save/restore the layout as a snapshot.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  computeLayout,
  listStacks,
  createRoot,
  addView,
  removeView,
  setActiveView,
  splitStack,
  findStackOfView,
  computeDropTarget,
  dropRegionToSplitDirection,
  createSnapshot,
  serializeSnapshot,
  deserializeSnapshot,
  type LayoutNode,
  type Rect,
  type ViewState,
  type DropRegion,
} from '../platform';
import './PlatformPlayground.css';

interface DragItem {
  label: string;
  color: string;
}

interface Hover {
  stackId: string;
  region: DropRegion;
  preview: Rect;
}

type ViewMeta = Record<string, { label: string; color: string }>;

const PALETTE: DragItem[] = [
  { label: 'Chart', color: '#ff8c00' },
  { label: 'News', color: '#4a9eff' },
  { label: 'Blotter', color: '#00a86b' },
  { label: 'Orders', color: '#dc143c' },
  { label: 'Watchlist', color: '#a855f7' },
];

const GAP = 6;

function useElementSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setSize({ width: r.width, height: r.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

export const PlatformPlayground: React.FC = () => {
  const [areaRef, size] = useElementSize();

  const [layout, setLayout] = useState<LayoutNode | null>(null);
  const [metas, setMetas] = useState<ViewMeta>({});
  const [activeStackId, setActiveStackId] = useState<string | null>(null);

  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);
  const [hover, setHover] = useState<Hover | null>(null);
  const [snapshotText, setSnapshotText] = useState('');

  // Latest-value refs so window pointer handlers read current state.
  const layoutRef = useRef(layout);
  layoutRef.current = layout;
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const dragRef = useRef(dragItem);
  dragRef.current = dragItem;

  const idRef = useRef(0);
  const nextId = (prefix: string) => `${prefix}-${++idRef.current}`;

  function computeHover(clientX: number, clientY: number): Hover | null {
    const area = areaRef.current;
    if (!area) return null;
    const box = area.getBoundingClientRect();
    const local = { x: clientX - box.left, y: clientY - box.top };
    const inside = local.x >= 0 && local.y >= 0 && local.x < box.width && local.y < box.height;
    if (!inside) return null;

    const lay = layoutRef.current;
    if (!lay) {
      return { stackId: '', region: 'center', preview: { x: 0, y: 0, width: box.width, height: box.height } };
    }
    const content: Rect = { x: 0, y: 0, width: sizeRef.current.width, height: sizeRef.current.height };
    const rects = computeLayout(lay, content, GAP);
    for (const stack of listStacks(lay)) {
      const rect = rects.get(stack.id);
      if (!rect) continue;
      const dt = computeDropTarget(local, rect);
      if (dt) return { stackId: stack.id, region: dt.region, preview: dt.preview };
    }
    return null;
  }

  function dropView(clientX: number, clientY: number) {
    const item = dragRef.current;
    const hv = computeHover(clientX, clientY);
    if (item && hv) {
      const viewId = nextId('view');
      const prev = layoutRef.current;
      let next: LayoutNode;
      if (!prev) {
        const stackId = nextId('stack');
        next = createRoot(stackId, viewId);
        setActiveStackId(stackId);
      } else if (hv.region === 'center') {
        next = addView(prev, hv.stackId, viewId);
        setActiveStackId(hv.stackId);
      } else {
        const direction = dropRegionToSplitDirection(hv.region)!;
        const stackId = nextId('stack');
        const splitId = nextId('split');
        next = splitStack(prev, hv.stackId, direction, viewId, { splitId, stackId });
        setActiveStackId(stackId);
      }
      setLayout(next);
      setMetas((m) => ({ ...m, [viewId]: { label: item.label, color: item.color } }));
    }
    setDragItem(null);
    setGhost(null);
    setHover(null);
  }

  useEffect(() => {
    if (!dragItem) return;
    const onMove = (e: PointerEvent) => {
      setGhost({ x: e.clientX, y: e.clientY });
      setHover(computeHover(e.clientX, e.clientY));
    };
    const onUp = (e: PointerEvent) => dropView(e.clientX, e.clientY);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragItem]);

  const startDrag = (item: DragItem, e: React.PointerEvent) => {
    setDragItem(item);
    setGhost({ x: e.clientX, y: e.clientY });
  };

  const activate = (viewId: string) => {
    const lay = layoutRef.current;
    if (!lay) return;
    const stack = findStackOfView(lay, viewId);
    setLayout(setActiveView(lay, viewId));
    if (stack) setActiveStackId(stack.id);
  };

  const close = (viewId: string) => {
    const lay = layoutRef.current;
    if (!lay) return;
    const next = removeView(lay, viewId);
    setLayout(next);
    setMetas((m) => {
      const copy = { ...m };
      delete copy[viewId];
      return copy;
    });
    if (!next) setActiveStackId(null);
  };

  const reset = () => {
    setLayout(null);
    setMetas({});
    setActiveStackId(null);
  };

  const saveSnapshot = () => {
    const views: ViewState[] = Object.entries(metas).map(([id, m]) => ({
      id,
      url: m.color, // demo: stash color in url so restore can recolor
      title: m.label,
    }));
    const snap = createSnapshot([
      { id: 'playground', bounds: { x: 0, y: 0, width: size.width, height: size.height }, views, layout },
    ]);
    setSnapshotText(JSON.stringify(JSON.parse(serializeSnapshot(snap)), null, 2));
  };

  const restoreSnapshot = () => {
    try {
      const snap = deserializeSnapshot(snapshotText);
      const win = snap.windows[0];
      if (!win) return;
      const newMetas: ViewMeta = {};
      for (const v of win.views) newMetas[v.id] = { label: v.title ?? 'View', color: v.url || '#888888' };
      setMetas(newMetas);
      setLayout(win.layout);
      setActiveStackId(win.layout ? (listStacks(win.layout)[0]?.id ?? null) : null);
      idRef.current += 1000; // avoid id collisions with restored ids
    } catch (err) {
      alert(`Invalid snapshot: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const content: Rect = { x: 0, y: 0, width: size.width, height: size.height };
  const rects = layout ? computeLayout(layout, content, GAP) : new Map<string, Rect>();
  const stacks = listStacks(layout);

  return (
    <div className="pg">
      <header className="pg-top">
        <div className="pg-brand">
          <span className="pg-dot" /> Platform Playground
        </div>
        <p className="pg-hint">
          Drag a tile onto a pane — <strong>edges split</strong>, <strong>center adds a tab</strong>.
        </p>
        <div className="pg-actions">
          <button onClick={saveSnapshot}>Save snapshot</button>
          <button onClick={restoreSnapshot} disabled={!snapshotText}>Restore</button>
          <button onClick={reset} className="pg-danger">Reset</button>
        </div>
      </header>

      <div className="pg-body">
        <aside className="pg-palette">
          <div className="pg-palette-title">Apps</div>
          {PALETTE.map((item) => (
            <button
              key={item.label}
              className="pg-tile"
              style={{ ['--tile' as string]: item.color }}
              onPointerDown={(e) => startDrag(item, e)}
            >
              <span className="pg-tile-swatch" />
              {item.label}
            </button>
          ))}
          <p className="pg-palette-note">Drag me →</p>
        </aside>

        <main className="pg-stage">
          <div className="pg-area" ref={areaRef}>
            {!layout && (
              <div className="pg-empty">
                <div>Drag an app here to create your first view</div>
              </div>
            )}

            {stacks.map((stack) => {
              const rect = rects.get(stack.id);
              if (!rect) return null;
              const active = stack.activeViewId;
              const meta = active ? metas[active] : undefined;
              return (
                <div
                  key={stack.id}
                  className={`pg-pane ${stack.id === activeStackId ? 'is-active-stack' : ''}`}
                  style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
                >
                  <div className="pg-tabs">
                    {stack.viewIds.map((vid) => (
                      <div
                        key={vid}
                        className={`pg-tab ${vid === active ? 'is-active' : ''}`}
                        style={{ ['--tab' as string]: metas[vid]?.color ?? '#888' }}
                        onClick={() => activate(vid)}
                      >
                        <span className="pg-tab-swatch" />
                        {metas[vid]?.label ?? 'View'}
                        <button
                          className="pg-tab-close"
                          onClick={(e) => {
                            e.stopPropagation();
                            close(vid);
                          }}
                          aria-label="Close view"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="pg-view" style={{ ['--view' as string]: meta?.color ?? '#333' }}>
                    <div className="pg-view-label">{meta?.label ?? 'View'}</div>
                    <div className="pg-view-sub">{stack.id}</div>
                  </div>
                </div>
              );
            })}

            {hover && (
              <div
                className="pg-preview"
                style={{
                  left: hover.preview.x,
                  top: hover.preview.y,
                  width: hover.preview.width,
                  height: hover.preview.height,
                }}
              >
                <span className="pg-preview-label">
                  {hover.region === 'center' ? 'Add tab' : `Split ${hover.region}`}
                </span>
              </div>
            )}
          </div>

          {snapshotText && (
            <details className="pg-snapshot">
              <summary>Snapshot JSON</summary>
              <textarea
                value={snapshotText}
                onChange={(e) => setSnapshotText(e.target.value)}
                spellCheck={false}
              />
            </details>
          )}
        </main>
      </div>

      {dragItem && ghost && (
        <div className="pg-ghost" style={{ left: ghost.x, top: ghost.y, ['--tile' as string]: dragItem.color }}>
          <span className="pg-tile-swatch" />
          {dragItem.label}
        </div>
      )}
    </div>
  );
};

export default PlatformPlayground;
