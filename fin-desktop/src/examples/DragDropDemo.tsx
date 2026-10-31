/**
 * DragDropDemo — drag typed items and files between two "apps", bridging the browser's native drag
 * events into the pure DragManager. Each app has a draggable source list and a drop zone that only
 * accepts certain formats, showing live accept/reject feedback. Route: ?test=dragdrop.
 */

import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { DragManager } from '../integration';
import type { DragPayload } from '../integration';
import './DragDropDemo.css';

interface Draggable {
  id: string;
  label: string;
  icon: string;
  payload: DragPayload;
}

const CHART_ITEMS: Draggable[] = [
  { id: 'aapl', label: 'AAPL instrument', icon: '📈', payload: { items: [{ format: 'fdc3.instrument', data: { ticker: 'AAPL' } }, { format: 'text/plain', data: 'AAPL' }], source: { appId: 'chart' } } },
  { id: 'msft', label: 'MSFT instrument', icon: '📈', payload: { items: [{ format: 'fdc3.instrument', data: { ticker: 'MSFT' } }, { format: 'text/plain', data: 'MSFT' }], source: { appId: 'chart' } } },
];

const FILES_ITEMS: Draggable[] = [
  { id: 'csv', label: 'report.csv', icon: '📄', payload: { items: [], files: [{ name: 'report.csv', size: 20480, type: 'text/csv' }], source: { appId: 'files' } } },
  { id: 'pdf', label: 'tearsheet.pdf', icon: '📕', payload: { items: [], files: [{ name: 'tearsheet.pdf', size: 102400, type: 'application/pdf' }], source: { appId: 'files' } } },
];

export const DragDropDemo: React.FC = () => {
  const [, forceRender] = useReducer((n: number) => n + 1, 0);
  const mgr = useMemo(() => new DragManager({ onChange: forceRender }), []);
  const [blotterDrops, setBlotterDrops] = useState<string[]>([]);
  const [viewerDrops, setViewerDrops] = useState<string[]>([]);

  useEffect(() => {
    const off1 = mgr.registerTarget({
      id: 'blotter',
      accepts: ['fdc3.instrument', 'text/plain'],
      onDrop: (p) => setBlotterDrops((d) => [describe(p), ...d].slice(0, 5)),
    });
    const off2 = mgr.registerTarget({
      id: 'viewer',
      accepts: ['files'],
      onDrop: (p) => setViewerDrops((d) => [describe(p), ...d].slice(0, 5)),
    });
    return () => {
      off1();
      off2();
    };
  }, [mgr]);

  const dropZone = (id: string, title: string, hint: string, drops: string[]) => {
    const hovering = mgr.getOverId() === id;
    const ok = hovering && mgr.canDrop(id);
    const reject = hovering && !mgr.canDrop(id);
    return (
      <div
        className={`dd-zone ${ok ? 'ok' : ''} ${reject ? 'reject' : ''}`}
        onDragOver={(e) => {
          if (mgr.canDrop(id)) e.preventDefault(); // allow drop
          mgr.dragOver(id);
        }}
        onDragLeave={() => mgr.getOverId() === id && mgr.dragOver(null)}
        onDrop={(e) => {
          e.preventDefault();
          mgr.drop(id);
        }}
      >
        <div className="dd-zone-title">{title}</div>
        <div className="dd-zone-hint">{hint}</div>
        <ul className="dd-zone-log">
          {drops.length === 0 ? <li className="muted">Nothing dropped yet.</li> : drops.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      </div>
    );
  };

  const sourceList = (title: string, items: Draggable[]) => (
    <div className="dd-source">
      <div className="dd-source-title">{title}</div>
      {items.map((item) => (
        <div
          key={item.id}
          className="dd-chip"
          draggable
          onDragStart={() => mgr.startDrag(item.payload)}
          onDragEnd={() => mgr.isDragging() && mgr.cancel()}
        >
          <span className="dd-chip-icon">{item.icon}</span>
          {item.label}
        </div>
      ))}
    </div>
  );

  return (
    <div className="dd">
      <header className="dd-head">
        <h1>Drag &amp; Drop Between Apps</h1>
        <p>Drag items from the left apps onto the drop zones. Zones accept only certain formats — watch the border turn green (accept) or red (reject).</p>
      </header>
      <div className="dd-grid">
        <section className="dd-panel">
          <h2>Sources</h2>
          {sourceList('Chart app — instruments', CHART_ITEMS)}
          {sourceList('Files app — files', FILES_ITEMS)}
        </section>
        <section className="dd-panel">
          <h2>Trade Blotter</h2>
          <p className="dd-accepts">accepts: fdc3.instrument, text/plain</p>
          {dropZone('blotter', 'Drop an instrument', 'Adds it to the blotter', blotterDrops)}
        </section>
        <section className="dd-panel">
          <h2>File Viewer</h2>
          <p className="dd-accepts">accepts: files</p>
          {dropZone('viewer', 'Drop a file', 'Opens it in the viewer', viewerDrops)}
        </section>
      </div>
    </div>
  );
};

function describe(payload: DragPayload): string {
  if (payload.files && payload.files.length > 0) {
    return payload.files.map((f) => `${f.name} (${Math.round((f.size ?? 0) / 1024)} KB)`).join(', ');
  }
  const instrument = payload.items.find((i) => i.format === 'fdc3.instrument');
  if (instrument) return `instrument: ${JSON.stringify(instrument.data)}`;
  const text = payload.items.find((i) => i.format === 'text/plain');
  return text ? `text: ${String(text.data)}` : payload.items.map((i) => i.format).join(', ');
}

export default DragDropDemo;
