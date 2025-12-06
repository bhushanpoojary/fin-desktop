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
  const [activeTab, setActiveTab] = useState<"formatted" | "json">("formatted");

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
        <>
          {/* Tabs */}
          <div style={styles.tabs}>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === "formatted" ? styles.tabActive : {}),
              }}
              onClick={() => setActiveTab("formatted")}
            >
              📊 Formatted View
            </button>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === "json" ? styles.tabActive : {}),
              }}
              onClick={() => setActiveTab("json")}
            >
              📝 Raw JSON
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "formatted" ? (
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
            <div style={styles.jsonCard}>
              <div style={styles.jsonHeader}>
                <span style={styles.jsonTitle}>📦 Context Message</span>
                <button
                  style={styles.copyButton}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      JSON.stringify(currentContext, null, 2)
                    );
                  }}
                  title="Copy to clipboard"
                >
                  📋 Copy
                </button>
              </div>
              <pre style={styles.jsonPre}>
                <code style={styles.jsonCode}>
                  {JSON.stringify(currentContext, null, 2)}
                </code>
              </pre>
            </div>
          )}
        </>
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
  tabs: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
    borderBottom: "2px solid #e5e7eb",
    paddingBottom: "0",
  },
  tab: {
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#6b7280",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    cursor: "pointer",
    transition: "all 0.2s",
    marginBottom: "-2px",
  },
  tabActive: {
    color: "#3b82f6",
    borderBottomColor: "#3b82f6",
    fontWeight: "600",
  },
  jsonCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  jsonHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },
  jsonTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1f2937",
  },
  copyButton: {
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#3b82f6",
    backgroundColor: "#eff6ff",
    border: "1px solid #3b82f6",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  jsonPre: {
    margin: "0",
    padding: "20px",
    backgroundColor: "#1f2937",
    overflow: "auto",
    maxHeight: "500px",
  },
  jsonCode: {
    fontSize: "13px",
    fontFamily: "'Cascadia Code', 'Fira Code', 'Courier New', monospace",
    color: "#10b981",
    lineHeight: "1.6",
    whiteSpace: "pre",
  },
};
