/**
 * CLI argument parser for runtime flags (e.g. `--diagnostics`, `--channel=beta`, `-v`).
 *
 * Pure and dependency-free. Supports `--flag`, `--key=value`, `--key value`, `--no-flag` negation,
 * short `-x` flags (and clustered `-abc`), `--` passthrough, and positional args. Known boolean
 * flags are declared so `--channel value` consumes the value but `--diagnostics value` does not.
 */

export interface CliSpec {
  /** Flags that never take a value (default when a flag is unknown and standalone). */
  booleans?: string[];
  /** Short alias -> long name, e.g. `{ v: 'version' }`. */
  aliases?: Record<string, string>;
}

export interface ParsedArgs {
  flags: Record<string, boolean>;
  options: Record<string, string>;
  positionals: string[];
  /** Everything after a bare `--`. */
  passthrough: string[];
}

export function parseCliArgs(argv: string[], spec: CliSpec = {}): ParsedArgs {
  const booleans = new Set(spec.booleans ?? []);
  const aliases = spec.aliases ?? {};
  const result: ParsedArgs = { flags: {}, options: {}, positionals: [], passthrough: [] };

  const resolve = (name: string): string => aliases[name] ?? name;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--') {
      result.passthrough = argv.slice(i + 1);
      break;
    }

    if (arg.startsWith('--')) {
      let name = arg.slice(2);
      // --no-flag negation
      if (name.startsWith('no-')) {
        result.flags[resolve(name.slice(3))] = false;
        continue;
      }
      // --key=value
      const eq = name.indexOf('=');
      if (eq >= 0) {
        result.options[resolve(name.slice(0, eq))] = name.slice(eq + 1);
        continue;
      }
      name = resolve(name);
      // --key value (only when not a declared boolean and a value follows)
      const next = argv[i + 1];
      if (!booleans.has(name) && next !== undefined && !next.startsWith('-')) {
        result.options[name] = next;
        i += 1;
      } else {
        result.flags[name] = true;
      }
      continue;
    }

    if (arg.startsWith('-') && arg.length > 1) {
      // Clustered short flags: -abc => a, b, c
      for (const ch of arg.slice(1)) {
        result.flags[resolve(ch)] = true;
      }
      continue;
    }

    result.positionals.push(arg);
  }

  return result;
}

/** Convenience: whether a boolean flag is set (explicit `--no-x` wins over default). */
export function hasFlag(parsed: ParsedArgs, name: string, fallback = false): boolean {
  return name in parsed.flags ? parsed.flags[name] : fallback;
}

/** Convenience: an option value with a fallback. */
export function getOption(parsed: ParsedArgs, name: string, fallback = ''): string {
  return parsed.options[name] ?? fallback;
}
