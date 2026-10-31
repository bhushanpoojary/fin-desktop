/**
 * PlatformControl — the interactive controller UI for the real-windows Platform demo.
 *
 * Runs in a BrowserWindow (`npm run dev:platform`, route `?test=platform-control`) with a
 * preload that exposes `window.platform`. It renders a live map of the Platform's layout and
 * a drag-dock surface; drops/clicks are sent as commands to the main process, which rearranges
 * the real WebContentsView "stage" window. State is pushed back and re-rendered.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  computeLayout,
  listStacks,
  computeDropTarget,
  type LayoutNode,
  type Rect,
  type DropRegion,
} from '../platform';
import './PlatformPlayground.css';

interface AppTile {
  label: string;
  color: string;
}

type ViewMeta = Record<string, { label: string; color: string }>;

interface PlatformState {
  layout: LayoutNode | null;
  meta: ViewMeta;
  apps: AppTile[];
}

interface PlatformCommand {
  type: 'drop' | 'activate' | 'close' | 'reset' | 'snapshot-save' | 'snapshot-restore';
  targetStackId?: string;
  region?: DropRegion;
  label?: string;
  viewId?: string;
  json?: string;
}

interface PlatformBridge {
  command: (cmd: PlatformCommand) => Promise<string | undefined>;
  getState: () => Promise<PlatformState>;
  onState: (cb: (state: PlatformState) => void) => () => void;
}

declare global {
  interface Window {
    platform?: PlatformBridge;
  }
}

interface Hover {
  stackId: string;
  region: DropRegion;
  preview: Rect;
}

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

export const PlatformControl: React.FC = () => {
  const [areaRef, size] = useElementSize();
  const bridge = typeof window !== 'undefined' ? window.platform : undefined;

  const [state, setState] = useState<PlatformState>({ layout: null, meta: {}, apps: [] });
  const [dragItem, setDragItem] = useState<AppTile | null>(null);
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);
  const [hover, setHover] = useState<Hover | null>(null);
  const [snapshotText, setSnapshotText] = useState('');

  const stateRef = useRef(state);
  stateRef.current = state;
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const dragRef = useRef(dragItem);
  dragRef.current = dragItem;

  useEffect(() => {
    if (!bridge) return;
    const off = bridge.onState(setState);
    void bridge.getState().then(setState);
    return off;
  }, [bridge]);

  function computeHover(clientX: number, clientY: number): Hover | null {
    const area = areaRef.current;
    if (!area) return null;
    const box = area.getBoundingClientRect();
    const local = { x: clientX - box.left, y: clientY - box.top };
    const inside = local.x >= 0 && local.y >= 0 && local.x < box.width && local.y < box.height;
    if (!inside) return null;

    const lay = stateRef.current.layout;
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
    if (item && hv && bridge) {
      void bridge.command({
        type: 'drop',
        targetStackId: hv.stackId,
        region: hv.region,
        label: item.label,
      });
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

  const startDrag = (item: AppTile, e: React.PointerEvent) => {
    setDragItem(item);
    setGhost({ x: e.clientX, y: e.clientY });
  };

  const saveSnapshot = async () => {
    if (!bridge) return;
    const json = await bridge.command({ type: 'snapshot-save' });
    if (json) setSnapshotText(json);
  };

  const restoreSnapshot = () => {
    if (bridge && snapshotText) void bridge.command({ type: 'snapshot-restore', json: snapshotText });
  };

  if (!bridge) {
    return (
      <div className="pg">
        <div className="pg-empty" style={{ position: 'absolute', inset: 0 }}>
          <div>
            This controller must run inside the Platform demo.
            <br />
            Launch it with <code>npm run dev:platform</code>.
          </div>
        </div>
      </div>
    );
  }

  const content: Rect = { x: 0, y: 0, width: size.width, height: size.height };
  const rects = state.layout ? computeLayout(state.layout, content, GAP) : new Map<string, Rect>();
  const stacks = listStacks(state.layout);

  return (
    <div className="pg">
      <header className="pg-top">
        <div className="pg-brand">
          <span className="pg-dot" /> Platform Controller
        </div>
        <p className="pg-hint">
          Drag a tile onto a pane to arrange the <strong>real stage window</strong> → edges split, center tabs.
        </p>
        <div className="pg-actions">
          <button onClick={saveSnapshot}>Save snapshot</button>
          <button onClick={restoreSnapshot} disabled={!snapshotText}>Restore</button>
          <button onClick={() => void bridge.command({ type: 'reset' })} className="pg-danger">Reset</button>
        </div>
      </header>

      <div className="pg-body">
        <aside className="pg-palette">
          <div className="pg-palette-title">Apps</div>
          {state.apps.map((item) => (
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
            {!state.layout && (
              <div className="pg-empty">
                <div>Drag an app here to open it in the stage window</div>
              </div>
            )}

            {stacks.map((stack) => {
              const rect = rects.get(stack.id);
              if (!rect) return null;
              const active = stack.activeViewId;
              const meta = active ? state.meta[active] : undefined;
              return (
                <div
                  key={stack.id}
                  className="pg-pane"
                  style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
                >
                  <div className="pg-tabs">
                    {stack.viewIds.map((vid) => (
                      <div
                        key={vid}
                        className={`pg-tab ${vid === active ? 'is-active' : ''}`}
                        style={{ ['--tab' as string]: state.meta[vid]?.color ?? '#888' }}
                        onClick={() => void bridge.command({ type: 'activate', viewId: vid })}
                      >
                        <span className="pg-tab-swatch" />
                        {state.meta[vid]?.label ?? 'View'}
                        <button
                          className="pg-tab-close"
                          onClick={(e) => {
                            e.stopPropagation();
                            void bridge.command({ type: 'close', viewId: vid });
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
                    <div className="pg-view-sub">live in stage · {stack.id}</div>
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
              <textarea value={snapshotText} onChange={(e) => setSnapshotText(e.target.value)} spellCheck={false} />
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

export default PlatformControl;
