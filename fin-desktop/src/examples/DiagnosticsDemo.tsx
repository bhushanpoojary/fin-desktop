/**
 * DiagnosticsDemo — a health panel that runs self-diagnostics (the same checks a `--diagnostics`
 * command would) and shows the aggregated report. Toggle conditions to see statuses change. Route:
 * ?test=diagnostics.
 */

import React, { useState } from 'react';
import {
  DiagnosticsRunner,
  runtimeVersionCheck,
  permissionCheck,
  connectivityCheck,
  formatReport,
} from '../diagnostics';
import type { DiagnosticsReport, DiagnosticStatus } from '../diagnostics';
import './DiagnosticsDemo.css';

const STATUS_META: Record<DiagnosticStatus, { icon: string; className: string }> = {
  ok: { icon: '✓', className: 'ok' },
  warn: { icon: '!', className: 'warn' },
  fail: { icon: '✗', className: 'fail' },
};

export const DiagnosticsDemo: React.FC = () => {
  const [notificationsGranted, setNotificationsGranted] = useState(true);
  const [directoryOnline, setDirectoryOnline] = useState(true);
  const [oldRuntime, setOldRuntime] = useState(false);
  const [report, setReport] = useState<DiagnosticsReport | null>(null);

  const runChecks = async () => {
    const runner = new DiagnosticsRunner()
      .register(runtimeVersionCheck(oldRuntime ? '0.9.0' : '1.2.0', '1.0.0'))
      .register(permissionCheck('notifications', notificationsGranted))
      .register(permissionCheck('clipboard', true))
      .register(connectivityCheck('app-directory', () => directoryOnline))
      .register(connectivityCheck('update-feed', () => true));
    setReport(await runner.run());
  };

  return (
    <div className="diag">
      <header className="diag-head">
        <h1>Self-Diagnostics</h1>
        <p>Run the health checks a <code>--diagnostics</code> command would. Toggle conditions, then re-run.</p>
      </header>

      <div className="diag-grid">
        <section className="diag-panel">
          <h2>Conditions</h2>
          <label className="diag-check">
            <input type="checkbox" checked={notificationsGranted} onChange={(e) => setNotificationsGranted(e.target.checked)} />
            Notifications permission granted
          </label>
          <label className="diag-check">
            <input type="checkbox" checked={directoryOnline} onChange={(e) => setDirectoryOnline(e.target.checked)} />
            App directory reachable
          </label>
          <label className="diag-check">
            <input type="checkbox" checked={oldRuntime} onChange={(e) => setOldRuntime(e.target.checked)} />
            Simulate outdated runtime (0.9.0)
          </label>
          <button className="diag-btn primary" onClick={runChecks}>
            Run diagnostics
          </button>
        </section>

        <section className="diag-panel">
          <h2>Report</h2>
          {!report ? (
            <p className="diag-empty">Run diagnostics to see the report.</p>
          ) : (
            <>
              <div className={`diag-overall ${STATUS_META[report.status].className}`}>
                {STATUS_META[report.status].icon} Overall: {report.status.toUpperCase()}
                <span className="diag-counts">
                  ok {report.summary.ok} · warn {report.summary.warn} · fail {report.summary.fail}
                </span>
              </div>
              <ul className="diag-list">
                {report.results.map((r) => (
                  <li key={r.id} className={`diag-item ${STATUS_META[r.status].className}`}>
                    <span className="diag-item-icon">{STATUS_META[r.status].icon}</span>
                    <span className="diag-item-label">{r.label}</span>
                    {r.message && <span className="diag-item-msg">{r.message}</span>}
                  </li>
                ))}
              </ul>
              <h3>CLI output</h3>
              <pre className="diag-cli">{formatReport(report)}</pre>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default DiagnosticsDemo;
