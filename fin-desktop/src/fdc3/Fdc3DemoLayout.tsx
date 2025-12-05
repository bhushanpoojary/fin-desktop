import React from "react";
import { InstrumentSourceApp } from "../apps/InstrumentSourceApp";
import { InstrumentTargetApp } from "../apps/InstrumentTargetApp";
import { Fdc3EventsLogScreen } from "../apps/Fdc3EventsLogScreen";
import { NotificationCenterDemo } from "../core/notifications/NotificationCenterDemo";
import { NotificationTray } from "../ui/NotificationTray";

/**
 * Demo layout showing all three FDC3 screens side-by-side.
 * 
 * Usage:
 * 1. Click an instrument in the Source app (left)
 * 2. See it immediately appear in the Target app (center)
 * 3. View the event log in the Events Log (right)
 * 
 * This demonstrates the minimal FDC3 publish/subscribe flow for
 * instrument selection context.
 */
export const Fdc3DemoLayout: React.FC = () => {
  const [showNotificationDemo, setShowNotificationDemo] = React.useState(false);

  if (showNotificationDemo) {
    return (
      <>
        <NotificationCenterDemo />
        <NotificationTray />
      </>
    );
  }

  return (
    <>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr 1fr", 
        height: "100vh",
        gap: "1px",
        backgroundColor: "#ccc"
      }}>
        <div style={{ backgroundColor: "white", overflow: "auto" }}>
          <InstrumentSourceApp />
        </div>
        <div style={{ backgroundColor: "white", overflow: "auto" }}>
          <InstrumentTargetApp />
        </div>
        <div style={{ backgroundColor: "white", overflow: "auto" }}>
          <Fdc3EventsLogScreen />
        </div>
      </div>
      
      {/* Notification Demo Toggle Button */}
      <button
        onClick={() => setShowNotificationDemo(true)}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          padding: "12px 24px",
          backgroundColor: "#673ab7",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "14px",
          fontWeight: "500",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          zIndex: 9998,
        }}
      >
        🔔 Test Notifications
      </button>

      <NotificationTray />
    </>
  );
};
