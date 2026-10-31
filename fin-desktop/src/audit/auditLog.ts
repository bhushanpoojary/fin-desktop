/**
 * Audit trail — a tamper-evident compliance log ("who did what, when").
 *
 * Each entry is chained to the previous via a hash of its fields + the prior hash, so any edit to
 * history breaks `verify()`. Pure and framework-agnostic; the hash function is injectable (a FNV-1a
 * hex default for tests/demos — production should supply SHA-256). Supports filtered queries and
 * JSON/CSV export.
 */

export type AuditOutcome = 'success' | 'denied' | 'failure';

export interface AuditInput {
  actor: string;
  action: string;
  target?: string;
  outcome?: AuditOutcome;
  metadata?: Record<string, unknown>;
}

export interface AuditEntry extends AuditInput {
  id: string;
  timestamp: number;
  outcome: AuditOutcome;
  prevHash: string;
  hash: string;
}

export interface AuditQuery {
  actor?: string;
  action?: string;
  outcome?: AuditOutcome;
  since?: number;
  until?: number;
  text?: string;
}

export type HashFn = (input: string) => string;

/** FNV-1a 32-bit hex — deterministic and dependency-free (not cryptographic). */
export const fnv1aHex: HashFn = (input) => {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
};

export interface AuditLogOptions {
  now?: () => number;
  idFactory?: () => string;
  hash?: HashFn;
}

const GENESIS = '0'.repeat(8);

let counter = 0;
function defaultId(): string {
  counter += 1;
  return `audit-${counter}`;
}

export class AuditLog {
  private readonly entries: AuditEntry[] = [];
  private readonly now: () => number;
  private readonly newId: () => string;
  private readonly hash: HashFn;

  constructor(options: AuditLogOptions = {}) {
    this.now = options.now ?? Date.now;
    this.newId = options.idFactory ?? defaultId;
    this.hash = options.hash ?? fnv1aHex;
  }

  private hashEntry(entry: Omit<AuditEntry, 'hash'>): string {
    const payload = JSON.stringify({
      id: entry.id,
      timestamp: entry.timestamp,
      actor: entry.actor,
      action: entry.action,
      target: entry.target,
      outcome: entry.outcome,
      metadata: entry.metadata,
      prevHash: entry.prevHash,
    });
    return this.hash(payload);
  }

  record(input: AuditInput): AuditEntry {
    const prevHash = this.entries.length > 0 ? this.entries[this.entries.length - 1].hash : GENESIS;
    const base: Omit<AuditEntry, 'hash'> = {
      ...input,
      id: this.newId(),
      timestamp: this.now(),
      outcome: input.outcome ?? 'success',
      prevHash,
    };
    const entry: AuditEntry = { ...base, hash: this.hashEntry(base) };
    this.entries.push(entry);
    return { ...entry };
  }

  all(): AuditEntry[] {
    return this.entries.map((e) => ({ ...e }));
  }

  count(): number {
    return this.entries.length;
  }

  query(filter: AuditQuery = {}): AuditEntry[] {
    const text = filter.text?.toLowerCase();
    return this.entries
      .filter((e) => (filter.actor ? e.actor === filter.actor : true))
      .filter((e) => (filter.action ? e.action === filter.action : true))
      .filter((e) => (filter.outcome ? e.outcome === filter.outcome : true))
      .filter((e) => (filter.since !== undefined ? e.timestamp >= filter.since : true))
      .filter((e) => (filter.until !== undefined ? e.timestamp <= filter.until : true))
      .filter((e) => (text ? `${e.actor} ${e.action} ${e.target ?? ''}`.toLowerCase().includes(text) : true))
      .map((e) => ({ ...e }));
  }

  /** Recompute the hash chain; returns false if any entry was altered or reordered. */
  verify(): boolean {
    let prevHash = GENESIS;
    for (const entry of this.entries) {
      if (entry.prevHash !== prevHash) return false;
      const { hash, ...rest } = entry;
      if (this.hashEntry(rest) !== hash) return false;
      prevHash = entry.hash;
    }
    return true;
  }

  toJSON(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  toCSV(): string {
    const header = 'id,timestamp,actor,action,target,outcome';
    const rows = this.entries.map((e) =>
      [e.id, e.timestamp, e.actor, e.action, e.target ?? '', e.outcome].map(csvCell).join(','),
    );
    return [header, ...rows].join('\n');
  }
}

function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
