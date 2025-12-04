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
      background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
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
          Instrument Subscriber
        </h1>
        <p style={{ 
          margin: "8px 0 0", 
          opacity: 0.9,
          fontSize: "14px"
        }}>
          Listening for FDC3 instrument broadcasts
        </p>
      </div>
      
      <div style={{
        flex: 1,
        background: "white",
        borderRadius: "16px 16px 0 0",
        padding: "24px",
        overflowY: "auto",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {ctx ? (
          <div style={{ width: "100%", maxWidth: "500px" }}>
            <div style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "16px",
              padding: "32px",
              color: "white",
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)"
            }}>
              <div style={{
                fontSize: "14px",
                fontWeight: 600,
                opacity: 0.9,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "16px"
              }}>
                Current Instrument
              </div>
              <div style={{
                fontSize: "56px",
                fontWeight: 700,
                letterSpacing: "-1px",
                marginBottom: "24px"
              }}>
                {ctx.instrument}
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginTop: "24px"
              }}>
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
              marginTop: "24px",
              padding: "16px 20px",
              background: "#f0fdf4",
              border: "2px solid #86efac",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <div style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#22c55e",
                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
              }} />
              <span style={{ fontSize: "13px", color: "#166534", fontWeight: 500 }}>
                Connected and listening for updates
              </span>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
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
              📡
            </div>
            <h3 style={{ 
              margin: "0 0 12px", 
              fontSize: "20px", 
              color: "#111827",
              fontWeight: 600
            }}>
              Waiting for Instrument
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: "14px", 
              color: "#6b7280",
              lineHeight: "1.6"
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
