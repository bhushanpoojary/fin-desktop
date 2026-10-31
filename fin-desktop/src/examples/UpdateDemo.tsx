/**
 * UpdateDemo — a staged auto-update console: choose a channel, adjust the rollout percentage, and
 * see whether the current build qualifies for the latest release (with a mandatory override and a
 * simulated install + rollback). All logic comes from the pure update checker. Route: ?test=update.
 */

import React, { useMemo, useReducer, useState } from 'react';
import { checkForUpdate, rolloutBucket, UpdateController } from '../update';
import type { UpdateChannel, UpdateFeed } from '../update';
import './UpdateDemo.css';

const CHANNELS: UpdateChannel[] = ['stable', 'beta'];

export const UpdateDemo: React.FC = () => {
  const [, forceRender] = useReducer((n: number) => n + 1, 0);
  const controller = useMemo(() => new UpdateController('1.2.0'), []);
  const [channel, setChannel] = useState<UpdateChannel>('stable');
  const [rollout, setRollout] = useState(100);
  const [mandatory, setMandatory] = useState(false);
  const [machineId, setMachineId] = useState('machine-7a2f');
  const [log, setLog] = useState<string[]>([]);

  const feed: UpdateFeed = useMemo(
    () => ({
      releases: [
        { version: '1.2.0', channel: 'stable', url: 'https://dl/1.2.0' },
        { version: '1.3.0', channel: 'stable', url: 'https://dl/1.3.0', notes: 'Perf + bug fixes', rolloutPercentage: rollout, mandatory },
        { version: '2.0.0-beta.3', channel: 'beta', url: 'https://dl/2.0.0-beta.3', notes: 'New platform core', rolloutPercentage: rollout, mandatory },
      ],
    }),
    [rollout, mandatory],
  );

  const result = checkForUpdate(controller.getCurrentVersion(), feed, { channel, machineId });
  const bucket = rolloutBucket(machineId, result.release?.version ?? '');

  const push = (line: string) => setLog((l) => [line, ...l].slice(0, 6));

  const install = () => {
    if (!result.release) return;
    controller.install(result.release);
    push(`Installed ${result.release.version}`);
    forceRender();
  };
  const rollback = () => {
    const target = controller.rollback();
    if (target) push(`Rolled back to ${target}`);
    forceRender();
  };

  return (
    <div className="upd">
      <header className="upd-head">
        <h1>Auto-Update</h1>
        <p>Version channels + staged rollout. Current build: <strong>{controller.getCurrentVersion()}</strong></p>
      </header>

      <div className="upd-grid">
        <section className="upd-panel">
          <h2>Update feed settings</h2>
          <label className="upd-field">
            Channel
            <select value={channel} onChange={(e) => setChannel(e.target.value as UpdateChannel)}>
              {CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="upd-field">
            Rollout: {rollout}%
            <input type="range" min={0} max={100} value={rollout} onChange={(e) => setRollout(Number(e.target.value))} />
          </label>
          <label className="upd-field">
            Machine ID
            <input value={machineId} onChange={(e) => setMachineId(e.target.value)} />
          </label>
          <label className="upd-check">
            <input type="checkbox" checked={mandatory} onChange={(e) => setMandatory(e.target.checked)} />
            Mandatory (bypass rollout)
          </label>
          <div className="upd-bucket">
            This machine's rollout bucket for the candidate: <strong>{bucket}</strong> (qualifies if &lt; {rollout}%)
          </div>
        </section>

        <section className="upd-panel">
          <h2>Result</h2>
          <div className={`upd-status ${result.available ? 'available' : result.reason === 'held-by-rollout' ? 'held' : 'current'}`}>
            {result.available ? `Update available: ${result.release?.version}` : result.reason.replace(/-/g, ' ')}
            {result.mandatory && <span className="upd-badge">mandatory</span>}
          </div>
          {result.release?.notes && <p className="upd-notes">“{result.release.notes}”</p>}
          <div className="upd-actions">
            <button className="upd-btn primary" onClick={install} disabled={!result.available}>
              Install
            </button>
            <button className="upd-btn" onClick={rollback} disabled={!controller.canRollback()}>
              Rollback
            </button>
          </div>
          <div className="upd-versions">
            current <strong>{controller.getCurrentVersion()}</strong>
            {controller.getPreviousVersion() && <> · previous {controller.getPreviousVersion()}</>}
          </div>
          <h3>Activity</h3>
          <ul className="upd-log">
            {log.length === 0 ? <li className="muted">No actions yet.</li> : log.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default UpdateDemo;
