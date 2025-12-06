/**
 * AppShell Component
 * 
 * Main application shell that orchestrates:
 * - Authentication (login/logout flow)
 * - Splash screen display during initialization
 * - Layout manager workspace loading
 * - Desktop API / event bus initialization
 * - Transition to the main desktop workspace
 * 
 * Architecture:
 * The AppShell manages the app lifecycle including authentication.
 * It checks for an existing session, shows a login screen if needed,
 * and then shows a splash screen while critical resources are loading.
 * Once authenticated and resources are ready, it transitions to the main workspace.
 * 
 * Authentication:
 * - Auth provider is resolved from finDesktopConfig.authProvider
 * - Defaults to DefaultAuthProvider (demo/localStorage auth)
 * - Customers can inject custom auth via finDesktopConfig:
 *   * OAuth 2.0 / OpenID Connect
 *   * SAML SSO
 *   * JWT token validation
 *   * Active Directory
 *   * etc.
 * 
 * See /extensions/CustomAuthProvider.ts for an example.
 * 
 * Customization:
 * Customers can override the splash behavior by:
 * 1. Providing an ISplashProvider in /extensions
 * 2. Passing a custom splash component via props
 * 3. Modifying the initialization logic for custom workflows
 * 
 * NOTE: This is the default splash wiring.
 * Customers can override the splash behavior via an ISplashProvider
 * or by swapping SplashScreen in /extensions without modifying core shell logic.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SplashScreen } from './SplashScreen';
import { LoginScreen } from './LoginScreen';
import { WorkspaceShell } from '../workspace/WorkspaceShell';
import { DefaultBranding } from '../core/defaults/DefaultBranding';
import { LayoutManagerFactory } from '../layout/LayoutManagerFactory';
import { DefaultAuthProvider } from '../core/defaults/DefaultAuthProvider';
import { finDesktopConfig } from '../config/FinDesktopConfig';
import type { IProductBranding } from '../core/interfaces/IProductBranding';
import type { ILayoutManager } from '../layout/ILayoutManager';
import type { IAuthProvider, User } from '../core/interfaces/IAuthProvider';

export interface AppShellProps {
  /**
   * Product branding configuration
   * @default DefaultBranding
   */
  branding?: IProductBranding;

  /**
   * Layout manager instance
   * @default LayoutManagerFactory.create()
   */
  layoutManager?: ILayoutManager;

  /**
   * Auth provider instance
   * @default finDesktopConfig.authProvider ?? new DefaultAuthProvider()
   */
  authProvider?: IAuthProvider;

  /**
   * Custom splash screen component (for advanced customization)
   */
  splashComponent?: React.ComponentType<{ branding: IProductBranding; statusText?: string }>;

  /**
   * Callback fired when initialization is complete
   */
  onInitComplete?: () => void;

  /**
   * Callback fired when initialization fails
   */
  onInitError?: (error: Error) => void;
}

/**
 * AppShell manages the application lifecycle including authentication and splash screen
 */
export const AppShell: React.FC<AppShellProps> = ({
  branding = new DefaultBranding(),
  layoutManager: layoutManagerProp,
  authProvider: authProviderProp,
  splashComponent: CustomSplash,
  onInitComplete,
  onInitError,
}) => {
  // Resolve auth provider: use prop, then config, then default
  // Use useMemo to prevent creating new instances on every render
  const authProvider = useMemo(
    () => authProviderProp ?? finDesktopConfig.authProvider ?? new DefaultAuthProvider(),
    [authProviderProp]
  );

  // Resolve layout manager: use prop or create from factory
  // Use useMemo to prevent creating new instances on every render
  const layoutManager = useMemo(
    () => layoutManagerProp ?? LayoutManagerFactory.create(),
    [layoutManagerProp]
  );

  // Authentication state
  // undefined = checking session, null = not authenticated, User = authenticated
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(undefined);
  const [showInitialSplash, setShowInitialSplash] = useState(true);

  // Initialization state
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [isDesktopApiReady, setIsDesktopApiReady] = useState(false);
  const [currentStatusText, setCurrentStatusText] = useState('Initializing...');
  const [initError, setInitError] = useState<Error | null>(null);

  // Track if we've started fade-out to allow smooth transition
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Use ref to prevent multiple initialization attempts
  const hasInitialized = useRef(false);

  // Derive loading state
  const isLoading = !isLayoutReady || !isDesktopApiReady;

  /**
   * Initialize authentication - check for existing session
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🚀 [AppShell] Checking authentication...');
        
        // Add minimum splash display time (1.5 seconds)
        const minDisplayTime = new Promise(resolve => setTimeout(resolve, 1500));
        
        // Initialize the auth provider first
        await authProvider.initialize();
        
        // Get the current user
        const user = authProvider.getCurrentUser();
        
        // Wait for minimum display time
        await minDisplayTime;
        
        setCurrentUser(user);
        setShowInitialSplash(false);
        
        if (user) {
          console.log('✅ [AppShell] User authenticated:', user.displayName);
        } else {
          console.log('ℹ️ [AppShell] No active session, login required');
        }
      } catch (error) {
        console.error('❌ [AppShell] Auth check failed:', error);
        // Still wait for minimum display time even on error
        await new Promise(resolve => setTimeout(resolve, 1500));
        setCurrentUser(null); // Treat as logged out
        setShowInitialSplash(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes if the provider supports it
    // Note: onAuthChanged is not part of IAuthProvider but DefaultAuthProvider has it
    const provider = authProvider as any;
    if (typeof provider.onAuthChanged === 'function') {
      const handleAuthChange = (user: User | null) => {
        console.log('🔄 [AppShell] Auth state changed:', user?.displayName ?? 'logged out');
        setCurrentUser(user);
      };

      provider.onAuthChanged(handleAuthChange);
      
      // Cleanup on unmount
      return () => {
        if (typeof provider.offAuthChanged === 'function') {
          provider.offAuthChanged(handleAuthChange);
        }
      };
    }
  }, [authProvider]);

  /**
   * Handle successful login
   */
  const handleLoginSuccess = (user: User) => {
    console.log('✅ [AppShell] Login successful:', user.displayName);
    setCurrentUser(user);
  };

  /**
   * Handle logout
   * TODO: Wire this to a logout button in the UI
   */
  // const handleLogout = async () => {
  //   try {
  //     console.log('🚪 [AppShell] Logging out...');
  //     await authProvider.logout();
  //     setCurrentUser(null);
  //     
  //     // Reset initialization state so splash shows again on next login
  //     setIsLayoutReady(false);
  //     setIsDesktopApiReady(false);
  //     hasInitialized.current = false;
  //   } catch (error) {
  //     console.error('❌ [AppShell] Logout failed:', error);
  //   }
  // };

  /**
   * Initialize the layout manager
   */
  useEffect(() => {
    if (hasInitialized.current) return;

    const initLayout = async () => {
      try {
        console.log('🚀 [AppShell] Starting layout initialization...');
        setCurrentStatusText('Loading workspace layout...');

        // Add minimum display time for splash screen (1 second)
        const minDisplayTime = new Promise(resolve => setTimeout(resolve, 1000));

        // Get or create layout manager
        const manager = layoutManager || LayoutManagerFactory.create();

        // Load the active layout (if any)
        const activeLayout = await manager.getActiveLayout();
        
        if (activeLayout) {
          console.log('✅ [AppShell] Loaded active layout:', activeLayout.name);
        } else {
          console.log('ℹ️ [AppShell] No active layout found, will use default');
        }

        // Wait for minimum display time
        await minDisplayTime;
        console.log('✅ [AppShell] Layout ready');
        setIsLayoutReady(true);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to load layout');
        console.error('❌ [AppShell] Layout initialization failed:', err);
        setInitError(err);
        onInitError?.(err);
      }
    };

    initLayout();
  }, [layoutManager, onInitError]);

  /**
   * Initialize the desktop API / event bus
   */
  useEffect(() => {
    if (hasInitialized.current) return;

    const initDesktopApi = async () => {
      try {
        console.log('🚀 [AppShell] Starting desktop API initialization...');
        setCurrentStatusText('Connecting to desktop bus...');

        // Add minimum display time for splash screen (1 second)
        const minDisplayTime = new Promise(resolve => setTimeout(resolve, 1000));

        // Check if desktopApi is available
        if (!window.desktopApi) {
          console.warn('⚠️ [AppShell] Desktop API not available. Running in browser mode.');
          // Create mock API for browser testing
          const { ensureDesktopApi } = await import('../shared/mockDesktopApi');
          ensureDesktopApi();
        } else {
          console.log('✅ [AppShell] Desktop API found');
        }

        // Initialize FDC3 Intents System
        try {
          console.log('🔧 [AppShell] Initializing FDC3 Intent System...');
          const { initializeFdc3Intents, createFdc3DesktopApi } = await import('../shared/fdc3DesktopApi');
          const { appDirectory } = await import('../config/FinDesktopConfig');
          
          if (window.desktopApi) {
            initializeFdc3Intents(appDirectory, window.desktopApi);
            createFdc3DesktopApi(window.desktopApi); // Modifies window.desktopApi in place
            console.log('✅ [AppShell] FDC3 Intent system initialized with', appDirectory.length, 'apps');
            console.log('✅ [AppShell] window.desktopApi.raiseIntent:', typeof window.desktopApi.raiseIntent);
          }
        } catch (fdc3Error) {
          console.error('❌ [AppShell] Failed to initialize FDC3 intents:', fdc3Error);
        }

        // Wait for minimum display time
        await minDisplayTime;
        console.log('✅ [AppShell] Desktop API ready');
        setIsDesktopApiReady(true);
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to initialize desktop API');
        console.warn('⚠️ [AppShell] Desktop API initialization failed:', err.message);
        
        // In browser mode, we still allow the app to continue
        // but without desktop features
        setIsDesktopApiReady(true); // Allow fallback to browser mode
      }
    };

    initDesktopApi();
  }, [onInitError]);

  /**
   * Handle initialization complete
   */
  useEffect(() => {
    if (!isLoading && !hasInitialized.current) {
      hasInitialized.current = true;
      console.log('🎉 [AppShell] Initialization complete! Starting fade-out...');
      
      // Start fade-out animation
      setIsFadingOut(true);

      // Wait for fade-out to complete, then stop fading and show workspace
      const timer = setTimeout(() => {
        console.log('✅ [AppShell] Fade-out complete, showing workspace');
        setIsFadingOut(false); // Clear fade-out flag so workspace becomes visible
        onInitComplete?.();
      }, 600); // Match the CSS transition duration

      return () => clearTimeout(timer);
    }
  }, [isLoading, onInitComplete]);

  /**
   * Update status text based on what's still loading
   */
  useEffect(() => {
    if (!isLayoutReady && !isDesktopApiReady) {
      setCurrentStatusText('Initializing application...');
    } else if (!isLayoutReady) {
      setCurrentStatusText('Loading workspace layout...');
    } else if (!isDesktopApiReady) {
      setCurrentStatusText('Connecting to desktop bus...');
    } else {
      setCurrentStatusText('Ready!');
    }
  }, [isLayoutReady, isDesktopApiReady]);

  // Show error state if initialization failed critically
  if (initError) {
    return (
      <div style={{ 
        padding: '40px', 
        fontFamily: 'Arial', 
        color: '#d32f2f',
        maxWidth: '600px',
        margin: '40px auto',
      }}>
        <h1>Initialization Error</h1>
        <p>{initError.message}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Reload Application
        </button>
      </div>
    );
  }

  // Render splash or workspace
  const SplashComponent = CustomSplash || SplashScreen;

  // Show initial splash screen while checking authentication or during minimum display time
  if (currentUser === undefined || showInitialSplash) {
    return (
      <SplashComponent
        branding={branding}
        statusText="Initializing Fin Desktop..."
        isVisible={true}
      />
    );
  }

  // Show login screen if not authenticated (after splash)
  if (currentUser === null) {
    return (
      <LoginScreen
        authProvider={authProvider}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // User is authenticated, proceed with normal initialization flow
  return (
    <>
      {/* Show splash while loading or during fade-out */}
      {(isLoading || isFadingOut) && (
        <SplashComponent
          branding={branding}
          statusText={currentStatusText}
          isVisible={isLoading} // Controls fade-out
        />
      )}

      {/* Render workspace when ready and fade-out is complete */}
      {!isLoading && !isFadingOut && (
        <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
          {/* TODO: Pass user and logout handler to workspace via context or props */}
          <WorkspaceShell />
        </div>
      )}
    </>
  );
};

export default AppShell;
