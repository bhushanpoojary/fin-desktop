/**
 * AuditTrailDemo — a tamper-evident compliance log. Record sample actions, filter them, verify the
 * hash chain, and tamper with an entry to watch verification fail. Route: ?test=audit.
 */

import React, { useMemo, useReducer, useState } from 'react';
import { AuditLog } from '../audit';
import type { AuditOutcome } from '../audit';
import './AuditTrailDemo.css';

const SAMPLES: Array<{ actor: string; action: string; target?: string; outcome: AuditOutcome }> = [
  { actor: 'alice', action: 'login', outcome: 'success' },
  { actor: 'alice', action: 'raiseIntent', target: 'ViewChart', outcome: 'success' },
  { actor: 'bob', action: 'openApp', target: 'blotter', outcome: 'success' },
  { actor: 'bob', action: 'exportData', target: 'positions.csv', outcome: 'denied' },
  { actor: 'carol', action: 'changeConfig', target: 'updateChannel', outcome: 'success' },
  { actor: 'carol', action: 'raiseIntent', target: 'ViewNews', outcome: 'failure' },
];

const OUTCOME_CLASS: Record<AuditOutcome, string> = { success: 'ok', denied: 'warn', failure: 'fail' };

export const AuditTrailDemo: React.FC = () => {
  const [, forceRender] = useReducer((n: number) => n + 1, 0);
  const audit = useMemo(() => new AuditLog(), []);
  const [seq, setSeq] = useState(0);
  const [actorFilter, setActorFilter] = useState('');
  const [text, setText] = useState('');

  const record = () => {
    const s = SAMPLES[seq % SAMPLES.length];
    audit.record({ ...s, metadata: { ip: '10.0.0.5' } });
    setSeq((n) => n + 1);
    forceRender();
  };

  const tamper = () => {
    // Demo only: reach into private state to corrupt an entry and break the hash chain.
    const entries = (audit as unknown as { entries: Array<{ action: string }> }).entries;
    // eslint-disable-next-line react-hooks/immutability
    if (entries.length > 0) entries[0].action = 'TAMPERED';
    forceRender();
  };

  const verified = audit.verify();
  const results = audit.query({ actor: actorFilter || undefined, text: text || undefined });
  const actors = [...new Set(audit.all().map((e) => e.actor))];

  return (
    <div className="audit">
      <header className="audit-head">
        <div>
          <h1>Audit Trail</h1>
          <p>Tamper-evident compliance log — each entry is hash-chained to the previous.</p>
        </div>
        <div className="audit-actions">
          <button className="audit-btn primary" onClick={record}>
            Record action
          </button>
          <button className="audit-btn danger" onClick={tamper} disabled={audit.count() === 0}>
            Tamper with entry #1
          </button>
        </div>
      </header>

      <div className={`audit-integrity ${verified ? 'ok' : 'broken'}`}>
        {verified ? '✓ Chain verified — no tampering detected' : '✗ Integrity check FAILED — the log was altered'}
      </div>

      <div className="audit-filters">
        <select value={actorFilter} onChange={(e) => setActorFilter(e.target.value)}>
          <option value="">All actors</option>
          {actors.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <input placeholder="Search action/target…" value={text} onChange={(e) => setText(e.target.value)} />
        <span className="audit-count">{results.length} / {audit.count()} entries</span>
      </div>

      <table className="audit-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Target</th>
            <th>Outcome</th>
            <th>Hash</th>
          </tr>
        </thead>
        <tbody>
          {results.length === 0 ? (
            <tr>
              <td colSpan={6} className="audit-empty">No entries. Record an action.</td>
            </tr>
          ) : (
            results.map((e) => (
              <tr key={e.id}>
                <td>{new Date(e.timestamp).toLocaleTimeString()}</td>
                <td>{e.actor}</td>
                <td className="audit-action">{e.action}</td>
                <td>{e.target ?? '—'}</td>
                <td>
                  <span className={`audit-outcome ${OUTCOME_CLASS[e.outcome]}`}>{e.outcome}</span>
                </td>
                <td className="audit-hash">{e.hash}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AuditTrailDemo;
