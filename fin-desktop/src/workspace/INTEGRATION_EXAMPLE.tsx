/**
 * INTEGRATION EXAMPLE: How to connect Launcher to WorkspaceDock
 * 
 * This file demonstrates how to integrate the workspace docking system
 * with the existing Launcher component using the Context API approach.
 */

import React from "react";
import { WorkspaceProvider, useWorkspace, WorkspaceShell } from "./workspace";
import { Launcher } from "./features/launcher";
import type { AppDefinition } from "./config/types";

/**
 * Modified Launcher that uses workspace context to open apps
 */
export const ConnectedLauncher: React.FC = () => {
  const { dockRef } = useWorkspace();

  const handleLaunch = (app: AppDefinition) => {
    // Open app in workspace dock
    dockRef.current?.openApp(app.id, {
      title: app.title,
      float: false, // Set to true to open as floating window
    });
  };

  return <Launcher onLaunch={handleLaunch} />;
};

/**
 * Main App component with workspace integration
 */
export const AppWithWorkspace: React.FC = () => {
  return (
    <WorkspaceProvider>
      <div style={{ display: "flex", height: "100vh" }}>
        {/* Launcher in sidebar or overlay */}
        <div style={{ width: "300px", borderRight: "1px solid #ddd" }}>
          <ConnectedLauncher />
        </div>

        {/* Main workspace area */}
        <div style={{ flex: 1 }}>
          <WorkspaceShell />
        </div>
      </div>
    </WorkspaceProvider>
  );
};

/**
 * ALTERNATIVE: Modified WorkspaceShell that exposes dockRef via context
 */
export const ConnectedWorkspaceShell: React.FC = () => {
  const { dockRef } = useWorkspace();

  // Pass dockRef to WorkspaceShell's internal dock
  // (You'll need to modify WorkspaceShell.tsx to accept an external ref)
  return <WorkspaceShell />;
};

/**
 * USAGE IN EXISTING APP:
 * 
 * 1. Wrap your app with WorkspaceProvider:
 * 
 *    <WorkspaceProvider>
 *      <YourApp />
 *    </WorkspaceProvider>
 * 
 * 2. In Launcher or any component, use useWorkspace:
 * 
 *    const { dockRef } = useWorkspace();
 *    dockRef.current?.openApp("order-ticket", { title: "Order Ticket" });
 * 
 * 3. Render WorkspaceShell in your main layout:
 * 
 *    <WorkspaceShell />
 */
