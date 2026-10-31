/**
 * Global hotkey registry — parse accelerators (e.g. `CmdOrCtrl+Shift+K`) and dispatch key events.
 *
 * Pure and framework-agnostic: an adapter feeds `handleKeyEvent` from a DOM `keydown` or Electron's
 * `globalShortcut`. Accelerators are normalized to a modifier+key signature so equivalent spellings
 * collide; `CmdOrCtrl` resolves to Meta on macOS and Control elsewhere (platform is injectable).
 */

export interface KeyEventLike {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}

export interface HotkeyOptions {
  isMac?: boolean;
}

interface Chord {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  key: string;
}

const KEY_ALIASES: Record<string, string> = {
  esc: 'escape',
  ' ': 'space',
  spacebar: 'space',
  up: 'arrowup',
  down: 'arrowdown',
  left: 'arrowleft',
  right: 'arrowright',
  return: 'enter',
  del: 'delete',
  plus: '+',
};

function normalizeKey(raw: string): string {
  const k = raw.toLowerCase();
  if (KEY_ALIASES[k]) return KEY_ALIASES[k];
  return k;
}

function signature(chord: Chord): string {
  return `${chord.ctrl ? 1 : 0}${chord.alt ? 1 : 0}${chord.shift ? 1 : 0}${chord.meta ? 1 : 0}:${chord.key}`;
}

/** Parse an accelerator string into a normalized chord. Throws if no non-modifier key is present. */
export function parseAccelerator(accelerator: string, isMac = false): Chord {
  const chord: Chord = { ctrl: false, alt: false, shift: false, meta: false, key: '' };
  const tokens = accelerator.split('+').map((t) => t.trim()).filter(Boolean);

  for (const token of tokens) {
    switch (token.toLowerCase()) {
      case 'ctrl':
      case 'control':
        chord.ctrl = true;
        break;
      case 'alt':
      case 'option':
        chord.alt = true;
        break;
      case 'shift':
        chord.shift = true;
        break;
      case 'cmd':
      case 'command':
      case 'meta':
      case 'super':
        chord.meta = true;
        break;
      case 'cmdorctrl':
      case 'commandorcontrol':
        if (isMac) chord.meta = true;
        else chord.ctrl = true;
        break;
      default:
        if (chord.key) throw new Error(`accelerator "${accelerator}" has more than one key`);
        chord.key = normalizeKey(token);
    }
  }

  if (!chord.key) throw new Error(`accelerator "${accelerator}" has no key`);
  return chord;
}

export class HotkeyRegistry {
  private readonly isMac: boolean;
  private readonly bindings = new Map<string, { accelerator: string; handler: () => void }>();

  constructor(options: HotkeyOptions = {}) {
    this.isMac = options.isMac ?? false;
  }

  /** Register `accelerator`. Returns false if an equivalent accelerator is already registered. */
  register(accelerator: string, handler: () => void): boolean {
    const sig = signature(parseAccelerator(accelerator, this.isMac));
    if (this.bindings.has(sig)) return false;
    this.bindings.set(sig, { accelerator, handler });
    return true;
  }

  unregister(accelerator: string): boolean {
    return this.bindings.delete(signature(parseAccelerator(accelerator, this.isMac)));
  }

  unregisterAll(): void {
    this.bindings.clear();
  }

  isRegistered(accelerator: string): boolean {
    return this.bindings.has(signature(parseAccelerator(accelerator, this.isMac)));
  }

  list(): string[] {
    return [...this.bindings.values()].map((b) => b.accelerator);
  }

  /** Dispatch a key event. Returns true (and fires the handler) if it matches a binding. */
  handleKeyEvent(event: KeyEventLike): boolean {
    const chord: Chord = {
      ctrl: !!event.ctrlKey,
      alt: !!event.altKey,
      shift: !!event.shiftKey,
      meta: !!event.metaKey,
      key: normalizeKey(event.key),
    };
    const binding = this.bindings.get(signature(chord));
    if (!binding) return false;
    binding.handler();
    return true;
  }
}
