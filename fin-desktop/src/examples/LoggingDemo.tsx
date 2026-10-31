/**
 * LoggingDemo — a structured logger writing to a RotatingFileSink over an in-memory file system.
 * Emit log lines at different levels and watch the active file rotate into bounded backups as it
 * crosses the size threshold. Route: ?test=logging.
 */

import React, { useMemo, useReducer, useState } from 'react';
import { Logger, RotatingFileSink, createInMemoryLogFs } from '../telemetry';
import type { TelemetryLevel } from '../telemetry';
import './LoggingDemo.css';

const MESSAGES: Array<{ level: TelemetryLevel; text: string; context?: string }> = [
  { level: 'info', text: 'Workspace restored', context: 'platform' },
  { level: 'debug', text: 'Channel joined: red', context: 'fdc3' },
  { level: 'warn', text: 'Intent resolution slow (820ms)', context: 'fdc3' },
  { level: 'error', text: 'View failed to load', context: 'platform' },
  { level: 'info', text: 'Notification delivered', context: 'notifications' },
];

export const LoggingDemo: React.FC = () => {
  const [, forceRender] = useReducer((n: number) => n + 1, 0);
  const fs = useMemo(() => createInMemoryLogFs(), []);
  const logger = useMemo(() => {
    // Small threshold so rotation is easy to observe in the demo.
    const sink = new RotatingFileSink({ fs, path: 'logs/app.log', maxBytes: 400, maxFiles: 3 });
    return new Logger({ sink, level: 'debug' });
  }, [fs]);
  const [seq, setSeq] = useState(0);

  const emit = () => {
    const m = MESSAGES[seq % MESSAGES.length];
    const log = m.context ? logger.child(m.context) : logger;
    log[m.level](`#${seq + 1} ${m.text}`);
    setSeq((s) => s + 1);
    forceRender();
  };

  const files = fs.list().sort();

  return (
    <div className="log">
      <header className="log-head">
        <h1>Structured Logging &amp; File Rotation</h1>
        <p>A `Logger` writing to a `RotatingFileSink` (maxBytes 400, keep 3 backups) over an in-memory FS.</p>
        <button className="log-btn primary" onClick={emit}>
          Emit log line
        </button>
        <button className="log-btn" onClick={() => { for (let i = 0; i < 10; i++) emit(); }}>
          Emit ×10
        </button>
      </header>

      <div className="log-files">
        {files.length === 0 ? (
          <p className="log-empty">No log files yet — emit a line.</p>
        ) : (
          files.map((path) => (
            <section key={path} className="log-file">
              <div className="log-file-head">
                <span className="log-file-name">{path}</span>
                <span className="log-file-size">{fs.size(path)} bytes</span>
              </div>
              <pre className="log-file-body">{fs.read(path).trim() || '(empty)'}</pre>
            </section>
          ))
        )}
      </div>
    </div>
  );
};

export default LoggingDemo;
