/**
 * DockDemo — mounts the configurable Dock / App Bar on a sample desktop. Lets you move the dock
 * (top/bottom/left/right), toggle auto-hide, pin/unpin apps, launch items (toggling the running
 * dot), and open a dropdown group. State round-trips through DockModel.serialize(). Route: ?test=dock.
 */

import React, { useMemo, useReducer, useState } from 'react';
import { DockModel } from '../dock';
import type { DockButton, DockGroup, DockItem, DockPosition } from '../dock';
import './DockDemo.css';

const POSITIONS: DockPosition[] = ['top', 'bottom', 'left', 'right'];

function initialDock(onChange: () => void): DockModel {
  const model = new DockModel({ initial: { position: 'bottom' }, onChange });
  const apps: DockButton[] = [
    { id: 'chart', kind: 'button', label: 'Chart', icon: '📈', action: { type: 'launchApp', appId: 'chart' } },
    { id: 'news', kind: 'button', label: 'News', icon: '📰', action: { type: 'launchApp', appId: 'news' } },
    { id: 'blotter', kind: 'button', label: 'Blotter', icon: '🧾', action: { type: 'launchApp', appId: 'blotter' } },
  ];
  apps.forEach((a) => model.addItem(a));
  model.addItem({ id: 'sep1', kind: 'separator' });
  model.addItem({ id: 'intent', kind: 'button', label: 'View Chart', icon: '🎯', action: { type: 'raiseIntent', intent: 'ViewChart' } });
  const tools: DockGroup = {
    id: 'tools',
    kind: 'group',
    label: 'Tools',
    icon: '🧰',
    items: [
      { id: 'inspector', kind: 'button', label: 'FDC3 Inspector', action: { type: 'openUrl', url: '?test=fdc3-inspector' } },
      { id: 'palette', kind: 'button', label: 'Command Palette', action: { type: 'openUrl', url: '?test=palette' } },
      { id: 'platform', kind: 'button', label: 'Platform Playground', action: { type: 'openUrl', url: '?test=platform' } },
    ],
  };
  model.addItem(tools);
  return model;
}

function describeAction(item: DockButton): string {
  const a = item.action;
  switch (a.type) {
    case 'launchApp':
      return `launch app "${a.appId}"`;
    case 'raiseIntent':
      return `raise intent "${a.intent}"`;
    case 'openWorkspace':
      return `open workspace "${a.workspaceId}"`;
    case 'runFunction':
      return `run function "${a.functionId}"`;
    case 'openUrl':
      return `open ${a.url}`;
  }
}

export const DockDemo: React.FC = () => {
  const [, forceRender] = useReducer((n: number) => n + 1, 0);
  const dock = useMemo(() => initialDock(forceRender), []);
  const [log, setLog] = useState<string[]>([]);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const push = (msg: string) => setLog((l) => [msg, ...l].slice(0, 8));

  const runButton = (item: DockButton) => {
    push(`${describeAction(item)}`);
    if (item.action.type === 'launchApp') {
      dock.setRunning(item.action.appId, !dock.isRunning(item.action.appId));
    }
  };

  const items = dock.getItems();
  const vertical = dock.orientation() === 'vertical';

  const renderItem = (item: DockItem) => {
    if (item.kind === 'separator') {
      return <div key={item.id} className="dock-sep" />;
    }
    if (item.kind === 'group') {
      const open = openGroup === item.id;
      return (
        <div key={item.id} className="dock-group">
          <button className="dock-btn" title={item.label} onClick={() => setOpenGroup(open ? null : item.id)}>
            <span className="dock-icon">{item.icon ?? '▾'}</span>
            <span className="dock-label">{item.label}</span>
          </button>
          {open && (
            <div className={`dock-menu ${vertical ? 'is-vertical' : ''}`}>
              {item.items.map((b) => (
                <button
                  key={b.id}
                  className="dock-menu-item"
                  onClick={() => {
                    runButton(b);
                    setOpenGroup(null);
                  }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }
    const running = item.action.type === 'launchApp' && dock.isRunning(item.action.appId);
    return (
      <button key={item.id} className={`dock-btn ${running ? 'is-running' : ''}`} title={item.label} onClick={() => runButton(item)}>
        <span className="dock-icon">{item.icon ?? '●'}</span>
        <span className="dock-label">{item.label}</span>
        {running && <span className="dock-dot" />}
      </button>
    );
  };

  return (
    <div className="dockdemo">
      <header className="dockdemo-head">
        <h1>Dock / App Bar</h1>
        <div className="dockdemo-controls">
          <label>
            Position
            <select value={dock.getPosition()} onChange={(e) => dock.setPosition(e.target.value as DockPosition)}>
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="dockdemo-check">
            <input type="checkbox" checked={dock.isAutoHide()} onChange={(e) => dock.setAutoHide(e.target.checked)} />
            Auto-hide
          </label>
        </div>
        <div className="dockdemo-pins">
          {['watch', 'orders', 'risk'].map((id) =>
            dock.hasItem(id) ? (
              <button key={id} className="pin-btn is-pinned" onClick={() => dock.removeItem(id)}>
                − Unpin {id}
              </button>
            ) : (
              <button
                key={id}
                className="pin-btn"
                onClick={() => dock.addItem({ id, kind: 'button', label: id, icon: '📌', action: { type: 'launchApp', appId: id } })}
              >
                + Pin {id}
              </button>
            ),
          )}
        </div>
      </header>

      <div className="dockdemo-stage">
        <div className="dockdemo-desktop">
          <p>Sample desktop. Click a dock button to “launch” it — launched apps show a running dot.</p>
          <ul className="dockdemo-log">
            {log.length === 0 ? <li className="muted">No actions yet.</li> : log.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        </div>
        <div className={`dock dock-${dock.getPosition()} ${dock.isAutoHide() ? 'is-autohide' : ''}`}>
          <div className="dock-inner">{items.map(renderItem)}</div>
        </div>
      </div>
    </div>
  );
};

export default DockDemo;
