import { describe, it, expect } from 'vitest';
import { parseCliArgs, hasFlag, getOption } from '../args';

describe('parseCliArgs', () => {
  it('parses standalone boolean flags', () => {
    const p = parseCliArgs(['--diagnostics', '--verbose'], { booleans: ['diagnostics', 'verbose'] });
    expect(p.flags).toEqual({ diagnostics: true, verbose: true });
  });

  it('parses --key=value and --key value', () => {
    const p = parseCliArgs(['--channel=beta', '--profile', 'work']);
    expect(p.options).toEqual({ channel: 'beta', profile: 'work' });
  });

  it('does not consume a value for declared boolean flags', () => {
    const p = parseCliArgs(['--diagnostics', 'report.txt'], { booleans: ['diagnostics'] });
    expect(p.flags.diagnostics).toBe(true);
    expect(p.positionals).toEqual(['report.txt']);
  });

  it('handles --no-flag negation', () => {
    const p = parseCliArgs(['--no-telemetry']);
    expect(p.flags.telemetry).toBe(false);
  });

  it('resolves short aliases and clusters', () => {
    const p = parseCliArgs(['-v', '-abc'], { aliases: { v: 'version', a: 'all' } });
    expect(p.flags.version).toBe(true);
    expect(p.flags.all).toBe(true);
    expect(p.flags.b).toBe(true);
    expect(p.flags.c).toBe(true);
  });

  it('collects positionals and passthrough after --', () => {
    const p = parseCliArgs(['open', 'app.json', '--', '--inspect', '9229']);
    expect(p.positionals).toEqual(['open', 'app.json']);
    expect(p.passthrough).toEqual(['--inspect', '9229']);
  });

  it('treats a value starting with - as the next flag, not a value', () => {
    const p = parseCliArgs(['--channel', '--verbose'], { booleans: ['verbose'] });
    expect(p.flags.channel).toBe(true);
    expect(p.flags.verbose).toBe(true);
  });

  it('provides hasFlag / getOption helpers', () => {
    const p = parseCliArgs(['--channel=beta', '--no-telemetry']);
    expect(getOption(p, 'channel')).toBe('beta');
    expect(getOption(p, 'missing', 'stable')).toBe('stable');
    expect(hasFlag(p, 'telemetry')).toBe(false);
    expect(hasFlag(p, 'diagnostics', true)).toBe(true);
  });
});
