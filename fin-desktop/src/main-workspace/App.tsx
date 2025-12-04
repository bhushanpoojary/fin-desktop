import { useState } from 'react';
import { useDesktopApi } from '../shared/hooks/useDesktopApi';
import { Launcher } from '../features/launcher/Launcher';
import { LogsScreen } from '../features/logs';
import { LayoutDemo } from '../layout';
import type { AppDefinition } from '../config/types';

function WorkspaceApp() {
  const { openApp } = useDesktopApi();
  const [showLogs, setShowLogs] = useState(false);
  const [showLayoutDemo, setShowLayoutDemo] = useState(false);

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
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
              marginBottom: '0',
              fontWeight: '300'
            }}>
              Select an application to launch
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                setShowLayoutDemo(!showLayoutDemo);
                setShowLogs(false);
              }}
              style={{
                padding: '12px 24px',
                background: showLayoutDemo ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.2)',
                color: showLayoutDemo ? '#667eea' : 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backdropFilter: 'blur(10px)',
              }}
              onMouseEnter={(e) => {
                if (!showLayoutDemo) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!showLayoutDemo) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }
              }}
            >
              {showLayoutDemo ? '← Back to Launcher' : '🎨 Layout Demo'}
            </button>

            <button
              onClick={() => {
                setShowLogs(!showLogs);
                setShowLayoutDemo(false);
              }}
              style={{
                padding: '12px 24px',
                background: showLogs ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.2)',
                color: showLogs ? '#667eea' : 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backdropFilter: 'blur(10px)',
              }}
              onMouseEnter={(e) => {
                if (!showLogs) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!showLogs) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }
              }}
            >
              {showLogs ? '← Back to Launcher' : '📋 View Logs'}
            </button>
          </div>
        </div>
        
        {showLayoutDemo ? (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            maxHeight: 'calc(100vh - 240px)',
          }}>
            <LayoutDemo />
          </div>
        ) : showLogs ? (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            height: 'calc(100vh - 240px)',
          }}>
            <LogsScreen />
          </div>
        ) : (
          <Launcher onLaunch={handleLaunch} />
        )}
      </div>
    </div>
  );
}

export default WorkspaceApp
