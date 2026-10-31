/**
 * RemoteConfigDemo — layered configuration (defaults < remote < local override) with source badges,
 * plus feature-flag evaluation with allow/deny targeting and staged rollout. Simulate a remote push
 * and evaluate flags for different user ids. Route: ?test=config.
 */

import React, { useMemo, useReducer, useState } from 'react';
import { ConfigStore, FeatureFlags } from '../config/remoteConfig';
import './RemoteConfigDemo.css';

const CONFIG_KEYS = ['theme', 'maxViews', 'telemetry', 'updateChannel'];

export const RemoteConfigDemo: React.FC = () => {
  const [, forceRender] = useReducer((n: number) => n + 1, 0);
  const store = useMemo(
    () =>
      new ConfigStore({
        defaults: { theme: 'light', maxViews: 8, telemetry: false, updateChannel: 'stable' },
        onChange: forceRender,
      }),
    [],
  );
  const flags = useMemo(
    () =>
      new FeatureFlags(
        [
          { key: 'newLauncher', enabled: true },
          { key: 'betaBrowser', enabled: true, rolloutPercentage: 50 },
          { key: 'aiAssistant', enabled: true, allow: ['alice'], deny: ['bob'], rolloutPercentage: 0 },
        ],
        forceRender,
      ),
    [],
  );
  const [userId, setUserId] = useState('alice');

  const pushRemote = () => store.setRemote({ theme: 'dark', telemetry: true, updateChannel: 'beta' });

  return (
    <div className="rc">
      <header className="rc-head">
        <h1>Remote Config &amp; Feature Flags</h1>
        <p>Layered configuration (defaults &lt; remote push &lt; local override) and flag targeting.</p>
      </header>

      <div className="rc-grid">
        <section className="rc-panel">
          <h2>Configuration</h2>
          <div className="rc-actions">
            <button className="rc-btn primary" onClick={pushRemote}>
              Simulate remote push
            </button>
            <button className="rc-btn" onClick={() => { CONFIG_KEYS.forEach((k) => store.clearOverride(k)); forceRender(); }}>
              Clear overrides
            </button>
          </div>
          <table className="rc-table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
                <th>Source</th>
                <th>Override</th>
              </tr>
            </thead>
            <tbody>
              {CONFIG_KEYS.map((key) => (
                <tr key={key}>
                  <td className="rc-key">{key}</td>
                  <td>{String(store.get(key))}</td>
                  <td>
                    <span className={`rc-source ${store.sourceOf(key)}`}>{store.sourceOf(key)}</span>
                  </td>
                  <td>
                    <button className="rc-mini" onClick={() => store.setOverride(key, `override-${Date.now() % 1000}`)}>
                      set
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rc-panel">
          <h2>Feature flags</h2>
          <label className="rc-field">
            Evaluate for user id
            <select value={userId} onChange={(e) => setUserId(e.target.value)}>
              {['alice', 'bob', 'carol', 'dave'].map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </label>
          <ul className="rc-flags">
            {flags.list().map((f) => {
              const on = flags.isEnabled(f.key, { id: userId });
              return (
                <li key={f.key}>
                  <span className={`rc-flag-dot ${on ? 'on' : 'off'}`} />
                  <span className="rc-flag-key">{f.key}</span>
                  <span className="rc-flag-meta">
                    {f.rolloutPercentage !== undefined && f.rolloutPercentage < 100 ? `${f.rolloutPercentage}% rollout` : ''}
                    {f.allow ? ` allow:${f.allow.join(',')}` : ''}
                    {f.deny ? ` deny:${f.deny.join(',')}` : ''}
                  </span>
                  <span className={`rc-flag-state ${on ? 'on' : 'off'}`}>{on ? 'ON' : 'OFF'}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default RemoteConfigDemo;
