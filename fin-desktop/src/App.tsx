import { useState, useEffect } from 'react';
import { useDesktopApi } from './shared/hooks/useDesktopApi';
import { ConfigProviderFactory } from './config/ConfigProviderFactory';
import type { AppDefinition } from './config/types';
import './App.css';

export type LauncherApp = { id: string; title: string };

export type LauncherConfig = {
  title: string;
  apps: LauncherApp[];
};

export const defaultLauncherConfig: LauncherConfig = {
  title: "Fin Desktop Shell",
  apps: [
    { id: "live-market", title: "Live Market" },
    { id: "news", title: "News Feed" },
    { id: "order-ticket", title: "Order Ticket" },
  ],
};

interface AppProps {
  launcherConfig?: LauncherConfig;
}

function App({ launcherConfig }: AppProps) {
  const config = launcherConfig ?? defaultLauncherConfig;
  const { openApp } = useDesktopApi();
  const [configApps, setConfigApps] = useState<AppDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Example: Load apps from the config provider
  useEffect(() => {
    const loadApps = async () => {
      try {
        const configProvider = ConfigProviderFactory.create();
        const apps = await configProvider.getApps();
        setConfigApps(apps);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load apps from config:', err);
        setError(err instanceof Error ? err.message : 'Failed to load apps');
        setLoading(false);
      }
    };

    loadApps();
  }, []);

  return (
    <div>
      <h1>{config.title}</h1>
      
      {/* Original hardcoded apps */}
      <div>
        <h2>Legacy Apps (Hardcoded)</h2>
        {config.apps.map((app) => (
          <button key={app.id} onClick={() => openApp(app.id)}>
            {app.title}
          </button>
        ))}
      </div>

      {/* New config-driven apps */}
      <div style={{ marginTop: '2rem' }}>
        <h2>Config-Driven Apps</h2>
        {loading && <p>Loading apps...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {!loading && !error && (
          <div>
            {configApps.map((app) => (
              <button 
                key={app.id} 
                onClick={() => openApp(app.id)}
                title={`Category: ${app.category || 'N/A'}`}
              >
                {app.title}
                {app.category && <span style={{ fontSize: '0.8em', marginLeft: '0.5rem' }}>({app.category})</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
