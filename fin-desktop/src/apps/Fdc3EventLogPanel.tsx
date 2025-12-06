/**
 * FDC3 Event Log Panel
 * 
 * Debugging panel that shows all FDC3 context broadcast events in real-time
 */

import React, { useState, useEffect, useRef } from "react";
import { useFdc3 } from "../core/fdc3/Fdc3ContextProvider";
import type { Fdc3Event } from "../core/fdc3/Fdc3Types";

interface EventLogEntry {
  id: string;
  event: Fdc3Event;
  receivedAt: number;
}

export function Fdc3EventLogPanel() {
  const fdc3Bus = useFdc3();
  const [events, setEvents] = useState<EventLogEntry[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    console.log("[Fdc3EventLogPanel] Subscribing to FDC3 events");

    // Subscribe to all FDC3 events
    const unsubscribe = fdc3Bus.subscribeEvents((evt) => {
      const logEntry: EventLogEntry = {
        id: `${Date.now()}-${Math.random()}`,
        event: evt,
        receivedAt: Date.now(),
      };

      // Add new event to the top of the list
      setEvents((prev) => [logEntry, ...prev]);
    });

    return () => {
      console.log("[Fdc3EventLogPanel] Unsubscribing from FDC3 events");
      unsubscribe();
    };
  }, [fdc3Bus]);

  // Auto-scroll to top when new events arrive (if enabled)
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [events, autoScroll]);

  const handleClearLog = () => {
    setEvents([]);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  };

  const formatEventContext = (context: Fdc3Event["context"]) => {
    return JSON.stringify(context, null, 2);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📊 FDC3 Event Log</h2>
          <p style={styles.subtitle}>
            Real-time monitoring of FDC3 context broadcasts
          </p>
        </div>
        <div style={styles.controls}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              style={styles.checkbox}
            />
            Auto-scroll
          </label>
          <button onClick={handleClearLog} style={styles.clearButton}>
            Clear Log
          </button>
        </div>
      </div>

      <div style={styles.statsBar}>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Total Events:</span>
          <span style={styles.statValue}>{events.length}</span>
        </div>
        {events.length > 0 && (
          <div style={styles.stat}>
            <span style={styles.statLabel}>Last Event:</span>
            <span style={styles.statValue}>{formatTime(events[0].receivedAt)}</span>
          </div>
        )}
      </div>

      <div ref={logContainerRef} style={styles.logContainer}>
        {events.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <div style={styles.emptyText}>No events logged yet</div>
            <div style={styles.emptyHint}>
              Events will appear here when instruments are broadcast
            </div>
          </div>
        ) : (
          events.map((entry) => (
            <div key={entry.id} style={styles.eventCard}>
              <div style={styles.eventHeader}>
                <div style={styles.eventType}>
                  <span style={styles.eventTypeBadge}>{entry.event.type}</span>
                </div>
                <div style={styles.eventTime}>{formatTime(entry.receivedAt)}</div>
              </div>

              <div style={styles.eventBody}>
                <div style={styles.eventField}>
                  <span style={styles.eventFieldLabel}>Instrument:</span>
                  <span style={styles.eventFieldValue}>
                    {entry.event.context.instrument}
                  </span>
                </div>

                {entry.event.context.sourceAppId && (
                  <div style={styles.eventField}>
                    <span style={styles.eventFieldLabel}>Source App:</span>
                    <span style={styles.eventFieldValue}>
                      {entry.event.context.sourceAppId}
                    </span>
                  </div>
                )}

                {entry.event.context.timestamp && (
                  <div style={styles.eventField}>
                    <span style={styles.eventFieldLabel}>Broadcast Time:</span>
                    <span style={styles.eventFieldValue}>
                      {formatTime(entry.event.context.timestamp)}
                    </span>
                  </div>
                )}

                <details style={styles.details}>
                  <summary style={styles.detailsSummary}>
                    Show full context
                  </summary>
                  <pre style={styles.detailsContent}>
                    {formatEventContext(entry.event.context)}
                  </pre>
                </details>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    fontFamily: "system-ui, -apple-system, sans-serif",
    backgroundColor: "#f9fafb",
  },
  header: {
    padding: "20px",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    margin: "0 0 4px 0",
    fontSize: "20px",
    fontWeight: "600",
    color: "#111827",
  },
  subtitle: {
    margin: 0,
    fontSize: "14px",
    color: "#6b7280",
  },
  controls: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "14px",
    color: "#374151",
    cursor: "pointer",
  },
  checkbox: {
    cursor: "pointer",
  },
  clearButton: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#dc2626",
    backgroundColor: "#ffffff",
    border: "1px solid #dc2626",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  statsBar: {
    padding: "12px 20px",
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    gap: "24px",
  },
  stat: {
    display: "flex",
    gap: "8px",
    fontSize: "14px",
  },
  statLabel: {
    color: "#6b7280",
    fontWeight: "500",
  },
  statValue: {
    color: "#1f2937",
    fontWeight: "600",
  },
  logContainer: {
    flex: 1,
    overflow: "auto",
    padding: "16px",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    textAlign: "center",
    padding: "40px",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "16px",
    opacity: 0.5,
  },
  emptyText: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: "8px",
  },
  emptyHint: {
    fontSize: "14px",
    color: "#9ca3af",
  },
  eventCard: {
    marginBottom: "12px",
    padding: "16px",
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  eventHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  eventType: {
    display: "flex",
    alignItems: "center",
  },
  eventTypeBadge: {
    padding: "4px 10px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#1e40af",
    backgroundColor: "#dbeafe",
    borderRadius: "4px",
  },
  eventTime: {
    fontSize: "12px",
    color: "#6b7280",
    fontFamily: "monospace",
  },
  eventBody: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  eventField: {
    display: "flex",
    gap: "8px",
    fontSize: "14px",
  },
  eventFieldLabel: {
    color: "#6b7280",
    fontWeight: "500",
    minWidth: "120px",
  },
  eventFieldValue: {
    color: "#1f2937",
    fontWeight: "600",
  },
  details: {
    marginTop: "8px",
    fontSize: "13px",
  },
  detailsSummary: {
    cursor: "pointer",
    color: "#3b82f6",
    fontWeight: "500",
    padding: "4px 0",
  },
  detailsContent: {
    marginTop: "8px",
    padding: "12px",
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "4px",
    fontSize: "12px",
    fontFamily: "monospace",
    overflow: "auto",
    maxHeight: "200px",
  },
};
