import { describe, it, expect } from 'vitest';
import { AuditLog } from '../auditLog';

function log() {
  let t = 1000;
  let n = 0;
  return new AuditLog({ now: () => (t += 10), idFactory: () => `a${n++}` });
}

describe('AuditLog', () => {
  it('records entries with defaults and a hash chain', () => {
    const audit = log();
    const first = audit.record({ actor: 'alice', action: 'login' });
    const second = audit.record({ actor: 'alice', action: 'raiseIntent', target: 'ViewChart' });
    expect(first.outcome).toBe('success');
    expect(first.prevHash).toBe('00000000');
    expect(second.prevHash).toBe(first.hash);
    expect(audit.count()).toBe(2);
  });

  it('verifies an untampered chain', () => {
    const audit = log();
    audit.record({ actor: 'a', action: 'x' });
    audit.record({ actor: 'b', action: 'y', outcome: 'denied' });
    expect(audit.verify()).toBe(true);
  });

  it('detects tampering with a recorded entry', () => {
    const audit = log();
    audit.record({ actor: 'a', action: 'x' });
    audit.record({ actor: 'b', action: 'y' });
    // Mutate the internal array via a leaked reference is not possible (all() is a copy),
    // so tamper by reaching into a returned object won't affect the log. Instead, build a log
    // whose middle entry we corrupt through a custom subclass-free approach:
    const entries = (audit as unknown as { entries: Array<{ action: string }> }).entries;
    entries[0].action = 'HACKED';
    expect(audit.verify()).toBe(false);
  });

  it('queries by actor, action, outcome, and text', () => {
    const audit = log();
    audit.record({ actor: 'alice', action: 'login' });
    audit.record({ actor: 'bob', action: 'raiseIntent', target: 'ViewChart' });
    audit.record({ actor: 'alice', action: 'raiseIntent', target: 'ViewNews', outcome: 'denied' });
    expect(audit.query({ actor: 'alice' })).toHaveLength(2);
    expect(audit.query({ action: 'raiseIntent' })).toHaveLength(2);
    expect(audit.query({ outcome: 'denied' })).toHaveLength(1);
    expect(audit.query({ text: 'viewchart' })).toHaveLength(1);
  });

  it('filters by time range', () => {
    const audit = log();
    const a = audit.record({ actor: 'a', action: 'x' }); // ts 1010
    audit.record({ actor: 'b', action: 'y' }); // ts 1020
    expect(audit.query({ since: a.timestamp + 1 })).toHaveLength(1);
    expect(audit.query({ until: a.timestamp })).toHaveLength(1);
  });

  it('exports JSON and CSV', () => {
    const audit = log();
    audit.record({ actor: 'alice', action: 'login', target: 'app, with comma' });
    const json = JSON.parse(audit.toJSON());
    expect(json[0]).toMatchObject({ actor: 'alice', action: 'login' });
    const csv = audit.toCSV().split('\n');
    expect(csv[0]).toBe('id,timestamp,actor,action,target,outcome');
    expect(csv[1]).toContain('"app, with comma"'); // quoted because of the comma
  });
});
