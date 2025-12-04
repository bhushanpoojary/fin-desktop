import React, { useEffect } from "react";
import { useSelectedInstrument } from "../fdc3/Fdc3Context";
import { useLogger } from "../logging/useLogger";

export const InstrumentTargetApp: React.FC = () => {
  const ctx = useSelectedInstrument();
  const logger = useLogger("InstrumentTargetApp");

  useEffect(() => {
    if (ctx) {
      logger.info("Received FDC3 selected instrument", ctx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx]); // logger is stable

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit", 
      second: "2-digit",
      hour12: true 
    });
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
          Instrument Subscriber
        </h1>
        <p style={{ 
          margin: "4px 0 0", 
          color: "var(--theme-text-secondary)",
          fontSize: "var(--theme-font-size-sm)"
        }}>
          Listening for FDC3 instrument broadcasts
        </p>
      </div>
      
      <div style={{
        flex: 1,
        background: "var(--theme-bg-primary)",
        padding: "16px",
        overflowY: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {ctx ? (
          <div style={{ width: "100%", maxWidth: "500px" }}>
            <div style={{
              background: "var(--theme-bg-secondary)",
              border: "1px solid var(--theme-border-primary)",
              borderRadius: "var(--theme-radius-sm)",
              padding: "20px",
              color: "var(--theme-text-primary)",
              textAlign: "center"
            }}>
              <div style={{
                fontSize: "var(--theme-font-size-sm)",
                fontWeight: "var(--theme-font-weight-bold)",
                color: "var(--theme-primary)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "12px"
              }}>
                Current Instrument
              </div>
              <div style={{
                fontSize: "48px",
                fontWeight: "var(--theme-font-weight-bold)",
                letterSpacing: "0.5px",
                marginBottom: "16px",
                color: "var(--theme-text-primary)"
              }}>
                {ctx.instrument}
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginTop: "16px"
              }}>
                <div style={{
                  background: "var(--theme-bg-tertiary)",
                  border: "1px solid var(--theme-border-primary)",
                  borderRadius: "var(--theme-radius-sm)",
                  padding: "12px"
                }}>
                  <div style={{ 
                    fontSize: "11px", 
                    opacity: 0.8, 
                    marginBottom: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontWeight: 600
                  }}>
                    Source App
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>
                    {ctx.sourceAppId ?? "Unknown"}
                  </div>
                </div>
                <div style={{
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  padding: "16px",
                  backdropFilter: "blur(10px)"
                }}>
                  <div style={{ 
                    fontSize: "11px", 
                    opacity: 0.8, 
                    marginBottom: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontWeight: 600
                  }}>
                    Updated At
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>
                    {formatTimestamp(ctx.timestamp)}
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{
              marginTop: "16px",
              padding: "10px 12px",
              background: "var(--theme-bg-primary)",
              border: "1px solid var(--theme-success)",
              borderRadius: "var(--theme-radius-sm)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <div style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--theme-success)",
                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
              }} />
              <span style={{ fontSize: "var(--theme-font-size-sm)", color: "var(--theme-success)", fontWeight: "var(--theme-font-weight-bold)" }}>
                Connected and listening for updates
              </span>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
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
              📡
            </div>
            <h3 style={{ 
              margin: "0 0 8px", 
              fontSize: "var(--theme-font-size-lg)", 
              color: "var(--theme-text-primary)",
              fontWeight: "var(--theme-font-weight-bold)"
            }}>
              Waiting for Instrument
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: "var(--theme-font-size-md)", 
              color: "var(--theme-text-secondary)",
              lineHeight: "1.4"
            }}>
              No instrument selected yet. Click an instrument in the Publisher window to see it here.
            </p>
          </div>
        )}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};
