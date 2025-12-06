/**
 * FDC3 Demo App Entry Point
 * 
 * Use this to launch the FDC3 Phase 1 demo directly
 * 
 * To use:
 * 1. Import this in your main App.tsx or index.html route
 * 2. Or add a route: /fdc3-demo -> <Fdc3DemoApp />
 * 3. Or add a button in launcher that opens this component
 */

import React from "react";
import { DemoWorkspace } from "./shell/DemoWorkspace";

export function Fdc3DemoApp() {
  return <DemoWorkspace />;
}

export default Fdc3DemoApp;
