import React, { createContext, useContext, useState, useCallback } from "react";
import type { LogEntry, LogLevel } from "./types";

const MAX_LOGS = 1000;

export interface LogStoreContextValue {
  logs: LogEntry[];
  addLog: (entry: {
    level: LogLevel;
    source: string;
    message: string;
    details?: unknown;
  }) => void;
  clear: () => void;
}

const LogStoreContext = createContext<LogStoreContextValue | undefined>(undefined);

let logCounter = 0;

export const LogStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback(
    (entry: {
      level: LogLevel;
      source: string;
      message: string;
      details?: unknown;
    }) => {
      const newLog: LogEntry = {
        id: `log-${Date.now()}-${logCounter++}`,
        timestamp: new Date().toISOString(),
        level: entry.level,
        source: entry.source,
        message: entry.message,
        details: entry.details,
      };

      setLogs((prev) => {
        const updated = [...prev, newLog];
        // Keep only the last MAX_LOGS entries
        if (updated.length > MAX_LOGS) {
          return updated.slice(updated.length - MAX_LOGS);
        }
        return updated;
      });
    },
    []
  );

  const clear = useCallback(() => {
    setLogs([]);
  }, []);

  const value: LogStoreContextValue = {
    logs,
    addLog,
    clear,
  };

  return <LogStoreContext.Provider value={value}>{children}</LogStoreContext.Provider>;
};

export function useLogStore(): LogStoreContextValue {
  const context = useContext(LogStoreContext);
  if (!context) {
    throw new Error("useLogStore must be used within a LogStoreProvider");
  }
  return context;
}
