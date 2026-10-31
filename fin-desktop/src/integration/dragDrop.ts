/**
 * Inter-app file / data drag-and-drop — a pure drag-session model.
 *
 * Framework-agnostic: a drag carries typed items (MIME-like formats) and/or files from a source app;
 * drop targets declare which formats they accept. A real adapter bridges the browser's native drag
 * events (or Electron file drops) into `startDrag` / `dragOver` / `drop`. One session is active at a
 * time; `onChange` lets a UI render the in-flight state.
 */

export interface DragItem {
  format: string;
  data: unknown;
}

export interface DragFile {
  name: string;
  size?: number;
  type?: string;
  path?: string;
}

export interface DragPayload {
  items: DragItem[];
  files?: DragFile[];
  source?: { appId?: string };
}

export interface DropTarget {
  id: string;
  /** Accepted formats; `'*'` matches anything and `'files'` matches a payload with files. */
  accepts: string[];
  onDrop: (payload: DragPayload, target: DropTarget) => void;
}

export const FILES_FORMAT = 'files';

/** The formats a payload offers (item formats plus the `files` pseudo-format when files present). */
export function payloadFormats(payload: DragPayload): string[] {
  const formats = payload.items.map((i) => i.format);
  if (payload.files && payload.files.length > 0) formats.push(FILES_FORMAT);
  return [...new Set(formats)];
}

export function accepts(target: DropTarget, payload: DragPayload): boolean {
  if (target.accepts.includes('*')) return true;
  return payloadFormats(payload).some((f) => target.accepts.includes(f));
}

export interface DragManagerOptions {
  onChange?: () => void;
}

export class DragManager {
  private readonly targets = new Map<string, DropTarget>();
  private active: DragPayload | null = null;
  private overId: string | null = null;
  private readonly onChange?: () => void;

  constructor(options: DragManagerOptions = {}) {
    this.onChange = options.onChange;
  }

  private emit(): void {
    this.onChange?.();
  }

  registerTarget(target: DropTarget): () => void {
    this.targets.set(target.id, target);
    return () => {
      this.targets.delete(target.id);
      if (this.overId === target.id) this.overId = null;
    };
  }

  getTarget(id: string): DropTarget | undefined {
    return this.targets.get(id);
  }

  isDragging(): boolean {
    return this.active !== null;
  }

  getActive(): DragPayload | null {
    return this.active;
  }

  getOverId(): string | null {
    return this.overId;
  }

  /** Begin a drag. Returns false if a session is already active or the payload is empty. */
  startDrag(payload: DragPayload): boolean {
    if (this.active) return false;
    if (payload.items.length === 0 && !(payload.files && payload.files.length > 0)) return false;
    this.active = payload;
    this.overId = null;
    this.emit();
    return true;
  }

  /** Whether `targetId` would accept the in-flight payload. */
  canDrop(targetId: string): boolean {
    const target = this.targets.get(targetId);
    return !!(this.active && target && accepts(target, this.active));
  }

  /** Mark a target as hovered. Returns whether it can accept the drop. */
  dragOver(targetId: string | null): boolean {
    this.overId = targetId;
    this.emit();
    return targetId ? this.canDrop(targetId) : false;
  }

  /** Attempt a drop. Delivers to the target when accepted; always ends the session. */
  drop(targetId: string): boolean {
    const payload = this.active;
    const target = this.targets.get(targetId);
    const ok = !!(payload && target && accepts(target, payload));
    if (ok) target!.onDrop(payload!, target!);
    this.end();
    return ok;
  }

  /** Cancel the active drag without delivering. */
  cancel(): void {
    this.end();
  }

  private end(): void {
    if (!this.active && this.overId === null) return;
    this.active = null;
    this.overId = null;
    this.emit();
  }
}
