/**
 * Theme Engine Integration Example
 * 
 * This file demonstrates how to integrate the theme engine into your FinDesktop app.
 * Copy the relevant sections into your actual App.tsx or main entry point.
 */

import React from 'react';
import { ThemeProvider } from './core/theme/ThemeManager';
import { ThemeSwitcher, CompactThemeSwitcher } from './ui/ThemeSwitcher';
import { finDesktopConfig } from './config/FinDesktopConfig';

/**
 * Example 1: Basic Integration
 * 
 * Wrap your app with ThemeProvider at the root level.
 */
export function AppWithThemeBasic() {
  return (
    <ThemeProvider 
      themes={finDesktopConfig.themes!} 
      initialThemeName="dark"
    >
      <YourApp />
    </ThemeProvider>
  );
}

/**
 * Example 2: With Theme Switcher in Header
 */
export function AppWithThemeSwitcher() {
  return (
    <ThemeProvider 
      themes={finDesktopConfig.themes!}
      initialThemeName="dark"
    >
      <div className="app">
        <Header />
        <MainContent />
      </div>
    </ThemeProvider>
  );
}

function Header() {
  return (
    <header className="app-header">
      <h1>FinDesktop</h1>
      
      {/* Add theme switcher to header */}
      <div className="header-actions">
        <ThemeSwitcher variant="dropdown" />
      </div>
    </header>
  );
}

/**
 * Example 3: Using Theme in Components
 */
import { useTheme } from './core/theme/ThemeManager';

function ThemedComponent() {
  const { theme, setTheme, availableThemes } = useTheme();

  return (
    <div className="themed-component">
      <h2>Current Theme: {theme.displayName || theme.name}</h2>
      
      {/* Access theme palette directly */}
      <div 
        style={{
          background: theme.palette.primary,
          color: 'white',
          padding: '1rem',
          borderRadius: `${theme.borderRadius}px`,
        }}
      >
        Primary Color Preview
      </div>

      {/* Show density info */}
      <p>Density: {theme.density}</p>
      
      {/* List available themes */}
      <div className="theme-list">
        <h3>Available Themes:</h3>
        {availableThemes.map(t => (
          <button
            key={t.name}
            onClick={() => setTheme(t.name)}
            className={t.name === theme.name ? 'active' : ''}
          >
            {t.displayName || t.name}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Example 4: Using CSS Variables (Recommended)
 * 
 * This is the preferred approach - use CSS variables instead of
 * accessing theme object directly.
 */
function ComponentWithCSSVariables() {
  return (
    <div className="card">
      <h3 className="card__title">Using CSS Variables</h3>
      <p className="card__content">
        This component automatically adapts to theme changes
        via CSS variables without re-rendering.
      </p>
      <button className="button-primary">Primary Action</button>
      <button className="button-secondary">Secondary Action</button>
    </div>
  );
}

/**
 * CSS for the above component:
 * 
 * .card {
 *   background-color: var(--fd-surface);
 *   border: 1px solid var(--fd-border);
 *   border-radius: var(--fd-radius);
 *   padding: calc(1rem * var(--fd-density-spacing));
 *   color: var(--fd-text);
 * }
 * 
 * .card__title {
 *   font-size: 1.125rem;
 *   font-weight: 600;
 *   color: var(--fd-text);
 *   margin-bottom: calc(0.5rem * var(--fd-density-spacing));
 * }
 * 
 * .card__content {
 *   font-size: 0.875rem;
 *   color: var(--fd-text-secondary);
 *   line-height: 1.5;
 * }
 * 
 * .button-primary {
 *   padding: calc(0.5rem * var(--fd-density-spacing)) calc(1rem * var(--fd-density-spacing));
 *   background-color: var(--fd-primary);
 *   color: white;
 *   border: none;
 *   border-radius: var(--fd-radius);
 *   cursor: pointer;
 * }
 * 
 * .button-secondary {
 *   padding: calc(0.5rem * var(--fd-density-spacing)) calc(1rem * var(--fd-density-spacing));
 *   background-color: var(--fd-surface);
 *   color: var(--fd-text);
 *   border: 1px solid var(--fd-border);
 *   border-radius: var(--fd-radius);
 *   cursor: pointer;
 * }
 */

/**
 * Example 5: Settings Panel with Theme Switcher
 */
function SettingsPanel() {
  const { theme } = useTheme();

  return (
    <div className="settings-panel">
      <section className="settings-section">
        <h3>Appearance</h3>
        
        <div className="setting-item">
          <label>Theme</label>
          <ThemeSwitcher variant="buttons" showDisplayName={true} />
        </div>

        <div className="setting-item">
          <label>Density</label>
          <p className="setting-value">
            {theme.density.toUpperCase()} 
            ({theme.density === 'sd' ? 'Compact' : 
              theme.density === 'hd' ? 'Balanced' : 'Spacious'})
          </p>
        </div>

        <div className="setting-item">
          <label>Border Radius</label>
          <p className="setting-value">{theme.borderRadius}px</p>
        </div>
      </section>
    </div>
  );
}

/**
 * Example 6: Compact Theme Switcher for Toolbar
 */
function Toolbar() {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <button>File</button>
        <button>Edit</button>
        <button>View</button>
      </div>
      
      <div className="toolbar-right">
        {/* Compact theme switcher takes minimal space */}
        <CompactThemeSwitcher />
      </div>
    </div>
  );
}

/**
 * Example 7: Theme Preview Component
 */
function ThemePreview({ themeName }: { themeName: string }) {
  const { themeRegistry } = useTheme();
  const previewTheme = themeRegistry[themeName];

  if (!previewTheme) return null;

  return (
    <div 
      className="theme-preview"
      style={{
        background: previewTheme.palette.background,
        border: `1px solid ${previewTheme.palette.border}`,
        borderRadius: `${previewTheme.borderRadius}px`,
        padding: '1rem',
      }}
    >
      <div style={{ 
        background: previewTheme.palette.surface,
        padding: '0.5rem',
        marginBottom: '0.5rem',
        borderRadius: `${previewTheme.borderRadius}px`,
      }}>
        <span style={{ color: previewTheme.palette.text }}>
          {previewTheme.displayName || previewTheme.name}
        </span>
      </div>
      
      <div className="color-swatches">
        <ColorSwatch color={previewTheme.palette.primary} label="Primary" />
        <ColorSwatch color={previewTheme.palette.accent} label="Accent" />
        <ColorSwatch color={previewTheme.palette.success} label="Success" />
        <ColorSwatch color={previewTheme.palette.danger} label="Danger" />
      </div>
    </div>
  );
}

function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="color-swatch">
      <div 
        className="color-swatch__color"
        style={{ 
          background: color,
          width: '40px',
          height: '40px',
          borderRadius: '4px',
        }}
      />
      <span className="color-swatch__label">{label}</span>
    </div>
  );
}

/**
 * Example 8: Conditional Styling Based on Theme
 */
function AdaptiveComponent() {
  const { theme } = useTheme();
  
  // Adjust behavior based on theme
  const isDarkTheme = theme.name.includes('dark') || 
                      theme.palette.background.startsWith('#0') ||
                      theme.palette.background.startsWith('#1');
  
  const isCompact = theme.density === 'sd';

  return (
    <div className={`adaptive-component ${isDarkTheme ? 'dark' : 'light'} ${isCompact ? 'compact' : ''}`}>
      {isCompact ? (
        <CompactView />
      ) : (
        <StandardView />
      )}
    </div>
  );
}

function CompactView() {
  return <div>Compact layout for sd density</div>;
}

function StandardView() {
  return <div>Standard layout for hd/uhd density</div>;
}

/**
 * Example 9: Theme Change Callback
 */
function AppWithThemeCallback() {
  const handleThemeChange = (newTheme: any) => {
    console.log('Theme changed to:', newTheme.name);
    
    // Track in analytics
    // analytics.track('theme_changed', { theme: newTheme.name });
    
    // Store in user preferences API
    // api.updateUserPreferences({ theme: newTheme.name });
  };

  return (
    <ThemeProvider 
      themes={finDesktopConfig.themes!}
      initialThemeName="dark"
    >
      <div className="app">
        <ThemeSwitcher onThemeChange={handleThemeChange} />
      </div>
    </ThemeProvider>
  );
}

/**
 * Example 10: Full App Structure
 */
function CompleteApp() {
  return (
    <ThemeProvider 
      themes={finDesktopConfig.themes!}
      initialThemeName="dark"
      storageKey="finDesktop.theme"
    >
      <div className="app-layout">
        <AppHeader />
        <AppSidebar />
        <AppMain />
      </div>
    </ThemeProvider>
  );
}

function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header__left">
        <h1 className="app-title">FinDesktop</h1>
      </div>
      <div className="app-header__right">
        <ThemeSwitcher variant="dropdown" />
      </div>
    </header>
  );
}

function AppSidebar() {
  const { theme } = useTheme();
  
  return (
    <aside className="app-sidebar">
      <nav className="sidebar-nav">
        <a href="/dashboard">Dashboard</a>
        <a href="/trading">Trading</a>
        <a href="/analytics">Analytics</a>
      </nav>
      
      <div className="sidebar-footer">
        <small>Density: {theme.density.toUpperCase()}</small>
      </div>
    </aside>
  );
}

function AppMain() {
  return (
    <main className="app-main">
      <ThemedComponent />
      <ComponentWithCSSVariables />
    </main>
  );
}

/**
 * Placeholder components
 */
function YourApp() {
  return <div>Your app content</div>;
}

function MainContent() {
  return <div>Main content</div>;
}
