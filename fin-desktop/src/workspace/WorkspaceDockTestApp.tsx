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
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {/* Launcher Sidebar */}
      <div
        style={{
          width: '320px',
          backgroundColor: '#2c3e50',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
        }}
      >
        <div
          style={{
            padding: '20px',
            backgroundColor: '#1a252f',
            borderBottom: '1px solid #34495e',
          }}
        >
          <h2 style={{ margin: 0, color: 'white', fontSize: '1.3rem' }}>
            🚀 Workspace Dock Demo
          </h2>
          <p style={{ margin: '8px 0 0 0', color: '#95a5a6', fontSize: '0.85rem' }}>
            Click an app to open in dock
          </p>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Launcher onLaunch={handleLaunch} />
        </div>
        <div
          style={{
            padding: '12px',
            backgroundColor: '#1a252f',
            borderTop: '1px solid #34495e',
            fontSize: '0.75rem',
            color: '#95a5a6',
          }}
        >
          <strong>Tip:</strong> Drag tabs to split views or create floating windows!
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
