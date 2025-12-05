import React, { useEffect, useMemo, useState } from "react";
import { useLogger } from "../logging/useLogger";
import { ChannelProvider, useChannelBroadcasts } from "../core/channels";
import type { ChannelBroadcastEvent } from "../core/channels";
import { AppTitleBar } from "../ui";

export const InstrumentTargetApp: React.FC = () => {
  // Generate stable window ID (only once)
  const windowId = useMemo(() => {
    // Use a more stable ID - could be from URL params or window.name in real app
    return `instrument-target-${Math.random().toString(36).substr(2, 9)}`;
  }, []);
  
  return (
    <ChannelProvider windowId={windowId}>
      <InstrumentTargetContent windowId={windowId} />
    </ChannelProvider>
  );
};

interface InstrumentContext {
  instrument: string;
  sourceAppId?: string;
  timestamp?: string;
}

const InstrumentTargetContent: React.FC<{ windowId: string }> = ({ windowId }) => {
  const logger = useLogger("InstrumentTargetApp");
  const [ctx, setCtx] = useState<InstrumentContext | undefined>(undefined);

  useEffect(() => {
    console.log("[InstrumentTarget] Component mounted with windowId:", windowId);
  }, [windowId]);

  // Listen for channel broadcasts
  useChannelBroadcasts((event: ChannelBroadcastEvent) => {
    console.log("[InstrumentTarget] Received broadcast event:", {
      windowId,
      targetWindowId: event.windowId,
      channelId: event.channelId,
      contextType: event.context.type,
      fullContext: event.context,
    });

    // Only process fdc3.instrument contexts
    if (event.context.type === 'fdc3.instrument') {
      const instrumentCtx: InstrumentContext = {
        instrument: event.context.instrument,
        sourceAppId: event.context.sourceAppId,
        timestamp: event.context.timestamp || new Date().toISOString(),
      };
      
      console.log("[InstrumentTarget] Setting context:", instrumentCtx);
      logger.info("Received FDC3 selected instrument via channel", {
        ...instrumentCtx,
        channelId: event.channelId,
        windowId
      });
      
      setCtx(instrumentCtx);
    }
  });

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
      {/* Title Bar with Channel Selector */}
      <AppTitleBar
        windowId={windowId}
        title="Instrument Subscriber"
        subtitle="Listening for FDC3 instrument broadcasts"
      />
      
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
