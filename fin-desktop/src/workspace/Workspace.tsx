/**
 * Workspace - Window Management Container
 * 
 * Manages multiple desktop windows with docking support.
 * Integrates DockingManager for snap behavior and DockingOverlay for visual feedback.
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { DesktopWindow } from './DesktopWindow';
import { DockingOverlay } from './DockingOverlay';
import { computeDockingPreview } from './DockingManager';
import type { WindowLayout, DockingResult } from './DockingManager';

export interface WorkspaceProps {
  /**
   * Initial windows to display (uncontrolled mode)
   */
  initialWindows?: WindowLayout[];

  /**
   * Controlled windows state
   */
  windows?: WindowLayout[];

  /**
   * Callback when windows change
   */
  onWindowsChange?: (windows: WindowLayout[]) => void;

  /**
   * Snap threshold in pixels (default: 16)
   */
  snapThreshold?: number;

  /**
   * Custom window content renderer
   */
  renderWindowContent?: (windowId: string) => React.ReactNode;
}

/**
 * Workspace component
 * 
 * Container for managing multiple draggable, resizable windows with docking support.
 */
export const Workspace: React.FC<WorkspaceProps> = ({
  initialWindows = [],
  windows: controlledWindows,
  onWindowsChange,
  snapThreshold = 16,
  renderWindowContent,
}) => {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [internalWindows, setInternalWindows] = useState<WindowLayout[]>(initialWindows);
  const [dockingPreview, setDockingPreview] = useState<DockingResult | null>(null);
  const [workspaceRect, setWorkspaceRect] = useState<DOMRect | null>(null);

  // Use controlled windows if provided, otherwise use internal state
  const isControlled = controlledWindows !== undefined;
  const windows = isControlled ? controlledWindows : internalWindows;
  
  const updateWindows = useCallback((updater: (prev: WindowLayout[]) => WindowLayout[]) => {
    if (isControlled && onWindowsChange) {
      onWindowsChange(updater(windows));
    } else {
      setInternalWindows(updater);
    }
  }, [isControlled, onWindowsChange, windows]);

  // Update workspace rect on mount and resize
  useEffect(() => {
    const updateRect = () => {
      if (workspaceRef.current) {
        setWorkspaceRect(workspaceRef.current.getBoundingClientRect());
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, []);

  // Handle window drag
  const handleWindowDrag = useCallback(
    (id: string, x: number, y: number) => {
      // Update window position immediately for smooth dragging
      updateWindows((prevWindows) => {
        const updatedWindows = prevWindows.map((win) =>
          win.id === id ? { ...win, x, y } : win
        );

        // Compute docking preview
        if (workspaceRect) {
          const draggingWindow = updatedWindows.find((w) => w.id === id);
          const otherWindows = updatedWindows.filter((w) => w.id !== id);

          if (draggingWindow) {
            const preview = computeDockingPreview(
              draggingWindow,
              otherWindows,
              {
                x: 0,
                y: 0,
                width: workspaceRect.width,
                height: workspaceRect.height,
              },
              snapThreshold
            );

            setDockingPreview(preview);
          }
        }

        return updatedWindows;
      });
    },
    [workspaceRect, snapThreshold, updateWindows]
  );

  // Handle drag end - apply docking if preview exists
  const handleWindowDragEnd = useCallback(
    (id: string) => {
      if (dockingPreview) {
        // Apply docking preview to the window
        updateWindows((prevWindows) =>
          prevWindows.map((win) =>
            win.id === id
              ? {
                  ...win,
                  x: dockingPreview.x,
                  y: dockingPreview.y,
                  width: dockingPreview.width,
                  height: dockingPreview.height,
                }
              : win
          )
        );
      }

      // Clear docking preview
      setDockingPreview(null);
    },
    [dockingPreview, updateWindows]
  );

  // Handle window resize
  const handleWindowResize = useCallback(
    (id: string, width: number, height: number) => {
      updateWindows((prevWindows) =>
        prevWindows.map((win) =>
          win.id === id ? { ...win, width, height } : win
        )
      );
    },
    [updateWindows]
  );

  // Handle window activation
  const handleWindowClick = useCallback((id: string) => {
    updateWindows((prevWindows) =>
      prevWindows.map((win) => ({ ...win, isActive: win.id === id }))
    );
  }, [updateWindows]);

  // Default window content renderer
  const defaultRenderContent = (windowId: string) => (
    <div style={{ color: 'var(--theme-text-primary, #fff)' }}>
      <h3>Window: {windowId}</h3>
      <p>This is a demo window. You can drag the title bar to move it.</p>
      <p>Drag near edges or other windows to see docking behavior.</p>
      <ul style={{ marginTop: '16px' }}>
        <li>Drag to workspace edges to dock to half-screen</li>
        <li>Drag near other windows to snap together</li>
        <li>Resize from corners and edges</li>
      </ul>
    </div>
  );

  const contentRenderer = renderWindowContent || defaultRenderContent;

  return (
    <div
      ref={workspaceRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--theme-bg-secondary, #0f0f0f)',
        overflow: 'hidden',
      }}
    >
      {/* Render all windows */}
      {windows.map((window) => (
        <DesktopWindow
          key={window.id}
          layout={window}
          title={`Window ${window.id}`}
          onDrag={handleWindowDrag}
          onDragEnd={handleWindowDragEnd}
          onResize={handleWindowResize}
          onClick={handleWindowClick}
        >
          {contentRenderer(window.id)}
        </DesktopWindow>
      ))}

      {/* Docking overlay */}
      <DockingOverlay preview={dockingPreview} workspaceRect={workspaceRect} />

      {/* Debug info (optional - remove in production) */}
      {process.env.NODE_ENV === 'development' && dockingPreview && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '8px 12px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#0f0',
            fontSize: '12px',
            fontFamily: 'monospace',
            borderRadius: '4px',
            pointerEvents: 'none',
            zIndex: 10000,
          }}
        >
          <div>Docking: {dockingPreview.dockPosition || 'none'}</div>
          {dockingPreview.dockTargetId && (
            <div>Target: {dockingPreview.dockTargetId}</div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Hook for managing workspace windows programmatically
 */
export function useWorkspaceWindows(initialWindows: WindowLayout[] = []) {
  const [windows, setWindows] = useState<WindowLayout[]>(initialWindows);

  const addWindow = useCallback((window: Omit<WindowLayout, 'isActive'>) => {
    const newWindow: WindowLayout = {
      ...window,
      isActive: true,
    };

    setWindows((prev) => [
      ...prev.map((w) => ({ ...w, isActive: false })),
      newWindow,
    ]);

    return newWindow.id;
  }, []);

  const removeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const updateWindow = useCallback(
    (id: string, updates: Partial<WindowLayout>) => {
      setWindows((prev) =>
        prev.map((w) => (w.id === id ? { ...w, ...updates } : w))
      );
    },
    []
  );

  const activateWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => ({ ...w, isActive: w.id === id }))
    );
  }, []);

  return {
    windows,
    addWindow,
    removeWindow,
    updateWindow,
    activateWindow,
    setWindows,
  };
}
