/**
 * Example Integration: Window Docking with FinDesktop
 * 
 * This file shows how to integrate the window docking system
 * with the existing FinDesktop workspace infrastructure.
 */

import React, { useState, useCallback } from 'react';
import { Workspace, useWorkspaceWindows } from './Workspace';
import type { WindowLayout } from './DockingManager';

/**
 * Example 1: Basic Integration
 * 
 * Simple workspace with custom app content
 */
export const BasicDockingWorkspace: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Workspace
        initialWindows={[
          { id: 'market-data', x: 50, y: 50, width: 600, height: 400 },
          { id: 'order-ticket', x: 700, y: 50, width: 400, height: 500 },
        ]}
        renderWindowContent={(windowId) => {
          // Render different apps based on window ID
          switch (windowId) {
            case 'market-data':
              return <div>Market Data App</div>;
            case 'order-ticket':
              return <div>Order Ticket App</div>;
            default:
              return <div>Unknown App: {windowId}</div>;
          }
        }}
      />
    </div>
  );
};

/**
 * Example 2: Dynamic App Launching
 * 
 * Integrate with existing app registry and launcher
 */
interface AppDefinition {
  id: string;
  title: string;
  component: React.ComponentType;
}

export const DynamicDockingWorkspace: React.FC<{ apps: AppDefinition[] }> = ({ apps }) => {
  const { windows, addWindow, removeWindow } = useWorkspaceWindows();
  const [appRegistry] = useState<Map<string, AppDefinition>>(
    new Map(apps.map(app => [app.id, app]))
  );

  const launchApp = useCallback((appId: string) => {
    // Check if already open
    if (windows.find(w => w.id === appId)) {
      console.log('App already open:', appId);
      return;
    }

    // Calculate spawn position (cascade from top-left)
    const offset = windows.length * 30;
    addWindow({
      id: appId,
      x: 100 + offset,
      y: 100 + offset,
      width: 500,
      height: 400,
    });
  }, [windows, addWindow]);

  const renderWindowContent = useCallback((windowId: string) => {
    const app = appRegistry.get(windowId);
    if (!app) {
      return <div>App not found: {windowId}</div>;
    }

    const AppComponent = app.component;
    return (
      <div>
        <button 
          onClick={() => removeWindow(windowId)}
          style={{ 
            position: 'absolute', 
            top: '8px', 
            right: '8px',
            zIndex: 10 
          }}
        >
          Close
        </button>
        <AppComponent />
      </div>
    );
  }, [appRegistry, removeWindow]);

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Launcher UI */}
      <div style={{ padding: '12px', borderBottom: '1px solid #333' }}>
        <h3>Launch Apps:</h3>
        {apps.map(app => (
          <button 
            key={app.id} 
            onClick={() => launchApp(app.id)}
            style={{ marginRight: '8px' }}
          >
            {app.title}
          </button>
        ))}
      </div>

      {/* Workspace */}
      <div style={{ flex: 1 }}>
        <Workspace
          initialWindows={windows}
          renderWindowContent={renderWindowContent}
        />
      </div>
    </div>
  );
};

/**
 * Example 3: Persistence Integration
 * 
 * Save and restore window layouts
 */
export const PersistentDockingWorkspace: React.FC = () => {
  const [windows, setWindows] = useState<WindowLayout[]>(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('window-layout');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved layout:', e);
      }
    }
    // Default layout
    return [
      { id: 'app1', x: 100, y: 100, width: 400, height: 300 },
    ];
  });

  const handleLayoutChange = useCallback((newWindows: WindowLayout[]) => {
    setWindows(newWindows);
    // Save to localStorage
    localStorage.setItem('window-layout', JSON.stringify(newWindows));
  }, []);

  return (
    <Workspace
      initialWindows={windows}
      onWindowsChange={handleLayoutChange}
    />
  );
};

/**
 * Example 4: Hybrid with FlexLayout
 * 
 * Use both tab-based (FlexLayout) and window-based docking
 */
export const HybridWorkspace: React.FC = () => {
  const [mode, setMode] = useState<'tabs' | 'windows'>('tabs');

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      {/* Mode switcher */}
      <div style={{ padding: '8px', borderBottom: '1px solid #333' }}>
        <button onClick={() => setMode('tabs')}>Tab Mode</button>
        <button onClick={() => setMode('windows')}>Window Mode</button>
      </div>

      {/* Render appropriate workspace */}
      <div style={{ flex: 1 }}>
        {mode === 'tabs' ? (
          <div>FlexLayout WorkspaceDock here</div>
        ) : (
          <Workspace initialWindows={[]} />
        )}
      </div>
    </div>
  );
};

/**
 * Example 5: With FDC3 Integration
 * 
 * Windows can communicate via FDC3
 */
export const Fdc3DockingWorkspace: React.FC = () => {
  const { windows } = useWorkspaceWindows([
    { id: 'instrument-source', x: 50, y: 50, width: 400, height: 300 },
    { id: 'instrument-target', x: 500, y: 50, width: 400, height: 300 },
  ]);

  const renderWindowContent = useCallback((windowId: string) => {
    // Each window gets its own FDC3 context
    if (windowId === 'instrument-source') {
      return <div>Instrument Picker (broadcasts instruments)</div>;
    }
    if (windowId === 'instrument-target') {
      return <div>Chart (listens for instruments)</div>;
    }
    return <div>Unknown window</div>;
  }, []);

  return (
    <Workspace
      initialWindows={windows}
      renderWindowContent={renderWindowContent}
    />
  );
};

/**
 * Example 6: Custom Snap Behavior
 * 
 * Adjust snap threshold based on user preference
 */
export const CustomSnapWorkspace: React.FC = () => {
  const [snapThreshold, setSnapThreshold] = useState(16);

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Settings */}
      <div style={{ padding: '8px', borderBottom: '1px solid #333' }}>
        <label>
          Snap Sensitivity: 
          <input
            type="range"
            min="8"
            max="40"
            value={snapThreshold}
            onChange={(e) => setSnapThreshold(Number(e.target.value))}
          />
          {snapThreshold}px
        </label>
      </div>

      {/* Workspace */}
      <div style={{ flex: 1 }}>
        <Workspace
          snapThreshold={snapThreshold}
          initialWindows={[
            { id: 'w1', x: 100, y: 100, width: 400, height: 300 },
          ]}
        />
      </div>
    </div>
  );
};

/**
 * Example 7: With Layout Manager
 * 
 * Integrate with existing LayoutManager
 */
export const LayoutManagerIntegration: React.FC = () => {
  const { windows, setWindows } = useWorkspaceWindows();

  const saveLayout = useCallback(async () => {
    // Save to LayoutManager
    const layoutData = {
      windows: windows.map(w => ({
        windowId: w.id,
        x: w.x,
        y: w.y,
        width: w.width,
        height: w.height,
        state: 'normal' as const,
      })),
    };
    
    // Use your existing LayoutManager
    // await layoutManager.saveLayout('My Layout', layoutData);
    console.log('Saving layout:', layoutData);
  }, [windows]);

  const loadLayout = useCallback(async () => {
    // Load from LayoutManager
    // const layout = await layoutManager.loadLayout('My Layout');
    // if (layout) {
    //   setWindows(layout.windows.map(w => ({
    //     id: w.windowId,
    //     x: w.x,
    //     y: w.y,
    //     width: w.width,
    //     height: w.height,
    //   })));
    // }
    console.log('Loading layout...');
  }, [setWindows]);

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Layout controls */}
      <div style={{ padding: '8px', borderBottom: '1px solid #333' }}>
        <button onClick={saveLayout}>Save Layout</button>
        <button onClick={loadLayout}>Load Layout</button>
      </div>

      {/* Workspace */}
      <div style={{ flex: 1 }}>
        <Workspace initialWindows={windows} />
      </div>
    </div>
  );
};

export default {
  BasicDockingWorkspace,
  DynamicDockingWorkspace,
  PersistentDockingWorkspace,
  HybridWorkspace,
  Fdc3DockingWorkspace,
  CustomSnapWorkspace,
  LayoutManagerIntegration,
};
