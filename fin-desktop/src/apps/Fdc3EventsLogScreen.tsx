import React, { useEffect, useState } from "react";
import { useFdc3Bus } from "../fdc3/Fdc3Context";
import type { SelectedInstrumentContext } from "../fdc3/types";
import { useLogger } from "../logging/useLogger";

interface LocalEvent {
  id: string;
  context: SelectedInstrumentContext;
}

export const Fdc3EventsLogScreen: React.FC = () => {
  const bus = useFdc3Bus();
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const logger = useLogger("FDC3-Events");

  useEffect(() => {
    const unsubscribe = bus.subscribeSelectedInstrument(ctx => {
      const event: LocalEvent = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        context: ctx
      };
      setEvents(prev => [event, ...prev].slice(0, 100)); // keep last 100
      logger.info("FDC3 selectedInstrument event", ctx);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bus]); // logger is stable and doesn't need to trigger re-subscription

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit",
      hour12: false 
    });
  };

  const clearEvents = () => {
    setEvents([]);
  };

  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      color: "white",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <div style={{ padding: "24px 24px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: "24px", 
              fontWeight: 600,
              letterSpacing: "-0.5px"
            }}>
              FDC3 Events Log
            </h1>
            <p style={{ 
              margin: "8px 0 0", 
              opacity: 0.9,
              fontSize: "14px"
            }}>
              Real-time log of all instrument selection events
            </p>
          </div>
          {events.length > 0 && (
            <button
              onClick={clearEvents}
              style={{
                padding: "8px 16px",
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "8px",
                color: "white",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                backdropFilter: "blur(10px)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.2)";
              }}
            >
              Clear Log
            </button>
          )}
        </div>
        
        {events.length > 0 && (
          <div style={{
            marginTop: "16px",
            padding: "12px 16px",
            background: "rgba(255,255,255,0.2)",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            backdropFilter: "blur(10px)"
          }}>
            {events.length} event{events.length !== 1 ? "s" : ""} captured
          </div>
        )}
      </div>
      
      <div style={{
        flex: 1,
        background: "white",
        borderRadius: "16px 16px 0 0",
        padding: "20px",
        overflowY: "auto",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.1)"
      }}>
        {events.length === 0 ? (
          <div style={{ 
            height: "100%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            textAlign: "center"
          }}>
            <div>
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)",
                margin: "0 auto 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px"
              }}>
                📊
              </div>
              <h3 style={{ 
                margin: "0 0 12px", 
                fontSize: "20px", 
                color: "#111827",
                fontWeight: 600
              }}>
                No Events Yet
              </h3>
              <p style={{ 
                margin: 0, 
                fontSize: "14px", 
                color: "#6b7280",
                lineHeight: "1.6",
                maxWidth: "400px"
              }}>
                Events will appear here as instruments are selected. Select an instrument in the Publisher to start logging.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {events.map((ev, index) => (
              <div
                key={ev.id}
                style={{
                  padding: "16px 20px",
                  background: index === 0 ? "#f0f9ff" : "white",
                  border: index === 0 ? "2px solid #0ea5e9" : "1px solid #e5e7eb",
                  borderRadius: "12px",
                  display: "grid",
                  gridTemplateColumns: "100px 120px 1fr auto",
                  gap: "16px",
                  alignItems: "center",
                  transition: "all 0.2s ease",
                  animation: index === 0 ? "slideIn 0.3s ease" : "none"
                }}
              >
                <div>
                  <div style={{ 
                    fontSize: "11px", 
                    color: "#9ca3af", 
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "4px"
                  }}>
                    Time
                  </div>
                  <div style={{ fontSize: "14px", color: "#111827", fontWeight: 600, fontFamily: "monospace" }}>
                    {formatTime(ev.context.timestamp)}
                  </div>
                </div>
                <div>
                  <div style={{ 
                    fontSize: "11px", 
                    color: "#9ca3af", 
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "4px"
                  }}>
                    Instrument
                  </div>
                  <div style={{
                    fontSize: "16px",
                    color: "#111827",
                    fontWeight: 700,
                    letterSpacing: "-0.3px"
                  }}>
                    {ev.context.instrument}
                  </div>
                </div>
                <div>
                  <div style={{ 
                    fontSize: "11px", 
                    color: "#9ca3af", 
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "4px"
                  }}>
                    Source App
                  </div>
                  <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>
                    {ev.context.sourceAppId ?? "unknown"}
                  </div>
                </div>
                {index === 0 && (
                  <div style={{
                    padding: "6px 12px",
                    background: "#0ea5e9",
                    color: "white",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    Latest
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
