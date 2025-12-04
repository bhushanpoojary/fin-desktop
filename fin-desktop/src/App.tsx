import { useDesktopApi } from './shared/hooks/useDesktopApi';
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

  return (
    <div>
      <h1>{config.title}</h1>
      <div>
        {config.apps.map((app) => (
          <button key={app.id} onClick={() => openApp(app.id)}>
            {app.title}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
