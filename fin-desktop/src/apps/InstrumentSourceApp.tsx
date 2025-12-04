import React, { useState } from "react";
import { useFdc3Bus } from "../fdc3/Fdc3Context";
import type { SelectedInstrumentContext } from "../fdc3/types";
import { useLogger } from "../logging/useLogger";

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
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <div style={{ padding: "24px 24px 16px" }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: "24px", 
          fontWeight: 600,
          letterSpacing: "-0.5px"
        }}>
          Instrument Publisher
        </h1>
        <p style={{ 
          margin: "8px 0 0", 
          opacity: 0.9,
          fontSize: "14px"
        }}>
          Select an instrument to broadcast via FDC3
        </p>
      </div>
      
      <div style={{
        flex: 1,
        background: "white",
        borderRadius: "16px 16px 0 0",
        padding: "20px",
        overflowY: "auto",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "grid", gap: "12px" }}>
          {INSTRUMENTS.map(({ symbol, name, sector }) => (
            <button
              key={symbol}
              onClick={() => handleSelect(symbol)}
              style={{
                padding: "16px 20px",
                border: selectedSymbol === symbol ? "2px solid #667eea" : "2px solid #e5e7eb",
                borderRadius: "12px",
                background: selectedSymbol === symbol ? "#f0f4ff" : "white",
                cursor: "pointer",
                transition: "all 0.2s ease",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: "4px"
              }}
              onMouseEnter={(e) => {
                if (selectedSymbol !== symbol) {
                  e.currentTarget.style.background = "#f9fafb";
                  e.currentTarget.style.borderColor = "#d1d5db";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedSymbol !== symbol) {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ 
                  fontSize: "18px", 
                  fontWeight: 600, 
                  color: "#111827",
                  letterSpacing: "-0.3px"
                }}>
                  {symbol}
                </span>
                {selectedSymbol === symbol && (
                  <span style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#667eea",
                    background: "white",
                    padding: "4px 8px",
                    borderRadius: "6px"
                  }}>
                    SELECTED
                  </span>
                )}
              </div>
              <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>
                {name}
              </span>
              <span style={{ 
                fontSize: "11px", 
                color: "#9ca3af",
                fontWeight: 500,
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
