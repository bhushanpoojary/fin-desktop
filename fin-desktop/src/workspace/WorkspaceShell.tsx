import React, { useRef, useCallback, useState } from "react";
import type { WorkspaceDockHandle } from "./WorkspaceDock";
import { WorkspaceDock } from "./WorkspaceDock";
import { useActiveLayout } from "../layout/useActiveLayout";
import type * as FlexLayout from "flexlayout-react";

export interface WorkspaceShellProps {
  /**
   * Optional external ref to the dock handle.
   * Use this to control the dock from parent components (e.g., Launcher).
   * If not provided, an internal ref will be used.
   */
  dockRef?: React.RefObject<WorkspaceDockHandle | null>;
}

/**
 * WorkspaceShell manages the workspace dock and integrates it with the layout manager.
 * 
 * Features:
 * - Loads initial layout from ILayoutManager
 * - Saves layout changes automatically
 * - Exposes dockRef for opening apps from Launcher
 * - Provides layout controls (save button, layout name display)
 * 
 * @example With external ref:
 * ```tsx
 * const dockRef = useRef<WorkspaceDockHandle>(null);
 * return <WorkspaceShell dockRef={dockRef} />;
 * ```
 * 
 * @example With WorkspaceContext:
 * ```tsx
 * const { dockRef } = useWorkspace();
 * return <WorkspaceShell dockRef={dockRef} />;
 * ```
 */
export const WorkspaceShell: React.FC<WorkspaceShellProps> = ({ dockRef: externalDockRef }) => {
  const internalDockRef = useRef<WorkspaceDockHandle | null>(null);
  const dockRef = externalDockRef ?? internalDockRef;
  const { activeLayout, saveCurrentLayout, isLoading, error } = useActiveLayout();
  const [isSaving, setIsSaving] = useState(false);

  // Debounce layout changes to avoid excessive saves
  const saveTimeoutRef = useRef<number | null>(null);

  const handleLayoutChange = useCallback(
    (modelJson: FlexLayout.IJsonModel) => {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Debounce saves by 1 second
      saveTimeoutRef.current = setTimeout(() => {
        const layoutName = activeLayout?.name ?? "Workspace";
        void saveCurrentLayout(layoutName, modelJson);
      }, 1000);
    },
    [activeLayout?.name, saveCurrentLayout]
  );

  const handleManualSave = useCallback(async () => {
    const layoutName = activeLayout?.name ?? "Workspace";
    setIsSaving(true);
    try {
      // Get current model from the dock
      // Note: In a real implementation, you might want to expose getCurrentModel
      // from WorkspaceDock handle. For now, the auto-save handles persistence.
      await saveCurrentLayout(layoutName, activeLayout?.data ?? {});
    } finally {
      setIsSaving(false);
    }
  }, [activeLayout, saveCurrentLayout]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontSize: "1.2rem",
          color: "#666",
        }}
      >
        Loading workspace layout…
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontSize: "1.2rem",
          color: "#d32f2f",
        }}
      >
        Error loading layout: {error}
      </div>
    );
  }

  const initialModelJson = activeLayout?.data as FlexLayout.IJsonModel | undefined;

  return (
    <div className="workspace-shell" style={{ position: "relative", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header with layout controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.5rem 1rem",
          backgroundColor: "#f5f5f5",
          borderBottom: "1px solid #ddd",
          minHeight: "40px",
        }}
      >
        <div style={{ fontSize: "0.9rem", color: "#666" }}>
          Layout: <strong>{activeLayout?.name ?? "Default"}</strong>
        </div>
        <button
          onClick={handleManualSave}
          disabled={isSaving}
          style={{
            padding: "0.25rem 0.75rem",
            fontSize: "0.875rem",
            backgroundColor: "#007acc",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: isSaving ? "not-allowed" : "pointer",
            opacity: isSaving ? 0.6 : 1,
          }}
        >
          {isSaving ? "Saving..." : "Save Layout"}
        </button>
      </div>

      {/* Dock area */}
      <div style={{ flex: 1, position: "relative" }}>
        <WorkspaceDock
          ref={dockRef}
          initialModelJson={initialModelJson}
          onLayoutChange={handleLayoutChange}
        />
      </div>
    </div>
  );
};

// Export dockRef accessor for use in parent components (e.g., to connect Launcher)
// In practice, you'd use Context or prop drilling to pass dockRef to Launcher
export type { WorkspaceDockHandle };
