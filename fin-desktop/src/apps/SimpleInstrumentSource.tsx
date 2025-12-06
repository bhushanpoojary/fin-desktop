/**
 * Simple Instrument Source App - FDC3 Demo
 * 
 * Broadcasts instrument selections using FDC3 context bus
 */

import React, { useState } from "react";
import { useFdc3 } from "../core/fdc3/Fdc3ContextProvider";

const POPULAR_INSTRUMENTS = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "JPM"
];

export const SimpleInstrumentSource: React.FC = () => {
  const fdc3Bus = useFdc3();
  const [customSymbol, setCustomSymbol] = useState("");
  const [lastBroadcast, setLastBroadcast] = useState<string | null>(null);

  const handleBroadcast = (instrument: string) => {
    if (!instrument.trim()) return;

    fdc3Bus.broadcastInstrument({
      instrument: instrument.trim().toUpperCase(),
      sourceAppId: "SimpleInstrumentSource",
      timestamp: Date.now(),
    });

    setLastBroadcast(instrument.trim().toUpperCase());
    setCustomSymbol("");
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleBroadcast(customSymbol);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>📡 Instrument Source</h2>
      <p style={styles.description}>
        Select an instrument to broadcast to all listening apps
      </p>

      <div style={styles.section}>
        <h3 style={styles.subheader}>Popular Instruments</h3>
        <div style={styles.buttonGrid}>
          {POPULAR_INSTRUMENTS.map((symbol) => (
            <button
              key={symbol}
              onClick={() => handleBroadcast(symbol)}
              style={styles.symbolButton}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.subheader}>Custom Symbol</h3>
        <form onSubmit={handleCustomSubmit} style={styles.form}>
          <input
            type="text"
            value={customSymbol}
            onChange={(e) => setCustomSymbol(e.target.value)}
            placeholder="Enter symbol (e.g., IBM)"
            style={styles.input}
          />
          <button type="submit" style={styles.submitButton}>
            Broadcast
          </button>
        </form>
      </div>

      {lastBroadcast && (
        <div style={styles.status}>
          ✓ Last broadcast: <strong>{lastBroadcast}</strong>
        </div>
      )}
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
  section: {
    marginBottom: "24px",
  },
  subheader: {
    margin: "0 0 12px 0",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  buttonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
    gap: "8px",
  },
  symbolButton: {
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#1f2937",
    backgroundColor: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  form: {
    display: "flex",
    gap: "8px",
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    outline: "none",
  },
  submitButton: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#3b82f6",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  status: {
    padding: "12px",
    fontSize: "14px",
    color: "#065f46",
    backgroundColor: "#d1fae5",
    border: "1px solid #6ee7b7",
    borderRadius: "6px",
  },
};
