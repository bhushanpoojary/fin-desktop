import React, { useRef, useCallback, useState } from "react";
import type { WorkspaceDockHandle } from "./WorkspaceDock";
import { WorkspaceDock } from "./WorkspaceDock";
import { useActiveLayout } from "../layout/useActiveLayout";
import { Launcher } from "../features/launcher/Launcher";
import type { AppDefinition } from "../config/types";
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
  const [showLauncher, setShowLauncher] = useState(false);

  // Debounce layout changes to avoid excessive saves
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleLaunch = useCallback((app: AppDefinition) => {
    console.log("Launching app from workspace:", app.id);
    if (dockRef.current) {
      dockRef.current.openApp(app.id, { title: app.title });
      setShowLauncher(false); // Close launcher after launching an app
    }
  }, [dockRef]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontSize: "var(--theme-font-size-base)",
          color: "var(--theme-text-secondary)",
          backgroundColor: "var(--theme-bg-primary)",
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
          fontSize: "var(--theme-font-size-base)",
          color: "var(--theme-danger)",
          backgroundColor: "var(--theme-bg-primary)",
        }}
      >
        Error loading layout: {error}
      </div>
    );
  }

  const initialModelJson = activeLayout?.data as FlexLayout.IJsonModel | undefined;

  return (
    <div className="workspace-shell" style={{ position: "relative", height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--theme-bg-primary)" }}>
      {/* Header with layout controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 12px",
          backgroundColor: "var(--theme-bg-secondary)",
          borderBottom: "1px solid var(--theme-border-primary)",
          minHeight: "32px",
        }}
      >
        <div style={{ fontSize: "var(--theme-font-size-md)", color: "var(--theme-text-secondary)" }}>
          Layout: <strong style={{ color: "var(--theme-primary)" }}>{activeLayout?.name ?? "Default"}</strong>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {/* Launcher Button */}
          <button
            onClick={() => setShowLauncher(true)}
            className="btn-primary"
            style={{
              padding: "4px 12px",
              fontSize: "var(--theme-font-size-sm)",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            🚀 Launcher
          </button>
          {/* Test Tray Button */}
          <button
            onClick={() => {
              console.log('[WorkspaceShell] Minimizing to tray...');
              if (window.desktopApi?.tray) {
                window.desktopApi.tray.minimizeToTray();
              } else {
                console.warn('[WorkspaceShell] Tray API not available');
              }
            }}
            className="btn-secondary"
            style={{
              padding: "4px 12px",
              fontSize: "var(--theme-font-size-sm)",
              cursor: "pointer",
            }}
          >
            📍 Minimize to Tray
          </button>
          <button
            onClick={handleManualSave}
            disabled={isSaving}
            className="btn-primary"
            style={{
              padding: "4px 12px",
              fontSize: "var(--theme-font-size-sm)",
              cursor: isSaving ? "not-allowed" : "pointer",
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            {isSaving ? "Saving..." : "Save Layout"}
          </button>
        </div>
      </div>

      {/* Dock area */}
      <div style={{ flex: 1, position: "relative" }}>
        <WorkspaceDock
          ref={dockRef}
          initialModelJson={initialModelJson}
          onLayoutChange={handleLayoutChange}
          onOpenLauncher={() => setShowLauncher(true)}
        />
      </div>

      {/* Launcher Modal */}
      {showLauncher && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setShowLauncher(false)}
        >
          <div
            style={{
              backgroundColor: "var(--theme-bg-primary)",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "900px",
              width: "90%",
              maxHeight: "85vh",
              overflow: "auto",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
              border: "1px solid var(--theme-border-primary)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, color: "var(--theme-text-primary)", fontSize: "1.5rem" }}>App Launcher</h2>
              <button
                onClick={() => setShowLauncher(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "var(--theme-text-secondary)",
                  padding: "0",
                  width: "32px",
                  height: "32px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--theme-bg-tertiary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                ×
              </button>
            </div>
            <Launcher onLaunch={handleLaunch} />
          </div>
        </div>
      )}
    </div>
  );
};

// Export dockRef accessor for use in parent components (e.g., to connect Launcher)
// In practice, you'd use Context or prop drilling to pass dockRef to Launcher
export type { WorkspaceDockHandle };
