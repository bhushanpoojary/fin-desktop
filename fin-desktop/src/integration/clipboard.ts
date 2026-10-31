/**
 * Clipboard API — multi-format read/write with an injectable OS boundary.
 *
 * Pure and framework-agnostic: the `ClipboardBackend` seam is implemented by Electron's `clipboard`
 * (or the browser) in production and by an in-memory backend in tests. Supports multiple formats on
 * a single write (e.g. `text/plain` + `text/html`) and notifies listeners on change.
 */

export type ClipboardData = Record<string, string>;

export const ClipboardFormat = {
  Text: 'text/plain',
  Html: 'text/html',
} as const;

/** The injectable OS boundary — a real adapter wraps Electron's clipboard or the browser. */
export interface ClipboardBackend {
  write(data: ClipboardData): void;
  read(): ClipboardData;
}

export class InMemoryClipboardBackend implements ClipboardBackend {
  private data: ClipboardData = {};
  write(data: ClipboardData): void {
    this.data = { ...data };
  }
  read(): ClipboardData {
    return { ...this.data };
  }
}

export interface ClipboardOptions {
  backend?: ClipboardBackend;
  onChange?: (data: ClipboardData) => void;
}

export class Clipboard {
  private readonly backend: ClipboardBackend;
  private readonly onChange?: (data: ClipboardData) => void;

  constructor(options: ClipboardOptions = {}) {
    this.backend = options.backend ?? new InMemoryClipboardBackend();
    this.onChange = options.onChange;
  }

  /** Write one or more formats at once, replacing the clipboard contents. */
  write(data: ClipboardData): void {
    const copy = { ...data };
    this.backend.write(copy);
    this.onChange?.(copy);
  }

  writeText(text: string): void {
    this.write({ [ClipboardFormat.Text]: text });
  }

  /** Write plain text + HTML together. */
  writeHtml(html: string, text = stripHtml(html)): void {
    this.write({ [ClipboardFormat.Text]: text, [ClipboardFormat.Html]: html });
  }

  read(): ClipboardData {
    return this.backend.read();
  }

  readText(): string {
    return this.backend.read()[ClipboardFormat.Text] ?? '';
  }

  readFormat(format: string): string | undefined {
    return this.backend.read()[format];
  }

  hasFormat(format: string): boolean {
    return format in this.backend.read();
  }

  availableFormats(): string[] {
    return Object.keys(this.backend.read());
  }

  clear(): void {
    this.backend.write({});
    this.onChange?.({});
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}
