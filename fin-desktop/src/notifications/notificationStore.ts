/**
 * Notification Center model — a dedicated, filterable notification store with history, priority
 * levels, Do-Not-Disturb, rich content (buttons, inputs, images, progress), FDC3 intent routing,
 * badge counts, and an injectable OS-native fallback.
 *
 * Pure and framework-agnostic: a React panel renders `list()`/`grouped()`; `onToast` surfaces
 * transient banners; an injectable `OsNotificationSink` provides the OS-native fallback when no
 * in-app renderer is attached. `serialize()`/`deserialize()` persist history + settings.
 */

export const NotificationPriority = {
  Low: 'low',
  Normal: 'normal',
  High: 'high',
  Critical: 'critical',
} as const;

export type NotificationPriority = (typeof NotificationPriority)[keyof typeof NotificationPriority];

const PRIORITY_RANK: Record<NotificationPriority, number> = { low: 0, normal: 1, high: 2, critical: 3 };

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/** An action button. May carry an FDC3 intent to raise when clicked. */
export interface NotificationButton {
  id: string;
  label: string;
  intent?: { name: string; context?: unknown };
}

export interface NotificationInput {
  id: string;
  label?: string;
  placeholder?: string;
}

export interface RichNotification {
  id: string;
  title: string;
  body?: string;
  type: NotificationType;
  priority: NotificationPriority;
  group?: string;
  timestamp: number;
  read: boolean;
  dismissed: boolean;
  image?: string;
  /** 0–100 for progress notifications; omitted otherwise. */
  progress?: number;
  buttons?: NotificationButton[];
  inputs?: NotificationInput[];
  /** FDC3 intent to raise when the notification itself is actioned. */
  route?: { intent: string; context?: unknown };
}

export type NotificationInput_ = Omit<RichNotification, 'id' | 'timestamp' | 'read' | 'dismissed' | 'type' | 'priority'> & {
  id?: string;
  type?: NotificationType;
  priority?: NotificationPriority;
};

export interface NotificationFilter {
  group?: string;
  minPriority?: NotificationPriority;
  unreadOnly?: boolean;
  query?: string;
}

/** Routing descriptor emitted when a notification/button is actioned — the app raises it via FDC3. */
export interface NotificationRoute {
  intent: string;
  context?: unknown;
}

export interface OsNotificationSink {
  notify(notification: RichNotification): void;
}

export interface NotificationStoreOptions {
  now?: () => number;
  idFactory?: () => string;
  onChange?: () => void;
  /** Transient in-app banner callback. When absent, delivery falls back to `osSink`. */
  onToast?: (notification: RichNotification) => void;
  osSink?: OsNotificationSink;
  dnd?: boolean;
  /** Cap on retained history (oldest dropped first). */
  maxHistory?: number;
}

let counter = 0;
function defaultId(): string {
  counter += 1;
  return `n${counter}`;
}

export class NotificationStore {
  private items: RichNotification[] = [];
  private dnd: boolean;
  private readonly now: () => number;
  private readonly newId: () => string;
  private readonly onChange?: () => void;
  private readonly onToast?: (n: RichNotification) => void;
  private readonly osSink?: OsNotificationSink;
  private readonly maxHistory: number;

  constructor(options: NotificationStoreOptions = {}) {
    this.now = options.now ?? Date.now;
    this.newId = options.idFactory ?? defaultId;
    this.onChange = options.onChange;
    this.onToast = options.onToast;
    this.osSink = options.osSink;
    this.dnd = options.dnd ?? false;
    this.maxHistory = options.maxHistory ?? 200;
  }

  private emit(): void {
    this.onChange?.();
  }

  isDnd(): boolean {
    return this.dnd;
  }

  setDnd(value: boolean): void {
    if (this.dnd === value) return;
    this.dnd = value;
    this.emit();
  }

  toggleDnd(): boolean {
    this.setDnd(!this.dnd);
    return this.dnd;
  }

  /** Post a notification: always stored in history; delivered unless suppressed by DND. */
  post(input: NotificationInput_): RichNotification {
    const notification: RichNotification = {
      ...input,
      id: input.id ?? this.newId(),
      type: input.type ?? 'info',
      priority: input.priority ?? NotificationPriority.Normal,
      timestamp: this.now(),
      read: false,
      dismissed: false,
    };
    this.items.push(notification);
    if (this.items.length > this.maxHistory) {
      this.items = this.items.slice(this.items.length - this.maxHistory);
    }
    this.deliver(notification);
    this.emit();
    return { ...notification };
  }

  /** Critical notifications bypass Do-Not-Disturb; everything else is held silently in history. */
  private deliver(notification: RichNotification): void {
    const suppressed = this.dnd && notification.priority !== NotificationPriority.Critical;
    if (suppressed) return;
    if (this.onToast) this.onToast(notification);
    else this.osSink?.notify(notification);
  }

  get(id: string): RichNotification | undefined {
    const item = this.items.find((n) => n.id === id);
    return item ? { ...item } : undefined;
  }

  all(): RichNotification[] {
    return this.items.map((n) => ({ ...n }));
  }

  /** Active (non-dismissed) notifications, newest first, matching an optional filter. */
  list(filter: NotificationFilter = {}): RichNotification[] {
    const min = filter.minPriority ? PRIORITY_RANK[filter.minPriority] : 0;
    const q = filter.query?.trim().toLowerCase();
    return this.items
      .filter((n) => !n.dismissed)
      .filter((n) => (filter.group ? n.group === filter.group : true))
      .filter((n) => PRIORITY_RANK[n.priority] >= min)
      .filter((n) => (filter.unreadOnly ? !n.read : true))
      .filter((n) => (q ? `${n.title} ${n.body ?? ''}`.toLowerCase().includes(q) : true))
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((n) => ({ ...n }));
  }

  /** Active notifications grouped by their `group` key (ungrouped under 'General'). */
  grouped(filter: NotificationFilter = {}): Map<string, RichNotification[]> {
    const groups = new Map<string, RichNotification[]>();
    for (const n of this.list(filter)) {
      const key = n.group ?? 'General';
      const bucket = groups.get(key) ?? [];
      bucket.push(n);
      groups.set(key, bucket);
    }
    return groups;
  }

  groups(): string[] {
    return [...new Set(this.items.filter((n) => !n.dismissed).map((n) => n.group ?? 'General'))];
  }

  /** Unread, non-dismissed count — drives tray/dock badge. */
  badgeCount(): number {
    return this.items.filter((n) => !n.read && !n.dismissed).length;
  }

  isRead(id: string): boolean {
    return this.items.find((n) => n.id === id)?.read ?? false;
  }

  markRead(id: string): void {
    const n = this.items.find((i) => i.id === id);
    if (n && !n.read) {
      n.read = true;
      this.emit();
    }
  }

  markAllRead(): void {
    let changed = false;
    for (const n of this.items) {
      if (!n.read) {
        n.read = true;
        changed = true;
      }
    }
    if (changed) this.emit();
  }

  dismiss(id: string): void {
    const n = this.items.find((i) => i.id === id);
    if (n && !n.dismissed) {
      n.dismissed = true;
      this.emit();
    }
  }

  clear(): void {
    if (this.items.length === 0) return;
    this.items = [];
    this.emit();
  }

  updateProgress(id: string, progress: number): void {
    const n = this.items.find((i) => i.id === id);
    if (!n) return;
    n.progress = Math.max(0, Math.min(100, progress));
    this.emit();
  }

  /** Act on the notification (or a specific button) — marks read and returns an FDC3 route to raise. */
  act(id: string, buttonId?: string): NotificationRoute | undefined {
    const n = this.items.find((i) => i.id === id);
    if (!n) return undefined;
    this.markRead(id);
    if (buttonId) {
      const button = n.buttons?.find((b) => b.id === buttonId);
      if (button?.intent) return { intent: button.intent.name, context: button.intent.context };
      return undefined;
    }
    return n.route ? { intent: n.route.intent, context: n.route.context } : undefined;
  }

  serialize(): { items: RichNotification[]; dnd: boolean } {
    return { items: this.all(), dnd: this.dnd };
  }

  static deserialize(state: { items: RichNotification[]; dnd?: boolean }, options: NotificationStoreOptions = {}): NotificationStore {
    const store = new NotificationStore({ ...options, dnd: state.dnd ?? options.dnd });
    store.items = state.items.map((n) => ({ ...n }));
    return store;
  }
}
