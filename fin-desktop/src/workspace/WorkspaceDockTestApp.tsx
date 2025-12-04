import { WorkspaceProvider, useWorkspace, WorkspaceShell } from '../workspace';
import { Launcher } from '../features/launcher';
import type { AppDefinition } from '../config/types';

/**
 * Demo workspace with integrated launcher and docking.
 * This demonstrates the workspace docking feature in action.
 */
function WorkspaceDockDemo() {
  const { dockRef } = useWorkspace();

  const handleLaunch = (app: AppDefinition) => {
    console.log("🚀 Opening app in workspace dock:", app.id, app.title);
    
    // Open the app in the workspace dock
    dockRef.current?.openApp(app.id, {
      title: app.title,
      float: false, // Set to true to test floating windows
    });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#0a0a0a' }}>
      {/* Launcher Sidebar */}
      <div
        style={{
          width: '280px',
          backgroundColor: '#1a1a1a',
          borderRight: '1px solid #2a2a2a',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#0a0a0a',
            borderBottom: '1px solid #2a2a2a',
          }}
        >
          <h2 style={{ margin: 0, color: '#ff8c00', fontSize: '14px', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            🚀 Workspace Dock Demo
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '10px' }}>
            Click an app to open in dock
          </p>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Launcher onLaunch={handleLaunch} />
        </div>
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: '#0a0a0a',
            borderTop: '1px solid #2a2a2a',
            fontSize: '9px',
            color: '#666',
          }}
        >
          <strong style={{ color: '#ff8c00' }}>Tip:</strong> Drag tabs to split views or create floating windows!
        </div>
      </div>

      {/* Main Workspace Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <WorkspaceShell dockRef={dockRef} />
      </div>
    </div>
  );
}

/**
 * Main app wrapper with WorkspaceProvider
 */
export default function WorkspaceDockTestApp() {
  return (
    <WorkspaceProvider>
      <WorkspaceDockDemo />
    </WorkspaceProvider>
  );
}
