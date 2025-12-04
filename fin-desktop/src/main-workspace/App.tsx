import { useDesktopApi } from '../shared/hooks/useDesktopApi';
import { Launcher } from '../features/launcher/Launcher';
import type { AppDefinition } from '../config/types';

function WorkspaceApp() {
  const { openApp } = useDesktopApi();

  const handleLaunch = (app: AppDefinition) => {
    console.log("Launching app:", app.id, app);
    openApp(app.id);
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '60px 40px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '48px', 
          fontWeight: '700',
          color: 'white',
          marginBottom: '12px',
          letterSpacing: '-1px'
        }}>
          Workspace Shell
        </h1>
        <p style={{ 
          fontSize: '18px', 
          color: 'rgba(255, 255, 255, 0.9)',
          marginBottom: '40px',
          fontWeight: '300'
        }}>
          Select an application to launch
        </p>
        
        <Launcher onLaunch={handleLaunch} />
      </div>
    </div>
  );
}

export default WorkspaceApp
