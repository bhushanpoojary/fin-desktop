export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  id: string;           // unique ID, e.g. uuid or timestamp+counter
  timestamp: string;    // ISO string
  level: LogLevel;
  source: string;       // e.g. "Launcher", "Layout", "FDC3", "OrderTicketApp"
  message: string;
  details?: unknown;    // optional extra info (payload, error, etc.)
}
