/**
 * AppShell Integration Example
 * 
 * This file demonstrates how to integrate the AppShell component
 * into your main application entry point.
 * 
 * Usage:
 * 1. Import AppShell and your branding
 * 2. Wrap your app with necessary providers
 * 3. Pass branding and optional callbacks
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppShell } from './index';
import { DefaultBranding } from '../core/defaults/DefaultBranding';
import { Fdc3Provider } from '../fdc3/Fdc3Context';
import { LogStoreProvider } from '../logging/LogStoreContext';
import '../index.css';
import '../theme.css';

/**
 * Example 1: Basic Integration
 */
export function BasicExample() {
  return (
    <StrictMode>
      <AppShell branding={new DefaultBranding()} />
    </StrictMode>
  );
}

/**
 * Example 2: With Providers
 */
export function WithProvidersExample() {
  return (
    <StrictMode>
      <Fdc3Provider>
        <LogStoreProvider>
          <AppShell branding={new DefaultBranding()} />
        </LogStoreProvider>
      </Fdc3Provider>
    </StrictMode>
  );
}

/**
 * Example 3: With Callbacks
 */
export function WithCallbacksExample() {
  const handleInitComplete = () => {
    console.log('✅ Application initialized successfully');
    // Track analytics, send telemetry, etc.
  };

  const handleInitError = (error: Error) => {
    console.error('❌ Application initialization failed:', error);
    // Send error to monitoring service
  };

  return (
    <StrictMode>
      <AppShell
        branding={new DefaultBranding()}
        onInitComplete={handleInitComplete}
        onInitError={handleInitError}
      />
    </StrictMode>
  );
}

/**
 * Example 4: Custom Branding
 */
export function CustomBrandingExample() {
  // Import your custom branding
  // import { CustomBranding } from './extensions/CustomBranding';

  return (
    <StrictMode>
      <AppShell
        branding={new DefaultBranding()} // Replace with new CustomBranding()
        onInitComplete={() => console.log('Ready with custom branding!')}
      />
    </StrictMode>
  );
}

/**
 * Example 5: Custom Splash Component
 */
export function CustomSplashExample() {
  const CustomSplash = ({ branding, statusText }: any) => (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        color: '#fff',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1>{branding.getProductName()}</h1>
        <p>{statusText}</p>
      </div>
    </div>
  );

  return (
    <StrictMode>
      <AppShell
        branding={new DefaultBranding()}
        splashComponent={CustomSplash}
      />
    </StrictMode>
  );
}

/**
 * Example 6: Development Mode with Bypass
 * 
 * Use URL parameters to bypass splash for faster development
 */
export function DevelopmentModeExample() {
  const params = new URLSearchParams(window.location.search);
  const skipSplash = params.get('skipSplash') === 'true';

  if (skipSplash) {
    // Skip splash and go directly to workspace
    const { WorkspaceShell } = require('../workspace/WorkspaceShell');
    return (
      <StrictMode>
        <Fdc3Provider>
          <LogStoreProvider>
            <WorkspaceShell />
          </LogStoreProvider>
        </Fdc3Provider>
      </StrictMode>
    );
  }

  return (
    <StrictMode>
      <Fdc3Provider>
        <LogStoreProvider>
          <AppShell branding={new DefaultBranding()} />
        </LogStoreProvider>
      </Fdc3Provider>
    </StrictMode>
  );
}

/**
 * Actual Integration (replace your main.tsx with this)
 */
if (typeof window !== 'undefined' && document.getElementById('root')) {
  // Use WithProvidersExample in production
  createRoot(document.getElementById('root')!).render(
    <WithProvidersExample />
  );
}

/**
 * To use in your main.tsx:
 * 
 * import { StrictMode } from 'react';
 * import { createRoot } from 'react-dom/client';
 * import { AppShell } from './shell';
 * import { DefaultBranding } from './core/defaults/DefaultBranding';
 * import { Fdc3Provider } from './fdc3/Fdc3Context';
 * import { LogStoreProvider } from './logging/LogStoreContext';
 * import './index.css';
 * import './theme.css';
 * 
 * createRoot(document.getElementById('root')!).render(
 *   <StrictMode>
 *     <Fdc3Provider>
 *       <LogStoreProvider>
 *         <AppShell
 *           branding={new DefaultBranding()}
 *           onInitComplete={() => console.log('✅ App ready')}
 *           onInitError={(err) => console.error('❌ Init failed:', err)}
 *         />
 *       </LogStoreProvider>
 *     </Fdc3Provider>
 *   </StrictMode>
 * );
 */
