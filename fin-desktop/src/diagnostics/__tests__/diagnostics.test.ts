import { describe, it, expect } from 'vitest';
import {
  DiagnosticsRunner,
  runtimeVersionCheck,
  permissionCheck,
  connectivityCheck,
  formatReport,
} from '../diagnostics';

describe('DiagnosticsRunner', () => {
  it('aggregates results with the worst overall status', async () => {
    const report = await new DiagnosticsRunner({ now: () => 0 })
      .register(runtimeVersionCheck('2.0.0', '1.0.0'))
      .register(permissionCheck('notifications', false))
      .run();
    expect(report.status).toBe('warn');
    expect(report.summary).toEqual({ ok: 1, warn: 1, fail: 0 });
    expect(report.results.map((r) => r.id)).toEqual(['runtime-version', 'permission-notifications']);
  });

  it('fails overall when any check fails', async () => {
    const report = await new DiagnosticsRunner()
      .register(runtimeVersionCheck('0.9.0', '1.0.0'))
      .register(permissionCheck('clipboard', true))
      .run();
    expect(report.status).toBe('fail');
    expect(report.summary.fail).toBe(1);
  });

  it('turns a thrown check into a fail', async () => {
    const report = await new DiagnosticsRunner()
      .register({ id: 'boom', label: 'Boom', run: () => { throw new Error('kaboom'); } })
      .run();
    expect(report.status).toBe('fail');
    expect(report.results[0]).toMatchObject({ status: 'fail', message: 'kaboom' });
  });

  it('awaits async connectivity probes', async () => {
    const report = await new DiagnosticsRunner()
      .register(connectivityCheck('directory', async () => true))
      .register(connectivityCheck('updates', async () => false))
      .run();
    expect(report.results[0]).toMatchObject({ status: 'ok' });
    expect(report.results[1]).toMatchObject({ status: 'fail', message: 'updates unreachable' });
  });

  it('is all-ok when every check passes', async () => {
    const report = await new DiagnosticsRunner()
      .register(runtimeVersionCheck('1.0.0', '1.0.0'))
      .register(permissionCheck('clipboard', true))
      .run();
    expect(report.status).toBe('ok');
  });
});

describe('formatReport', () => {
  it('renders a text summary with status icons', async () => {
    const report = await new DiagnosticsRunner({ now: () => 0 })
      .register(runtimeVersionCheck('2.0.0', '1.0.0'))
      .register(permissionCheck('notifications', false))
      .run();
    const text = formatReport(report);
    expect(text).toContain('Diagnostics: WARN');
    expect(text).toContain('✓ Runtime version');
    expect(text).toContain('! Permission: notifications');
  });
});
