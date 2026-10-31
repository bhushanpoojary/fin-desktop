/**
 * CLI command router — maps the first positional to a known `findesktop` command and parses its
 * flags. Pure; the bin wrapper dispatches on the result. (Scaffolding actions are still TODO.)
 */

import { parseCliArgs } from './args';
import type { ParsedArgs } from './args';

export const CLI_COMMANDS = ['init', 'dev', 'package', 'diagnostics', 'help', 'version'] as const;
export type CliCommand = (typeof CLI_COMMANDS)[number];

export interface ResolvedCommand {
  command: CliCommand;
  args: ParsedArgs;
  /** True when the command token was unknown and we defaulted to `help`. */
  unknown: boolean;
}

const BOOLEAN_FLAGS = ['help', 'version', 'diagnostics', 'verbose'];
const ALIASES = { h: 'help', v: 'version' };

/** Resolve argv (without node/script) into a command + parsed args. */
export function resolveCommand(argv: string[]): ResolvedCommand {
  const first = argv[0];

  // Bare `--help` / `--version` with no command.
  if (!first || first.startsWith('-')) {
    const args = parseCliArgs(argv, { booleans: BOOLEAN_FLAGS, aliases: ALIASES });
    if (args.flags.version) return { command: 'version', args, unknown: false };
    return { command: 'help', args, unknown: false };
  }

  const known = (CLI_COMMANDS as readonly string[]).includes(first);
  const args = parseCliArgs(argv.slice(1), { booleans: BOOLEAN_FLAGS, aliases: ALIASES });
  return {
    command: known ? (first as CliCommand) : 'help',
    args,
    unknown: !known,
  };
}
