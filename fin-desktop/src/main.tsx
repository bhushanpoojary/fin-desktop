import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import WorkspaceApp from './main-workspace/App'
import AppHost from './apps/AppHost'
import { LogStoreProvider } from './logging/LogStoreContext'

// Read URL search parameters
const params = new URLSearchParams(window.location.search)
const entry = params.get('entry')
const appId = params.get('appId')

// Determine which component to render
let AppComponent

if (entry === 'workspace') {
  AppComponent = <WorkspaceApp />
} else if (entry === 'app' && appId) {
  AppComponent = <AppHost appId={appId} />
} else {
  // Default to workspace if no entry is provided
  AppComponent = <WorkspaceApp />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LogStoreProvider>
      {AppComponent}
    </LogStoreProvider>
  </StrictMode>,
)
