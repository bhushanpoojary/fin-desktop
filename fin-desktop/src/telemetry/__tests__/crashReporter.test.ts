import { describe, it, expect, vi } from 'vitest';
import { CrashReporter } from '../crashReporter';
import type { CrashUploader } from '../crashReporter';

function reporter(overrides = {}) {
  let n = 0;
  return new CrashReporter({ idFactory: () => `c${n++}`, now: () => 1000, ...overrides });
}

describe('CrashReporter', () => {
  it('captures a report with defaults and stores it locally', () => {
    const r = reporter();
    const report = r.report({ process: 'renderer', reason: 'crashed' });
    expect(report).toMatchObject({ id: 'c0', process: 'renderer', reason: 'crashed', fatal: true, timestamp: 1000 });
    expect(r.count()).toBe(1);
  });

  it('stores locally even when upload is disabled', () => {
    const uploader: CrashUploader = { upload: vi.fn() };
    const r = reporter({ uploader, enabled: false });
    r.report({ process: 'gpu', reason: 'killed' });
    expect(uploader.upload).not.toHaveBeenCalled();
    expect(r.count()).toBe(1);
  });

  it('uploads when enabled and an uploader is set', () => {
    const uploader: CrashUploader = { upload: vi.fn() };
    const r = reporter({ uploader, enabled: true });
    const report = r.report({ process: 'main', reason: 'oom' });
    expect(uploader.upload).toHaveBeenCalledWith(expect.objectContaining({ id: report.id }));
  });

  it('respects runtime opt-in toggling', () => {
    const uploader: CrashUploader = { upload: vi.fn() };
    const r = reporter({ uploader });
    r.report({ process: 'main', reason: 'a' }); // disabled by default
    r.setEnabled(true);
    r.report({ process: 'main', reason: 'b' });
    expect(uploader.upload).toHaveBeenCalledTimes(1);
  });

  it('redacts configured metadata keys', () => {
    const r = reporter({ redactKeys: ['token', 'email'] });
    const report = r.report({ process: 'renderer', reason: 'crashed', metadata: { token: 'secret', email: 'a@b.c', view: 'chart' } });
    expect(report.metadata).toEqual({ token: '[redacted]', email: '[redacted]', view: 'chart' });
  });

  it('caps stored reports', () => {
    const r = reporter({ maxStored: 2 });
    r.report({ process: 'r', reason: '1' });
    r.report({ process: 'r', reason: '2' });
    r.report({ process: 'r', reason: '3' });
    expect(r.count()).toBe(2);
    expect(r.list().map((x) => x.reason)).toEqual(['2', '3']);
  });

  it('clears stored reports', () => {
    const r = reporter();
    r.report({ process: 'r', reason: 'x' });
    r.clear();
    expect(r.count()).toBe(0);
  });
});
