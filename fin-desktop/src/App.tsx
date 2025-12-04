import { useDesktopApi } from './shared/hooks/useDesktopApi';
import { Launcher } from './features/launcher/Launcher';
import type { AppDefinition } from './config/types';
import './App.css';

function App() {
  const { openApp } = useDesktopApi();

  const handleLaunch = (app: AppDefinition) => {
    console.log("Launching app:", app.id, app);
    openApp(app.id);
  };

  return (
    <div className="app-shell">
      <Launcher onLaunch={handleLaunch} />
    </div>
  );
}

export default App;
