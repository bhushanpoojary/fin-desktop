console.log('🚀 main.tsx is loading...');

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './theme.css'
import WorkspaceApp from './main-workspace/App'
import UltraMinimalTest from './workspace/UltraMinimalTest'
import MinimalTest from './workspace/MinimalTest'
import WorkspaceDockTestApp from './workspace/WorkspaceDockTestApp'
import ThemeTestApp from './workspace/ThemeTestApp'
import { WindowDockingDemo } from './workspace/WindowDockingDemo'
import AppHost from './apps/AppHost'
import { LogStoreProvider } from './logging/LogStoreContext'
import { Fdc3Provider } from './fdc3/Fdc3Context'
import { AppShell } from './shell'
import { DefaultBranding } from './core/defaults/DefaultBranding'
import { NotificationTray } from './ui/NotificationTray'
import { IntentResolverProvider } from './shared/providers/IntentResolverProvider'
import { initializeFdc3Intents, createFdc3DesktopApi } from './shared/fdc3DesktopApi'
import { ensureDesktopApi } from './shared/mockDesktopApi'
import type { AppDefinition } from './core/fdc3/Fdc3AppDirectory'

// Define app directory inline to avoid config import issues
const appDirectory: AppDefinition[] = [
  { id: "chartApp", title: "Price Chart", componentId: "ChartApp", intents: ["ViewChart"], isDefaultForIntent: ["ViewChart"] },
  { id: "newsApp", title: "Market News", componentId: "NewsApp", intents: ["ViewNews"], isDefaultForIntent: ["ViewNews"] },
  { id: "tradeTicketApp", title: "Trade Ticket", componentId: "TradeTicketApp", intents: ["Trade", "ViewChart"], isDefaultForIntent: ["Trade"] },
  { id: "liveMarketApp", title: "Live Market Data", componentId: "LiveMarketApp", intents: ["ViewChart", "ViewNews"] },
  { id: "orderTicketApp", title: "Order Ticket", componentId: "OrderTicketApp", intents: ["Trade"] },
];

// Initialize FDC3 Intent System FIRST - before creating any components
console.log('🔧 Step 1: Starting FDC3 Intent System initialization...');

try {
  console.log('🔧 Step 2: Ensuring DesktopApi exists...');
  const desktopApi = ensureDesktopApi();
  console.log('✅ Step 3: DesktopApi obtained:', !!desktopApi, typeof desktopApi);
  
  console.log('🔧 Step 4: Calling initializeFdc3Intents with', appDirectory.length, 'apps...');
  initializeFdc3Intents(appDirectory, desktopApi);
  console.log('✅ Step 5: Intent resolver initialized');
  
  console.log('🔧 Step 6: Adding raiseIntent to DesktopApi...');
  createFdc3DesktopApi(desktopApi); // Modifies desktopApi in place
  console.log('✅ Step 7: raiseIntent added to API');
  console.log('✅ Step 8: desktopApi has raiseIntent:', typeof desktopApi.raiseIntent);
  console.log('✅ Step 9: window.desktopApi has raiseIntent:', typeof window.desktopApi?.raiseIntent);
  
  console.log('✅ Step 11: Verifying window.desktopApi.raiseIntent:', typeof window.desktopApi?.raiseIntent);
  console.log('✅ FDC3 Intent system fully initialized with', appDirectory.length, 'apps');
} catch (error) {
  console.error('❌ Failed to initialize FDC3 intents at some step:', error);
  console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
}

// Read URL search parameters
const params = new URLSearchParams(window.location.search)
const entry = params.get('entry')
const appId = params.get('appId')
const test = params.get('test') // Add test parameter

// Determine which component to render (AFTER FDC3 initialization)
let AppComponent

console.log('🔍 [main.tsx] URL params:', { test, entry, appId });

if (test === 'theme') {
  console.log('📄 [main.tsx] Rendering: ThemeTestApp');
  AppComponent = <ThemeTestApp />  // Theme engine test page
} else if (test === 'docking') {
  console.log('📄 [main.tsx] Rendering: WindowDockingDemo');
  AppComponent = <WindowDockingDemo />  // Window docking with magnetic snapping
} else if (test === 'ultra') {
  console.log('📄 [main.tsx] Rendering: UltraMinimalTest');
  AppComponent = <UltraMinimalTest />  // Ultra minimal - just React rendering
} else if (test === 'minimal') {
  console.log('📄 [main.tsx] Rendering: WorkspaceApp');
  AppComponent = <WorkspaceApp />  // Clean launcher workspace
} else if (test === 'full') {
  console.log('📄 [main.tsx] Rendering: WorkspaceDockTestApp');
  AppComponent = <WorkspaceDockTestApp />  // Full workspace with FlexLayout
} else if (entry === 'workspace') {
  console.log('📄 [main.tsx] Rendering: WorkspaceDockTestApp (via entry=workspace)');
  AppComponent = <WorkspaceDockTestApp />  // Full workspace with docking!
} else if (entry === 'app' && appId) {
  console.log('📄 [main.tsx] Rendering: AppHost for', appId);
  AppComponent = <AppHost appId={appId} />
} else {
  console.log('📄 [main.tsx] Rendering: AppShell (DEFAULT - splash/login/workspace flow)');
  console.log('✅ [main.tsx] You should see: Splash → Login → Workspace');
  // Default: Show splash screen with AppShell
  AppComponent = <AppShell branding={new DefaultBranding()} />
}

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <IntentResolverProvider>
        <Fdc3Provider>
          <LogStoreProvider>
            {AppComponent}
            <NotificationTray />
          </LogStoreProvider>
        </Fdc3Provider>
      </IntentResolverProvider>
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
