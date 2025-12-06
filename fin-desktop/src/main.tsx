import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './theme.css'
import WorkspaceApp from './main-workspace/App'
import UltraMinimalTest from './workspace/UltraMinimalTest'
import MinimalTest from './workspace/MinimalTest'
import WorkspaceDockTestApp from './workspace/WorkspaceDockTestApp'
import ThemeTestApp from './workspace/ThemeTestApp'
import AppHost from './apps/AppHost'
import { LogStoreProvider } from './logging/LogStoreContext'
import { Fdc3Provider } from './fdc3/Fdc3Context'
import { AppShell } from './shell'
import { DefaultBranding } from './core/defaults/DefaultBranding'
import { NotificationTray } from './ui/NotificationTray'

// Read URL search parameters
const params = new URLSearchParams(window.location.search)
const entry = params.get('entry')
const appId = params.get('appId')
const test = params.get('test') // Add test parameter

// Determine which component to render
let AppComponent

if (test === 'theme') {
  AppComponent = <ThemeTestApp />  // Theme engine test page
} else if (test === 'ultra') {
  AppComponent = <UltraMinimalTest />  // Ultra minimal - just React rendering
} else if (test === 'minimal') {
  AppComponent = <WorkspaceApp />  // Clean launcher workspace
} else if (test === 'full') {
  AppComponent = <WorkspaceDockTestApp />  // Full workspace with FlexLayout
} else if (entry === 'workspace') {
  AppComponent = <WorkspaceDockTestApp />  // Full workspace with docking!
} else if (entry === 'app' && appId) {
  AppComponent = <AppHost appId={appId} />
} else {
  // Default: Show splash screen with AppShell
  AppComponent = <AppShell branding={new DefaultBranding()} />
}

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Fdc3Provider>
        <LogStoreProvider>
          {AppComponent}
          <NotificationTray />
        </LogStoreProvider>
      </Fdc3Provider>
    </StrictMode>,
  );
} catch (error) {
  console.error('❌ Error rendering React app:', error);
  // Fallback: show error in DOM
  document.body.innerHTML = `
    <div style="padding: 40px; font-family: Arial; color: red;">
      <h1>Error Loading Application</h1>
      <pre>${error}</pre>
    </div>
  `;
}
