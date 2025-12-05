/**
 * FinDesktop Application Initialization Example
 * 
 * This file demonstrates how to initialize FinDesktop with your custom configuration.
 * Copy this pattern to your main application entry point.
 */

import { 
  AuthFramework, 
  ThemeEngine, 
  NotificationCenter,
  WindowManager,
  LayoutManager,
} from './components';

import { finDesktopConfig } from '../config/FinDesktopConfig';

/**
 * Initialize all FinDesktop core systems with your configured providers
 */
export async function initializeFinDesktop() {
  console.log('🚀 Initializing FinDesktop...');

  try {
    // Initialize Authentication
    const authFramework = new AuthFramework();
    await authFramework.initialize(finDesktopConfig.authProvider);
    console.log('✅ Auth initialized');

    // Initialize Theme Engine
    const themeEngine = new ThemeEngine();
    await themeEngine.initialize(finDesktopConfig.themeProvider);
    console.log('✅ Theme engine initialized');

    // Initialize Notification Center
    const notificationCenter = new NotificationCenter();
    await notificationCenter.initialize(finDesktopConfig.notificationProvider);
    console.log('✅ Notification center initialized');

    // Initialize Window Manager
    const windowManager = new WindowManager();
    await windowManager.initialize();
    console.log('✅ Window manager initialized');

    // Initialize Layout Manager
    const layoutManager = new LayoutManager();
    await layoutManager.initialize();
    console.log('✅ Layout manager initialized');

    // Apply branding
    const branding = finDesktopConfig.branding;
    document.title = branding.getProductName();
    console.log(`✅ Branding applied: ${branding.getProductName()}`);

    console.log('🎉 FinDesktop initialized successfully!');

    return {
      authFramework,
      themeEngine,
      notificationCenter,
      windowManager,
      layoutManager,
      branding,
    };
  } catch (error) {
    console.error('❌ Failed to initialize FinDesktop:', error);
    throw error;
  }
}

/**
 * Example usage in your main React component
 */
export async function bootstrapApp() {
  const findesktop = await initializeFinDesktop();

  // Now you can use the initialized systems
  
  // Check authentication
  if (findesktop.authFramework.isAuthenticated()) {
    const user = findesktop.authFramework.getCurrentUser();
    console.log('User logged in:', user?.displayName);
  }

  // Show a welcome notification
  await findesktop.notificationCenter.success(
    `Welcome to ${findesktop.branding.getProductName()}!`
  );

  // Get current theme
  const theme = findesktop.themeEngine.getCurrentTheme();
  console.log('Active theme:', theme?.name);

  return findesktop;
}
