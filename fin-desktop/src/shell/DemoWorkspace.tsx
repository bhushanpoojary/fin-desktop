/**
 * FDC3 Demo Workspace
 * 
 * Demonstrates FDC3 Phase 1 functionality with app-to-app context communication
 * 
 * Layout:
 * - Instrument Source App (broadcasts instruments)
 * - Instrument Target App (receives instrument context)
 * - FDC3 Event Log Panel (shows all context broadcasts)
 */

import React from "react";
import { Fdc3Provider } from "../core/fdc3";
import { SimpleInstrumentSource } from "../apps/SimpleInstrumentSource";
import { SimpleInstrumentTarget } from "../apps/SimpleInstrumentTarget";
import { Fdc3EventLogPanel } from "../apps/Fdc3EventLogPanel";

/**
 * Main Demo Workspace Component
 */
export const DemoWorkspace: React.FC = () => {
  return (
    <Fdc3Provider>
      <div style={styles.workspace}>
        <div style={styles.header}>
          <h1 style={styles.title}>FDC3 Phase 1 Demo</h1>
          <p style={styles.subtitle}>
            App-to-App Context Communication with Event Logging
          </p>
        </div>

        <div style={styles.layout}>
          {/* Left Panel: Instrument Source */}
          <div style={styles.panel}>
            <SimpleInstrumentSource />
          </div>

          {/* Center Panel: Instrument Target */}
          <div style={styles.panel}>
            <SimpleInstrumentTarget />
          </div>

          {/* Right Panel: Event Log */}
          <div style={styles.panel}>
            <Fdc3EventLogPanel />
          </div>
        </div>
      </div>
    </Fdc3Provider>
  );
};

const styles: Record<string, React.CSSProperties> = {
  workspace: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    fontFamily: "system-ui, -apple-system, sans-serif",
    backgroundColor: "#e5e7eb",
  },
  header: {
    padding: "20px 24px",
    backgroundColor: "#ffffff",
    borderBottom: "2px solid #e5e7eb",
  },
  title: {
    margin: "0 0 4px 0",
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    margin: 0,
    fontSize: "14px",
    color: "#6b7280",
  },
  layout: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "16px",
    padding: "16px",
    overflow: "hidden",
  },
  panel: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
};
