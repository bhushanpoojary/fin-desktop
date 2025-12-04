import { WorkspaceProvider, useWorkspace } from '../workspace';
import { Launcher } from '../features/launcher';
import type { AppDefinition } from '../config/types';

/**
 * Minimal test to verify workspace context works
 */
function MinimalWorkspaceTest() {
  const { dockRef } = useWorkspace();

  const handleLaunch = (app: AppDefinition) => {
    console.log("🚀 App clicked:", app.id, app.title);
    alert(`You clicked: ${app.title}\nApp ID: ${app.id}\n\nThe dock would open this app here.`);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>Minimal Workspace Test</h1>
      <p>If you see this, the basic setup works!</p>
      
      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        border: '2px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#f5f5f5'
      }}>
        <h2>Launcher:</h2>
        <Launcher onLaunch={handleLaunch} />
      </div>
      
      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        border: '2px solid #4CAF50',
        borderRadius: '8px',
        backgroundColor: '#e8f5e9'
      }}>
        <h3>Status:</h3>
        <p>✅ WorkspaceProvider is working</p>
        <p>✅ useWorkspace hook is working</p>
        <p>✅ Launcher is rendering</p>
        <p>DockRef status: {dockRef.current ? '✅ Connected' : '⚠️ Not connected yet'}</p>
      </div>
    </div>
  );
}

export default function MinimalTest() {
  return (
    <WorkspaceProvider>
      <MinimalWorkspaceTest />
    </WorkspaceProvider>
  );
}
