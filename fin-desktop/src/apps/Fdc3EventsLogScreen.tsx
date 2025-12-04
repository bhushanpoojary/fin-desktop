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
      background: "var(--theme-bg-primary)",
      color: "var(--theme-text-primary)",
      fontFamily: "var(--theme-font-family)"
    }}>
      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: "var(--theme-font-size-xl)", 
              fontWeight: "var(--theme-font-weight-bold)",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              color: "var(--theme-primary)"
            }}>
              FDC3 Events Log
            </h1>
            <p style={{ 
              margin: "4px 0 0", 
              color: "var(--theme-text-secondary)",
              fontSize: "var(--theme-font-size-sm)"
            }}>
              Real-time log of all instrument selection events
            </p>
          </div>
          {events.length > 0 && (
            <button
              onClick={clearEvents}
              style={{
                padding: "6px 12px",
                background: "var(--theme-bg-secondary)",
                border: "1px solid var(--theme-border-primary)",
                borderRadius: "var(--theme-radius-sm)",
                color: "var(--theme-text-primary)",
                fontSize: "var(--theme-font-size-sm)",
                fontWeight: "var(--theme-font-weight-bold)",
                cursor: "pointer",
                transition: "var(--theme-transition-fast)",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--theme-bg-tertiary)";
                e.currentTarget.style.borderColor = "var(--theme-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--theme-bg-secondary)";
                e.currentTarget.style.borderColor = "var(--theme-border-primary)";
              }}
            >
              Clear Log
            </button>
          )}
        </div>
        
        {events.length > 0 && (
          <div style={{
            marginTop: "12px",
            padding: "8px 12px",
            background: "var(--theme-bg-secondary)",
            border: "1px solid var(--theme-border-primary)",
            borderRadius: "var(--theme-radius-sm)",
            fontSize: "var(--theme-font-size-sm)",
            fontWeight: "var(--theme-font-weight-bold)",
            color: "var(--theme-primary)"
          }}>
            {events.length} event{events.length !== 1 ? "s" : ""} captured
          </div>
        )}
      </div>
      
      <div style={{
        flex: 1,
        background: "var(--theme-bg-primary)",
        padding: "12px 16px",
        overflowY: "auto"
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
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "var(--theme-bg-secondary)",
                margin: "0 auto 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px"
              }}>
                📊
              </div>
              <h3 style={{ 
                margin: "0 0 8px", 
                fontSize: "var(--theme-font-size-lg)", 
                color: "var(--theme-text-primary)",
                fontWeight: "var(--theme-font-weight-bold)"
              }}>
                No Events Yet
              </h3>
              <p style={{ 
                margin: 0, 
                fontSize: "var(--theme-font-size-md)", 
                color: "var(--theme-text-secondary)",
                lineHeight: "1.4",
                maxWidth: "400px"
              }}>
                Events will appear here as instruments are selected. Select an instrument in the Publisher to start logging.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {events.map((ev, index) => (
              <div
                key={ev.id}
                style={{
                  padding: "12px",
                  background: index === 0 ? "var(--theme-bg-tertiary)" : "var(--theme-bg-secondary)",
                  border: index === 0 ? "1px solid var(--theme-primary)" : "1px solid var(--theme-border-primary)",
                  borderRadius: "var(--theme-radius-sm)",
                  display: "grid",
                  gridTemplateColumns: "80px 100px 1fr auto",
                  gap: "12px",
                  alignItems: "center",
                  transition: "var(--theme-transition-fast)",
                  animation: index === 0 ? "slideIn 0.3s ease" : "none"
                }}
              >
                <div>
                  <div style={{ 
                    fontSize: "var(--theme-font-size-xs)", 
                    color: "var(--theme-primary)", 
                    fontWeight: "var(--theme-font-weight-bold)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "2px"
                  }}>
                    Time
                  </div>
                  <div style={{ fontSize: "var(--theme-font-size-md)", color: "var(--theme-text-primary)", fontWeight: "var(--theme-font-weight-bold)", fontFamily: "monospace" }}>
                    {formatTime(ev.context.timestamp)}
                  </div>
                </div>
                <div>
                  <div style={{ 
                    fontSize: "var(--theme-font-size-xs)", 
                    color: "var(--theme-primary)", 
                    fontWeight: "var(--theme-font-weight-bold)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "2px"
                  }}>
                    Instrument
                  </div>
                  <div style={{
                    fontSize: "var(--theme-font-size-lg)",
                    color: "var(--theme-text-primary)",
                    fontWeight: "var(--theme-font-weight-bold)",
                    letterSpacing: "0.5px"
                  }}>
                    {ev.context.instrument}
                  </div>
                </div>
                <div>
                  <div style={{ 
                    fontSize: "var(--theme-font-size-xs)", 
                    color: "var(--theme-primary)", 
                    fontWeight: "var(--theme-font-weight-bold)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "2px"
                  }}>
                    Source App
                  </div>
                  <div style={{ fontSize: "var(--theme-font-size-md)", color: "var(--theme-text-secondary)", fontWeight: "var(--theme-font-weight-medium)" }}>
                    {ev.context.sourceAppId ?? "unknown"}
                  </div>
                </div>
                {index === 0 && (
                  <div style={{
                    padding: "4px 8px",
                    background: "var(--theme-primary)",
                    color: "#000",
                    borderRadius: "var(--theme-radius-sm)",
                    fontSize: "var(--theme-font-size-xs)",
                    fontWeight: "var(--theme-font-weight-bold)",
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
