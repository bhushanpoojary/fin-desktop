import { useCallback } from "react";
import { useLogStore } from "./LogStoreContext";
import type { LogLevel } from "./types";

export interface Logger {
  debug: (message: string, details?: unknown) => void;
  info: (message: string, details?: unknown) => void;
  warn: (message: string, details?: unknown) => void;
  error: (message: string, details?: unknown) => void;
  log: (level: LogLevel, message: string, details?: unknown) => void;
}

export function useLogger(source: string): Logger {
  const { addLog } = useLogStore();

  const log = useCallback(
    (level: LogLevel, message: string, details?: unknown) => {
      addLog({ level, source, message, details });
    },
    [addLog, source]
  );

  const debug = useCallback(
    (message: string, details?: unknown) => {
      log("debug", message, details);
    },
    [log]
  );

  const info = useCallback(
    (message: string, details?: unknown) => {
      log("info", message, details);
    },
    [log]
  );

  const warn = useCallback(
    (message: string, details?: unknown) => {
      log("warn", message, details);
    },
    [log]
  );

  const error = useCallback(
    (message: string, details?: unknown) => {
      log("error", message, details);
    },
    [log]
  );

  return {
    debug,
    info,
    warn,
    error,
    log,
  };
}
