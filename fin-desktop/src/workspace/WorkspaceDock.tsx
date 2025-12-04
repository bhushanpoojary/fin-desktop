import React, { useRef, useImperativeHandle, useCallback } from "react";
import * as FlexLayout from "flexlayout-react";
import "flexlayout-react/style/light.css";
import type { AppComponentRegistry } from "./appRegistry";
import { defaultAppRegistry } from "./appRegistry";

export interface WorkspaceDockProps {
  /**
   * Initial FlexLayout model JSON to restore a saved layout.
   * If not provided, starts with an empty tabset.
   */
  initialModelJson?: FlexLayout.IJsonModel;
  
  /**
   * Callback invoked whenever the layout model changes.
   * Use this to persist layout changes to storage.
   */
  onLayoutChange?: (modelJson: FlexLayout.IJsonModel) => void;
  
  /**
   * Custom app component registry.
   * Defaults to defaultAppRegistry if not provided.
   */
  appRegistry?: AppComponentRegistry;
  
  /**
   * Optional callback for telemetry when an app is opened in the dock.
   */
  onAppLaunchedFromDock?: (appId: string) => void;
}

export interface WorkspaceDockHandle {
  /**
   * Open an app in the workspace dock.
   * @param appId - The ID of the app to open (must exist in appRegistry)
   * @param options - Optional configuration for how to open the app
   */
  openApp: (appId: string, options?: OpenAppOptions) => void;
}

export interface OpenAppOptions {
  /**
   * Custom title for the tab. Defaults to appId if not provided.
   */
  title?: string;
  
  /**
   * Whether to open the app as a floating window.
   * If false, opens in the active tabset or first available tabset.
   */
  float?: boolean;
}

/**
 * WorkspaceDock provides in-workspace docking using FlexLayout.
 * Features:
 * - Tab groups
 * - Drag-to-dock
 * - Split views (horizontal/vertical)
 * - Floating windows (popouts)
 * - Layout save/load integration
 */
export const WorkspaceDock = React.forwardRef<WorkspaceDockHandle, WorkspaceDockProps>(
  (
    {
      initialModelJson,
      onLayoutChange,
      appRegistry,
      onAppLaunchedFromDock,
    },
    ref
  ) => {
    const registry = appRegistry ?? defaultAppRegistry;
    
    // Create default model if none provided
    const defaultModel: FlexLayout.IJsonModel = {
      global: {
        tabEnableClose: true,
        tabEnableRename: false,
        tabSetEnableMaximize: true,
        tabSetEnableTabStrip: true,
      },
      borders: [],
      layout: {
        type: "row",
        weight: 100,
        children: [
          {
            type: "tabset",
            weight: 100,
            children: [
              {
                type: "tab",
                name: "Welcome",
                component: "welcome",
              },
            ],
          },
        ],
      },
    };

    const modelRef = useRef<FlexLayout.Model>(
      FlexLayout.Model.fromJson(initialModelJson ?? defaultModel)
    );

    const handleModelChange = useCallback(() => {
      if (onLayoutChange) {
        onLayoutChange(modelRef.current.toJson());
      }
    }, [onLayoutChange]);

    const factory = useCallback(
      (node: FlexLayout.TabNode) => {
        const appId = node.getComponent();
        if (!appId) {
          return <div style={{ padding: "1rem" }}>Unknown component</div>;
        }

        // Special case for welcome tab
        if (appId === "welcome") {
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#666",
                fontSize: "1.2rem",
              }}
            >
              Welcome to the Workspace. Use the Launcher to open apps.
            </div>
          );
        }

        const Comp = registry[appId];
        if (!Comp) {
          return (
            <div style={{ padding: "1rem", color: "#d32f2f" }}>
              App not registered: {appId}
            </div>
          );
        }

        return <Comp />;
      },
      [registry]
    );

    // Expose imperative handle for opening apps
    useImperativeHandle(
      ref,
      () => ({
        openApp(appId: string, options?: OpenAppOptions) {
          const model = modelRef.current;
          const title = options?.title ?? appId;

          // Check if app exists in registry
          if (!registry[appId]) {
            console.error(`Cannot open app: "${appId}" not found in registry`);
            return;
          }

          const tabConfig: FlexLayout.IJsonTabNode = {
            type: "tab",
            component: appId,
            name: title,
          };

          if (options?.float) {
            // Open as floating window
            model.doAction(
              FlexLayout.Actions.addNode(
                tabConfig,
                "root",
                FlexLayout.DockLocation.CENTER,
                -1,
                true // select the new tab
              )
            );
          } else {
            // Open in active tabset or first available tabset
            const activeTabset = model.getActiveTabset();
            const targetId = activeTabset?.getId() ?? model.getFirstTabSet()?.getId();

            if (targetId) {
              model.doAction(
                FlexLayout.Actions.addNode(
                  tabConfig,
                  targetId,
                  FlexLayout.DockLocation.CENTER,
                  -1,
                  true // select the new tab
                )
              );
            } else {
              // Fallback: add to root if no tabsets exist
              model.doAction(
                FlexLayout.Actions.addNode(
                  tabConfig,
                  "root",
                  FlexLayout.DockLocation.CENTER,
                  -1,
                  true
                )
              );
            }
          }

          // Notify telemetry callback
          onAppLaunchedFromDock?.(appId);
        },
      }),
      [registry, onAppLaunchedFromDock]
    );

    return (
      <div style={{ position: "absolute", inset: 0 }}>
        <FlexLayout.Layout
          model={modelRef.current}
          factory={factory}
          onModelChange={handleModelChange}
        />
      </div>
    );
  }
);

WorkspaceDock.displayName = "WorkspaceDock";
