/**
 * FDC3 Phase 1 Integration Example
 * 
 * Example showing how to integrate the FDC3 Demo Workspace into your app
 */

import React from "react";
import { DemoWorkspace } from "./shell/DemoWorkspace";

/**
 * Example 1: Standalone Demo Workspace
 * 
 * Use this to test FDC3 Phase 1 functionality in isolation
 */
export function Example1_StandaloneDemoWorkspace() {
  return <DemoWorkspace />;
}

/**
 * Example 2: Individual Apps in Your Layout
 * 
 * Use the individual apps in your own custom layout
 */
import { Fdc3Provider } from "./core/fdc3";
import { SimpleInstrumentSource } from "./apps/SimpleInstrumentSource";
import { SimpleInstrumentTarget } from "./apps/SimpleInstrumentTarget";
import { Fdc3EventLogPanel } from "./apps/Fdc3EventLogPanel";

export function Example2_CustomLayout() {
  return (
    <Fdc3Provider>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "100vh", gap: "16px", padding: "16px" }}>
        <SimpleInstrumentSource />
        <SimpleInstrumentTarget />
      </div>
    </Fdc3Provider>
  );
}

/**
 * Example 3: Using the FDC3 Bus Directly
 * 
 * Create your own custom apps using the FDC3 bus
 */
import { useFdc3 } from "./core/fdc3";

function MyCustomApp() {
  const fdc3Bus = useFdc3();
  const [selectedInstrument, setSelectedInstrument] = React.useState<string | null>(null);

  // Subscribe to context changes
  React.useEffect(() => {
    const unsubscribe = fdc3Bus.subscribeContext((ctx) => {
      setSelectedInstrument(ctx.instrument);
    });
    return unsubscribe;
  }, [fdc3Bus]);

  // Broadcast a new instrument
  const handleBroadcast = (symbol: string) => {
    fdc3Bus.broadcastInstrument({
      instrument: symbol,
      sourceAppId: "MyCustomApp",
      timestamp: Date.now(),
    });
  };

  return (
    <div>
      <h2>My Custom FDC3 App</h2>
      <p>Current Instrument: {selectedInstrument || "None"}</p>
      <button onClick={() => handleBroadcast("TSLA")}>
        Broadcast TSLA
      </button>
    </div>
  );
}

export function Example3_CustomApp() {
  return (
    <Fdc3Provider>
      <MyCustomApp />
    </Fdc3Provider>
  );
}

/**
 * Example 4: Multiple Listeners
 * 
 * Show how multiple apps can listen to the same context
 */
function SimpleListener({ appName }: { appName: string }) {
  const fdc3Bus = useFdc3();
  const [instrument, setInstrument] = React.useState<string | null>(null);

  React.useEffect(() => {
    const unsubscribe = fdc3Bus.subscribeContext((ctx) => {
      console.log(`[${appName}] Received:`, ctx.instrument);
      setInstrument(ctx.instrument);
    });
    return unsubscribe;
  }, [fdc3Bus, appName]);

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h3>{appName}</h3>
      <p>Instrument: {instrument || "Waiting..."}</p>
    </div>
  );
}

export function Example4_MultipleListeners() {
  return (
    <Fdc3Provider>
      <div style={{ padding: "20px" }}>
        <h1>Multiple Listeners Demo</h1>
        <SimpleInstrumentSource />
        <hr style={{ margin: "20px 0" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
          <SimpleListener appName="Listener 1" />
          <SimpleListener appName="Listener 2" />
          <SimpleListener appName="Listener 3" />
        </div>
      </div>
    </Fdc3Provider>
  );
}

/**
 * Example 5: Integrate with Main App Shell
 * 
 * Wrap your entire app with Fdc3Provider to enable FDC3 everywhere
 */
import { AppShell } from "./shell/AppShell";

export function Example5_IntegrateWithAppShell() {
  return (
    <Fdc3Provider>
      <AppShell>
        {/* Your app content */}
      </AppShell>
    </Fdc3Provider>
  );
}
