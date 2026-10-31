/**
 * Inter-Application Bus (IAB) — typed publish/subscribe + point-to-point messaging between apps.
 *
 * A faithful, in-process model of OpenFin's IAB: subscribers register `(topic, from)` listeners
 * (where `from.uuid` may be `'*'` to accept any sender); `publish` broadcasts a topic to every
 * matching subscriber, and `send` delivers point-to-point to a single destination identity.
 * Pure and framework-agnostic — a real transport adapter can forward across windows/processes.
 */

export interface AppIdentity {
  uuid: string;
  name?: string;
}

export type BusHandler<T = unknown> = (message: T, sender: AppIdentity, topic: string) => void;

export interface BusSubscription {
  unsubscribe(): void;
}

export const ANY_SENDER = '*';

interface Subscription {
  owner: AppIdentity;
  sourceUuid: string;
  topic: string;
  handler: BusHandler;
}

function matchesSource(sub: Subscription, sender: AppIdentity): boolean {
  return sub.sourceUuid === ANY_SENDER || sub.sourceUuid === sender.uuid;
}

export class InterAppBus {
  private readonly subs = new Set<Subscription>();

  /**
   * Listen for `topic` messages. Pass a `source` identity to only receive from that sender,
   * or omit it (or use `{ uuid: '*' }`) to receive from any sender.
   */
  subscribe<T = unknown>(
    owner: AppIdentity,
    source: AppIdentity | { uuid: string } | undefined,
    topic: string,
    handler: BusHandler<T>,
  ): BusSubscription {
    const sub: Subscription = {
      owner,
      sourceUuid: source?.uuid ?? ANY_SENDER,
      topic,
      handler: handler as BusHandler,
    };
    this.subs.add(sub);
    return { unsubscribe: () => this.subs.delete(sub) };
  }

  /** Broadcast `message` on `topic` to every matching subscriber. Returns the delivery count. */
  publish<T = unknown>(topic: string, message: T, sender: AppIdentity): number {
    let delivered = 0;
    for (const sub of [...this.subs]) {
      if (sub.topic === topic && matchesSource(sub, sender)) {
        sub.handler(message, sender, topic);
        delivered += 1;
      }
    }
    return delivered;
  }

  /** Point-to-point: deliver `message` on `topic` only to `target`'s subscribers. */
  send<T = unknown>(target: AppIdentity, topic: string, message: T, sender: AppIdentity): number {
    let delivered = 0;
    for (const sub of [...this.subs]) {
      if (sub.owner.uuid === target.uuid && sub.topic === topic && matchesSource(sub, sender)) {
        sub.handler(message, sender, topic);
        delivered += 1;
      }
    }
    return delivered;
  }

  /** Remove every subscription owned by `owner` (e.g. when an app disconnects). */
  unsubscribeAll(owner: AppIdentity): void {
    for (const sub of [...this.subs]) {
      if (sub.owner.uuid === owner.uuid) this.subs.delete(sub);
    }
  }

  subscriptionCount(): number {
    return this.subs.size;
  }
}
