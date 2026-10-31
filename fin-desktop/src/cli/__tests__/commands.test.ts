import { describe, it, expect } from 'vitest';
import { resolveCommand } from '../commands';

describe('resolveCommand', () => {
  it('routes a known command and parses its flags', () => {
    const r = resolveCommand(['package', '--target=win', '--verbose']);
    expect(r.command).toBe('package');
    expect(r.unknown).toBe(false);
    expect(r.args.options.target).toBe('win');
    expect(r.args.flags.verbose).toBe(true);
  });

  it('falls back to help for an unknown command', () => {
    const r = resolveCommand(['frobnicate']);
    expect(r.command).toBe('help');
    expect(r.unknown).toBe(true);
  });

  it('handles bare --version and --help', () => {
    expect(resolveCommand(['--version']).command).toBe('version');
    expect(resolveCommand(['-v']).command).toBe('version');
    expect(resolveCommand([]).command).toBe('help');
  });
});
