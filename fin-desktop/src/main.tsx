console.log('🚀 main.tsx is loading...');

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './theme.css'
import WorkspaceApp from './main-workspace/App'
import UltraMinimalTest from './workspace/UltraMinimalTest'
import WorkspaceDockTestApp from './workspace/WorkspaceDockTestApp'
import ThemeTestApp from './workspace/ThemeTestApp'
import { WindowDockingDemo } from './workspace/WindowDockingDemo'
import { PlatformPlayground } from './examples/PlatformPlayground'
import { PlatformControl } from './examples/PlatformControl'
import { Fdc3Demo } from './examples/Fdc3Demo'
import { Fdc3Inspector } from './examples/Fdc3Inspector'
import { CommandPaletteDemo } from './examples/CommandPaletteDemo'
import AppHost from './apps/AppHost'
import { LogStoreProvider } from './logging/LogStoreContext'
import { Fdc3Provider } from './fdc3/Fdc3Context'
import { AppShell } from './shell'
import { DefaultBranding } from './core/defaults/DefaultBranding'
import { NotificationTray } from './ui/NotificationTray'
import { IntentResolverProvider } from './shared/providers/IntentResolverProvider'
import { initializeFdc3Intents, createFdc3DesktopApi } from './shared/fdc3DesktopApi'
import { ensureDesktopApi } from './shared/mockDesktopApi'
import { initializeFdc3 } from './interop/fdc3/bootstrap'
import type { AppDirectoryApp } from './interop/fdc3'
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

// Standards-compliant FDC3 2.0 app directory (for window.fdc3 discovery)
const fdc3StandardApps: AppDirectoryApp[] = [
  { appId: 'chart', name: 'Price Chart', interop: { intents: { listensFor: { ViewChart: { contexts: ['fdc3.instrument'] } } } } },
  { appId: 'news', name: 'Market News', interop: { intents: { listensFor: { ViewNews: { contexts: ['fdc3.instrument', 'fdc3.organization'] } } } } },
  { appId: 'contacts', name: 'Contacts', interop: { intents: { listensFor: { ViewContact: { contexts: ['fdc3.contact'] }, StartChat: { contexts: ['fdc3.contact'] } } } } },
]

// Install window.fdc3 (FDC3 2.0) backed by the desktop bus for cross-window interop
try {
  if (window.desktopApi) {
    initializeFdc3(window.desktopApi, { appId: appId ?? entry ?? 'workspace', apps: fdc3StandardApps })
    console.log('✅ window.fdc3 (FDC3 2.0) initialized')
  }
} catch (error) {
  console.error('❌ Failed to initialize window.fdc3:', error)
}

// Determine which component to render (AFTER FDC3 initialization)
let AppComponent

console.log('🔍 [main.tsx] URL params:', { test, entry, appId });

if (test === 'theme') {
  console.log('📄 [main.tsx] Rendering: ThemeTestApp');
  AppComponent = <ThemeTestApp />  // Theme engine test page
} else if (test === 'platform') {
  console.log('📄 [main.tsx] Rendering: PlatformPlayground');
  AppComponent = <PlatformPlayground />  // Platform core: layout + drag-dock + snapshots
} else if (test === 'platform-control') {
  console.log('📄 [main.tsx] Rendering: PlatformControl');
  AppComponent = <PlatformControl />  // Controller for the real-windows Platform demo
} else if (test === 'fdc3') {
  console.log('📄 [main.tsx] Rendering: Fdc3Demo');
  AppComponent = <Fdc3Demo />  // FDC3 2.0 window.fdc3 demo (channels + intents)
} else if (test === 'fdc3-inspector') {
  console.log('📄 [main.tsx] Rendering: Fdc3Inspector');
  AppComponent = <Fdc3Inspector />  // Live FDC3 context/intent inspector
} else if (test === 'palette') {
  console.log('📄 [main.tsx] Rendering: CommandPaletteDemo');
  AppComponent = <CommandPaletteDemo />  // Spotlight / command-palette launcher
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
