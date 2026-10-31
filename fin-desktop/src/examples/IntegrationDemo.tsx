/**
 * IntegrationDemo — exercises the Clipboard API (multi-format read/write) and the global hotkey
 * registry (register accelerators, then press the keys to fire them). The hotkey registry is wired
 * to the window's real keydown events. Route: ?test=integration.
 */

import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { Clipboard, HotkeyRegistry } from '../integration';
import './IntegrationDemo.css';

export const IntegrationDemo: React.FC = () => {
  const [, forceRender] = useReducer((n: number) => n + 1, 0);
  const clipboard = useMemo(() => new Clipboard({ onChange: forceRender }), []);
  const hotkeys = useMemo(() => new HotkeyRegistry(), []);

  const [text, setText] = useState('AAPL 178.25');
  const [html, setHtml] = useState('<b>AAPL</b> 178.25');
  const [log, setLog] = useState<string[]>([]);

  const push = (line: string) => setLog((l) => [line, ...l].slice(0, 8));

  // Register demo hotkeys and bridge the window's keydown into the registry.
  useEffect(() => {
    hotkeys.register('CmdOrCtrl+Shift+C', () => {
      clipboard.writeText(`copied @ ${new Date().toLocaleTimeString()}`);
      push('⌘/Ctrl+Shift+C → wrote to clipboard');
    });
    hotkeys.register('CmdOrCtrl+Shift+V', () => push(`⌘/Ctrl+Shift+V → clipboard: "${clipboard.readText()}"`));
    hotkeys.register('Alt+1', () => push('Alt+1 → action one'));
    hotkeys.register('Alt+2', () => push('Alt+2 → action two'));

    const onKey = (e: KeyboardEvent) => {
      const handled = hotkeys.handleKeyEvent({ key: e.key, ctrlKey: e.ctrlKey, metaKey: e.metaKey, altKey: e.altKey, shiftKey: e.shiftKey });
      if (handled) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hotkeys, clipboard]);

  const formats = clipboard.availableFormats();

  return (
    <div className="intg">
      <header className="intg-head">
        <h1>Clipboard &amp; Global Hotkeys</h1>
        <p>Multi-format clipboard and an accelerator-based hotkey registry wired to real key events.</p>
      </header>

      <div className="intg-grid">
        <section className="intg-panel">
          <h2>Clipboard</h2>
          <label className="intg-field">
            Plain text
            <input value={text} onChange={(e) => setText(e.target.value)} />
          </label>
          <label className="intg-field">
            HTML
            <input value={html} onChange={(e) => setHtml(e.target.value)} />
          </label>
          <div className="intg-actions">
            <button className="intg-btn primary" onClick={() => clipboard.writeText(text)}>
              writeText
            </button>
            <button className="intg-btn primary" onClick={() => clipboard.writeHtml(html)}>
              writeHtml
            </button>
            <button className="intg-btn ghost" onClick={() => clipboard.clear()}>
              clear
            </button>
          </div>
          <h3>Current contents</h3>
          {formats.length === 0 ? (
            <div className="intg-empty">Clipboard is empty.</div>
          ) : (
            <ul className="intg-formats">
              {formats.map((f) => (
                <li key={f}>
                  <span className="intg-format">{f}</span>
                  <span className="intg-value">{clipboard.readFormat(f)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="intg-note">
            readText(): <code>{clipboard.readText() || '—'}</code>
          </div>
        </section>

        <section className="intg-panel">
          <h2>Global Hotkeys</h2>
          <p className="intg-hint">Press these anywhere on the page:</p>
          <ul className="intg-keys">
            {hotkeys.list().map((acc) => (
              <li key={acc}>
                <kbd>{acc}</kbd>
              </li>
            ))}
          </ul>
          <h3>Fired</h3>
          <ul className="intg-log">
            {log.length === 0 ? <li className="muted">No hotkeys fired yet.</li> : log.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default IntegrationDemo;
