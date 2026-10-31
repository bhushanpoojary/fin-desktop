/**
 * HealthDemo — a process explorer: a deterministic fake sampler feeds the HealthMonitor, which
 * classifies per-process CPU/memory against thresholds and rolls up totals. "Refresh" captures a
 * new snapshot; "Spike" pushes a renderer into the critical band. Route: ?test=health.
 */

import React, { useMemo, useReducer, useState } from 'react';
import { HealthMonitor, formatBytes } from '../health';
import type { ProcessSample, ProcessKind, HealthStatus } from '../health';
import './HealthDemo.css';

const MB = 1024 * 1024;

const BASE: Array<{ id: string; label: string; kind: ProcessKind; cpu: number; mem: number }> = [
  { id: 'main', label: 'Main process', kind: 'main', cpu: 4, mem: 90 },
  { id: 'gpu', label: 'GPU process', kind: 'gpu', cpu: 8, mem: 140 },
  { id: 'r-chart', label: 'View: Price Chart', kind: 'renderer', cpu: 22, mem: 180 },
  { id: 'r-blotter', label: 'View: Trade Blotter', kind: 'renderer', cpu: 15, mem: 260 },
  { id: 'r-news', label: 'View: Market News', kind: 'renderer', cpu: 10, mem: 150 },
];

const STATUS_CLASS: Record<HealthStatus, string> = { ok: 'ok', warn: 'warn', critical: 'critical' };

export const HealthDemo: React.FC = () => {
  const [, forceRender] = useReducer((n: number) => n + 1, 0);
  const monitor = useMemo(() => new HealthMonitor(), []);
  const [tick, setTick] = useState(0);
  const [spike, setSpike] = useState(false);

  // Deterministic wobble per process so refreshes look alive without Math.random.
  const buildSamples = (t: number, spiked: boolean): ProcessSample[] =>
    BASE.map((p, i) => {
      const wobble = ((t * 7 + i * 13) % 20) - 10; // -10..9
      const cpu = Math.max(1, p.cpu + wobble);
      const mem = (p.mem + ((t * 11 + i * 5) % 40)) * MB;
      if (spiked && p.id === 'r-blotter') return { id: p.id, label: p.label, kind: p.kind, cpuPercent: 92, memoryBytes: 680 * MB };
      return { id: p.id, label: p.label, kind: p.kind, cpuPercent: cpu, memoryBytes: mem };
    });

  const refresh = () => {
    const next = tick + 1;
    monitor.capture(buildSamples(next, spike));
    setTick(next);
    forceRender();
  };

  const snap = monitor.latest();

  return (
    <div className="health">
      <header className="health-head">
        <div>
          <h1>System Health — Process Explorer</h1>
          <p>Per-process CPU &amp; memory classified against thresholds (warn/critical).</p>
        </div>
        <div className="health-actions">
          <button className="health-btn primary" onClick={refresh}>
            Refresh
          </button>
          <label className="health-check">
            <input type="checkbox" checked={spike} onChange={(e) => setSpike(e.target.checked)} />
            Spike blotter
          </label>
        </div>
      </header>

      {!snap ? (
        <p className="health-empty">Click Refresh to capture the first snapshot.</p>
      ) : (
        <>
          <div className="health-totals">
            <div className={`health-overall ${STATUS_CLASS[snap.status]}`}>Overall: {snap.status.toUpperCase()}</div>
            <div className="health-total-item">Processes: {snap.totals.count}</div>
            <div className="health-total-item">CPU: {snap.totals.cpuPercent}%</div>
            <div className="health-total-item">Memory: {formatBytes(snap.totals.memoryBytes)}</div>
          </div>

          <table className="health-table">
            <thead>
              <tr>
                <th>Process</th>
                <th>Type</th>
                <th>CPU</th>
                <th>Memory</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {snap.processes.map((p) => (
                <tr key={p.id} className={STATUS_CLASS[p.status]}>
                  <td>{p.label}</td>
                  <td className="health-kind">{p.kind}</td>
                  <td>
                    <div className="health-bar">
                      <div className="health-bar-fill cpu" style={{ width: `${Math.min(100, p.cpuPercent)}%` }} />
                      <span>{Math.round(p.cpuPercent)}%</span>
                    </div>
                  </td>
                  <td>{formatBytes(p.memoryBytes)}</td>
                  <td>
                    <span className={`health-pill ${STATUS_CLASS[p.status]}`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="health-top">
            <h3>Top memory consumers</h3>
            <ol>
              {monitor.top(3, 'memory').map((p) => (
                <li key={p.id}>
                  {p.label} — {formatBytes(p.memoryBytes)}
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </div>
  );
};

export default HealthDemo;
