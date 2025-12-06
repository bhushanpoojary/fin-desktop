/**
 * Simple Instrument Target App - FDC3 Demo
 * 
 * Receives instrument context broadcasts via FDC3 bus
 */

import React, { useState, useEffect } from "react";
import { useFdc3 } from "../core/fdc3/Fdc3ContextProvider";
import type { InstrumentContext } from "../core/fdc3/Fdc3Types";

export const SimpleInstrumentTarget: React.FC = () => {
  const fdc3Bus = useFdc3();
  const [currentContext, setCurrentContext] = useState<InstrumentContext | null>(null);

  useEffect(() => {
    console.log("[SimpleInstrumentTarget] Subscribing to FDC3 context");

    const unsubscribe = fdc3Bus.subscribeContext((ctx) => {
      console.log("[SimpleInstrumentTarget] Received context:", ctx);
      setCurrentContext(ctx);
    });

    return () => {
      console.log("[SimpleInstrumentTarget] Unsubscribing from FDC3 context");
      unsubscribe();
    };
  }, [fdc3Bus]);

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>🎯 Instrument Target</h2>
      <p style={styles.description}>
        Listening for instrument broadcasts from other apps
      </p>

      {currentContext ? (
        <div style={styles.contextCard}>
          <div style={styles.instrumentDisplay}>
            <div style={styles.label}>Selected Instrument</div>
            <div style={styles.instrumentValue}>{currentContext.instrument}</div>
          </div>

          <div style={styles.metadata}>
            <div style={styles.metadataItem}>
              <span style={styles.metadataLabel}>Source App:</span>
              <span style={styles.metadataValue}>
                {currentContext.sourceAppId || "Unknown"}
              </span>
            </div>
            <div style={styles.metadataItem}>
              <span style={styles.metadataLabel}>Received At:</span>
              <span style={styles.metadataValue}>
                {formatTimestamp(currentContext.timestamp)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <div style={styles.emptyText}>No instrument selected</div>
          <div style={styles.emptyHint}>
            Waiting for broadcast from Instrument Source app
          </div>
        </div>
      )}

      <div style={styles.statusBar}>
        <div style={styles.statusIndicator}>
          <div style={styles.statusDot}></div>
          <span style={styles.statusText}>FDC3 Connected</span>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "20px",
    fontFamily: "system-ui, -apple-system, sans-serif",
    height: "100%",
    overflow: "auto",
    backgroundColor: "#f9fafb",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    margin: "0 0 8px 0",
    fontSize: "20px",
    fontWeight: "600",
    color: "#111827",
  },
  description: {
    margin: "0 0 24px 0",
    fontSize: "14px",
    color: "#6b7280",
  },
  contextCard: {
    padding: "24px",
    backgroundColor: "#ffffff",
    border: "2px solid #3b82f6",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  instrumentDisplay: {
    marginBottom: "20px",
    textAlign: "center",
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "8px",
  },
  instrumentValue: {
    fontSize: "48px",
    fontWeight: "700",
    color: "#1f2937",
    letterSpacing: "-0.02em",
  },
  metadata: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    paddingTop: "20px",
    borderTop: "1px solid #e5e7eb",
  },
  metadataItem: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
  },
  metadataLabel: {
    color: "#6b7280",
    fontWeight: "500",
  },
  metadataValue: {
    color: "#1f2937",
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    textAlign: "center",
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
  statusBar: {
    marginTop: "auto",
    paddingTop: "16px",
    borderTop: "1px solid #e5e7eb",
  },
  statusIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#10b981",
  },
  statusText: {
    fontSize: "12px",
    color: "#6b7280",
    fontWeight: "500",
  },
};
