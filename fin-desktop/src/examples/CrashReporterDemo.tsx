/**
 * CrashReporterDemo — simulate process crashes captured by the CrashReporter. Reports are always
 * stored locally; uploads to the (fake) collector only happen when the opt-in toggle is on, and
 * sensitive metadata keys are redacted. Route: ?test=crash.
 */

import React, { useMemo, useReducer, useState } from 'react';
import { CrashReporter } from '../telemetry';
import type { CrashProcess } from '../telemetry';
import './CrashReporterDemo.css';

const SCENARIOS: Array<{ process: CrashProcess; reason: string; fatal: boolean }> = [
  { process: 'renderer', reason: 'Renderer crashed (SIGSEGV)', fatal: true },
  { process: 'gpu', reason: 'GPU process hung', fatal: false },
  { process: 'main', reason: 'Out of memory', fatal: true },
  { process: 'utility', reason: 'Utility process killed', fatal: false },
];

export const CrashReporterDemo: React.FC = () => {
  const [, forceRender] = useReducer((n: number) => n + 1, 0);
  const [uploaded, setUploaded] = useState<string[]>([]);
  const reporter = useMemo(
    () =>
      new CrashReporter({
        redactKeys: ['token', 'email'],
        uploader: { upload: (r) => setUploaded((u) => [`${r.id} · ${r.process}`, ...u].slice(0, 6)) },
      }),
    [],
  );
  const [seq, setSeq] = useState(0);

  const simulate = () => {
    const s = SCENARIOS[seq % SCENARIOS.length];
    reporter.report({
      process: s.process,
      reason: s.reason,
      fatal: s.fatal,
      stack: `at <anonymous> (app://window/${s.process}:42:7)`,
      metadata: { view: 'blotter', token: 'sess-abc123', email: 'trader@firm.com' },
    });
    setSeq((n) => n + 1);
    forceRender();
  };

  return (
    <div className="crash">
      <header className="crash-head">
        <div>
          <h1>Crash Reporting</h1>
          <p>Reports are captured locally; upload is opt-in and sensitive metadata is redacted.</p>
        </div>
        <div className="crash-actions">
          <button className="crash-btn primary" onClick={simulate}>
            Simulate crash
          </button>
          <label className="crash-check">
            <input type="checkbox" checked={reporter.isEnabled()} onChange={(e) => { reporter.setEnabled(e.target.checked); forceRender(); }} />
            Upload to collector (opt-in)
          </label>
          <button className="crash-btn" onClick={() => { reporter.clear(); forceRender(); }}>
            Clear
          </button>
        </div>
      </header>

      <div className="crash-grid">
        <section className="crash-panel">
          <h2>Captured reports ({reporter.count()})</h2>
          {reporter.count() === 0 ? (
            <p className="crash-empty">No crashes captured.</p>
          ) : (
            <ul className="crash-list">
              {reporter.list().reverse().map((r) => (
                <li key={r.id} className={r.fatal ? 'fatal' : ''}>
                  <div className="crash-row">
                    <span className="crash-proc">{r.process}</span>
                    <span className="crash-reason">{r.reason}</span>
                    {r.fatal && <span className="crash-badge">fatal</span>}
                  </div>
                  <div className="crash-meta">metadata: {JSON.stringify(r.metadata)}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="crash-panel">
          <h2>Collector uploads</h2>
          {uploaded.length === 0 ? (
            <p className="crash-empty">{reporter.isEnabled() ? 'No uploads yet.' : 'Uploads are off (opt-in).'}</p>
          ) : (
            <ul className="crash-uploads">
              {uploaded.map((u, i) => (
                <li key={i}>↑ {u}</li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default CrashReporterDemo;
