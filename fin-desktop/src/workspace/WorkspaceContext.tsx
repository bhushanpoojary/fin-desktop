import React, { createContext, useContext, useRef } from "react";
import type { WorkspaceDockHandle } from "./WorkspaceDock";

/**
 * Context for accessing the workspace dock throughout the app.
 * Provides access to the dock ref for opening apps programmatically.
 */
interface WorkspaceContextValue {
  dockRef: React.RefObject<WorkspaceDockHandle | null>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

/**
 * Provider component that makes the workspace dock accessible throughout the app.
 * Wrap your app with this provider to enable useWorkspace hook.
 */
export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dockRef = useRef<WorkspaceDockHandle | null>(null);

  return (
    <WorkspaceContext.Provider value={{ dockRef }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

/**
 * Hook to access workspace dock functionality.
 * Must be used within a WorkspaceProvider.
 * 
 * @example
 * ```typescript
 * const { dockRef } = useWorkspace();
 * 
 * const handleLaunch = (app: AppDefinition) => {
 *   dockRef.current?.openApp(app.id, { title: app.title });
 * };
 * ```
 */
export const useWorkspace = (): WorkspaceContextValue => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return context;
};
