import React, { useState } from "react";
import { useFdc3Bus } from "../fdc3/Fdc3Context";
import type { SelectedInstrumentContext } from "../fdc3/types";
import { useLogger } from "../logging/useLogger";
import { notificationCenter } from "../core/notifications/NotificationCenter";

const INSTRUMENTS = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corp.", sector: "Technology" },
  { symbol: "GOOG", name: "Alphabet Inc.", sector: "Technology" },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Automotive" },
  { symbol: "JPM", name: "JPMorgan Chase", sector: "Financials" },
  { symbol: "BAC", name: "Bank of America", sector: "Financials" },
];

export const InstrumentSourceApp: React.FC = () => {
  const bus = useFdc3Bus();
  const logger = useLogger("InstrumentSourceApp");
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  const handleSelect = (instrument: string) => {
    const ctx: SelectedInstrumentContext = {
      instrument,
      sourceAppId: "instrument-source"
    };
    bus.publishSelectedInstrument(ctx);
    logger.info("Published selected instrument", ctx);
    setSelectedSymbol(instrument);
  };

  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: "var(--theme-bg-primary)",
      color: "var(--theme-text-primary)",
      fontFamily: "var(--theme-font-family)"
    }}>
      <div style={{ padding: "16px" }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: "var(--theme-font-size-xl)", 
          fontWeight: "var(--theme-font-weight-bold)",
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          color: "var(--theme-primary)"
        }}>
          Instrument Publisher
        </h1>
        <p style={{ 
          margin: "4px 0 0", 
          color: "var(--theme-text-secondary)",
          fontSize: "var(--theme-font-size-sm)"
        }}>
          Select an instrument to broadcast via FDC3
        </p>
        
        {/* Notification Test Button */}
        <button
          onClick={() => {
            notificationCenter.show({
              id: crypto.randomUUID(),
              type: "success",
              title: "Test Notification",
              message: "This is a test notification from Instrument Publisher",
              actions: [
                { label: "View Details", actionId: "VIEW_DETAILS" },
                { label: "Dismiss", actionId: "DISMISS" },
              ],
            });
          }}
          style={{
            marginTop: "12px",
            padding: "8px 16px",
            backgroundColor: "#673ab7",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "500",
          }}
        >
          🔔 Test Notification
        </button>
      </div>
      
      <div style={{
        flex: 1,
        background: "var(--theme-bg-primary)",
        padding: "12px 16px",
        overflowY: "auto"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {INSTRUMENTS.map(({ symbol, name, sector }) => (
            <button
              key={symbol}
              onClick={() => handleSelect(symbol)}
              style={{
                padding: "12px",
                border: selectedSymbol === symbol ? "1px solid var(--theme-primary)" : "1px solid var(--theme-border-primary)",
                borderRadius: "var(--theme-radius-sm)",
                background: selectedSymbol === symbol ? "var(--theme-bg-tertiary)" : "var(--theme-bg-secondary)",
                cursor: "pointer",
                transition: "var(--theme-transition-fast)",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: "4px"
              }}
              onMouseEnter={(e) => {
                if (selectedSymbol !== symbol) {
                  e.currentTarget.style.background = "var(--theme-bg-tertiary)";
                  e.currentTarget.style.borderColor = "var(--theme-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedSymbol !== symbol) {
                  e.currentTarget.style.background = "var(--theme-bg-secondary)";
                  e.currentTarget.style.borderColor = "var(--theme-border-primary)";
                }
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ 
                  fontSize: "var(--theme-font-size-lg)", 
                  fontWeight: "var(--theme-font-weight-bold)", 
                  color: "var(--theme-text-primary)",
                  letterSpacing: "0.5px"
                }}>
                  {symbol}
                </span>
                {selectedSymbol === symbol && (
                  <span style={{
                    fontSize: "var(--theme-font-size-xs)",
                    fontWeight: "var(--theme-font-weight-bold)",
                    color: "#000",
                    background: "var(--theme-primary)",
                    padding: "2px 6px",
                    borderRadius: "var(--theme-radius-sm)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    SELECTED
                  </span>
                )}
              </div>
              <span style={{ fontSize: "var(--theme-font-size-md)", color: "var(--theme-text-secondary)", fontWeight: "var(--theme-font-weight-medium)" }}>
                {name}
              </span>
              <span style={{ 
                fontSize: "var(--theme-font-size-sm)", 
                color: "var(--theme-text-tertiary)",
                fontWeight: "var(--theme-font-weight-medium)",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                {sector}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
