import { useDesktopApi } from '../shared/hooks/useDesktopApi';

export type LauncherApp = { id: string; title: string };

export type LauncherConfig = {
  title: string;
  apps: LauncherApp[];
};

export const defaultLauncherConfig: LauncherConfig = {
  title: "Workspace Shell",
  apps: [
    { id: "live-market", title: "Live Market" },
    { id: "news", title: "News Feed" },
    { id: "order-ticket", title: "Order Ticket" },
  ],
};

interface WorkspaceAppProps {
  launcherConfig?: LauncherConfig;
}

function WorkspaceApp({ launcherConfig }: WorkspaceAppProps) {
  const config = launcherConfig ?? defaultLauncherConfig;
  const { openApp } = useDesktopApi();

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
          {config.title}
        </h1>
        <p style={{ 
          fontSize: '18px', 
          color: 'rgba(255, 255, 255, 0.9)',
          marginBottom: '60px',
          fontWeight: '300'
        }}>
          Select an application to launch
        </p>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginTop: '40px'
        }}>
          {config.apps.map((app) => (
            <button 
              key={app.id} 
              onClick={() => openApp(app.id)}
              style={{
                padding: '32px',
                fontSize: '20px',
                fontWeight: '600',
                cursor: 'pointer',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: '#333',
                border: 'none',
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.3s ease',
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.25)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.15)';
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                {app.id === 'live-market' && '📈'}
                {app.id === 'news' && '📰'}
                {app.id === 'order-ticket' && '🎫'}
              </div>
              {app.title}
              <div style={{
                fontSize: '14px',
                color: '#666',
                marginTop: '8px',
                fontWeight: '400'
              }}>
                {app.id === 'live-market' && 'View real-time market data'}
                {app.id === 'news' && 'Latest financial news'}
                {app.id === 'order-ticket' && 'Execute trades'}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WorkspaceApp
