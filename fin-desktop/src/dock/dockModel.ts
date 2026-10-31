/**
 * Dock / App Bar model — a configurable, persistable launcher bar.
 *
 * Pure and framework-agnostic: holds pinned buttons, dropdown groups, and separators; tracks
 * which apps are currently running (ephemeral, not serialized); and supports position + auto-hide.
 * A thin React component renders `getState()`; `serialize()`/`deserialize()` handle persistence.
 */

export type DockPosition = 'top' | 'bottom' | 'left' | 'right';
export type DockOrientation = 'horizontal' | 'vertical';

export type DockAction =
  | { type: 'launchApp'; appId: string }
  | { type: 'raiseIntent'; intent: string; context?: unknown }
  | { type: 'openWorkspace'; workspaceId: string }
  | { type: 'runFunction'; functionId: string; args?: unknown }
  | { type: 'openUrl'; url: string };

export interface DockButton {
  id: string;
  kind: 'button';
  label: string;
  icon?: string;
  action: DockAction;
}

export interface DockGroup {
  id: string;
  kind: 'group';
  label: string;
  icon?: string;
  items: DockButton[];
}

export interface DockSeparator {
  id: string;
  kind: 'separator';
}

export type DockItem = DockButton | DockGroup | DockSeparator;

export interface DockState {
  position: DockPosition;
  autoHide: boolean;
  items: DockItem[];
}

export interface DockModelOptions {
  initial?: Partial<DockState>;
  onChange?: (state: DockState) => void;
}

const DEFAULT_STATE: DockState = { position: 'bottom', autoHide: false, items: [] };

function clamp(index: number, length: number): number {
  if (index < 0) return 0;
  if (index > length) return length;
  return index;
}

export class DockModel {
  private position: DockPosition;
  private autoHide: boolean;
  private items: DockItem[];
  private readonly running = new Set<string>();
  private readonly onChange?: (state: DockState) => void;

  constructor(options: DockModelOptions = {}) {
    this.position = options.initial?.position ?? DEFAULT_STATE.position;
    this.autoHide = options.initial?.autoHide ?? DEFAULT_STATE.autoHide;
    this.items = options.initial?.items ? options.initial.items.map(cloneItem) : [];
    this.onChange = options.onChange;
  }

  private emit(): void {
    this.onChange?.(this.serialize());
  }

  getState(): DockState {
    return this.serialize();
  }

  getItems(): DockItem[] {
    return this.items.map(cloneItem);
  }

  orientation(): DockOrientation {
    return this.position === 'left' || this.position === 'right' ? 'vertical' : 'horizontal';
  }

  getPosition(): DockPosition {
    return this.position;
  }

  setPosition(position: DockPosition): void {
    if (this.position === position) return;
    this.position = position;
    this.emit();
  }

  isAutoHide(): boolean {
    return this.autoHide;
  }

  setAutoHide(value: boolean): void {
    if (this.autoHide === value) return;
    this.autoHide = value;
    this.emit();
  }

  toggleAutoHide(): boolean {
    this.setAutoHide(!this.autoHide);
    return this.autoHide;
  }

  hasItem(id: string): boolean {
    return this.items.some((i) => i.id === id);
  }

  /** Add (pin) an item. Idempotent by id; optional insert index. */
  addItem(item: DockItem, index?: number): void {
    if (this.hasItem(item.id)) return;
    const at = index === undefined ? this.items.length : clamp(index, this.items.length);
    this.items.splice(at, 0, cloneItem(item));
    this.emit();
  }

  removeItem(id: string): boolean {
    const next = this.items.filter((i) => i.id !== id);
    if (next.length === this.items.length) return false;
    this.items = next;
    this.emit();
    return true;
  }

  /** Reorder an existing top-level item to a new index. */
  moveItem(id: string, toIndex: number): boolean {
    const from = this.items.findIndex((i) => i.id === id);
    if (from === -1) return false;
    const [moved] = this.items.splice(from, 1);
    this.items.splice(clamp(toIndex, this.items.length), 0, moved);
    this.emit();
    return true;
  }

  addToGroup(groupId: string, button: DockButton): boolean {
    const group = this.items.find((i): i is DockGroup => i.kind === 'group' && i.id === groupId);
    if (!group || group.items.some((b) => b.id === button.id)) return false;
    group.items.push(cloneButton(button));
    this.emit();
    return true;
  }

  removeFromGroup(groupId: string, buttonId: string): boolean {
    const group = this.items.find((i): i is DockGroup => i.kind === 'group' && i.id === groupId);
    if (!group) return false;
    const next = group.items.filter((b) => b.id !== buttonId);
    if (next.length === group.items.length) return false;
    group.items = next;
    this.emit();
    return true;
  }

  /** Mark an app as running (or not) — drives the dock's active-dot indicator. */
  setRunning(appId: string, running: boolean): void {
    const changed = running ? !this.running.has(appId) : this.running.has(appId);
    if (!changed) return;
    if (running) this.running.add(appId);
    else this.running.delete(appId);
    this.emit();
  }

  isRunning(appId: string): boolean {
    return this.running.has(appId);
  }

  runningApps(): string[] {
    return [...this.running];
  }

  serialize(): DockState {
    return {
      position: this.position,
      autoHide: this.autoHide,
      items: this.items.map(cloneItem),
    };
  }

  static deserialize(state: Partial<DockState>): DockModel {
    return new DockModel({ initial: state });
  }
}

function cloneButton(button: DockButton): DockButton {
  return { ...button, action: { ...button.action } };
}

function cloneItem(item: DockItem): DockItem {
  if (item.kind === 'group') {
    return { ...item, items: item.items.map(cloneButton) };
  }
  if (item.kind === 'button') {
    return cloneButton(item);
  }
  return { ...item };
}
