/**
 * Theme Engine Test Page
 * 
 * A comprehensive test page to demonstrate and verify all theme engine features.
 * Access via: http://localhost:5173/?test=theme
 */

import { ThemeProvider, useTheme } from '../core/theme/ThemeManager';
import { ThemeSwitcher, CompactThemeSwitcher } from '../ui/ThemeSwitcher';
import { finDesktopConfig } from '../config/FinDesktopConfig';
import '../ui/ThemeSwitcher.css';
import './ThemeTest.css';

export function ThemeTestApp() {
  if (!finDesktopConfig.themes) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Error: No themes configured</h1>
        <p>Please ensure finDesktopConfig.themes is set.</p>
      </div>
    );
  }

  return (
    <ThemeProvider 
      themes={finDesktopConfig.themes} 
      initialThemeName="dark"
      storageKey="finDesktop.theme.test"
    >
      <ThemeTestContent />
    </ThemeProvider>
  );
}

function ThemeTestContent() {
  const { theme, availableThemes, setTheme } = useTheme();

  return (
    <div className="theme-test-app">
      {/* Professional Header */}
      <header className="theme-pro-header">
        <div className="theme-pro-container">
          <div className="theme-pro-title">
            <div className="theme-icon-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
            </div>
            <div>
              <h1>Theme Customization</h1>
              <p>Personalize your workspace appearance</p>
            </div>
          </div>
          
          <div className="theme-current-badge">
            <span className="theme-badge-label">Active Theme</span>
            <span className="theme-badge-value">{theme.displayName || theme.name}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="theme-pro-content">
        <div className="theme-pro-container">
          
          {/* Theme Gallery */}
          <section className="theme-gallery-section">
            <h2 className="section-title">Choose Your Theme</h2>
            <p className="section-subtitle">Select a theme to instantly update your workspace appearance</p>
            
            <div className="theme-gallery">
              {availableThemes.map((t) => (
                <button
                  key={t.name}
                  className={`theme-card ${t.name === theme.name ? 'theme-card-active' : ''}`}
                  onClick={() => setTheme(t.name)}
                >
                  <div className="theme-card-preview">
                    <div className="preview-grid">
                      <div className="preview-block" style={{ background: t.palette.background }} />
                      <div className="preview-block" style={{ background: t.palette.surface }} />
                      <div className="preview-block" style={{ background: t.palette.primary }} />
                      <div className="preview-block" style={{ background: t.palette.accent }} />
                    </div>
                  </div>
                  
                  <div className="theme-card-content">
                    <h3 className="theme-card-title">
                      {t.displayName || t.name}
                      {t.name === theme.name && (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="check-icon">
                          <path d="M7.629 14.566l-4.243-4.243 1.414-1.414 2.829 2.829 6.364-6.364 1.414 1.414z"/>
                        </svg>
                      )}
                    </h3>
                    {t.metadata?.description && (
                      <p className="theme-card-desc">{t.metadata.description}</p>
                    )}
                    <div className="theme-card-meta">
                      <span>{t.density.toUpperCase()}</span>
                      <span>•</span>
                      <span>{t.borderRadius}px radius</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Preview Sections */}
          <section className="preview-section">
            <h2 className="section-title">Preview</h2>
            <p className="section-subtitle">See how UI components look with your selected theme</p>
            
            <div className="preview-grid-layout">
              <ColorPaletteCompact />
              <ComponentPreview />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

function ColorPaletteCompact() {
  const { theme } = useTheme();

  const colors = [
    { name: 'Primary', value: theme.palette.primary },
    { name: 'Accent', value: theme.palette.accent },
    { name: 'Success', value: theme.palette.success },
    { name: 'Danger', value: theme.palette.danger },
    { name: 'Text', value: theme.palette.text },
    { name: 'Surface', value: theme.palette.surface },
  ];

  return (
    <div className="compact-palette">
      <h3 className="compact-title">Color Palette</h3>
      <div className="palette-grid">
        {colors.map((color) => (
          <div key={color.name} className="palette-item">
            <div className="palette-swatch" style={{ background: color.value }} />
            <span className="palette-name">{color.name}</span>
            <code className="palette-value">{color.value}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComponentPreview() {
  return (
    <div className="component-preview">
      <h3 className="compact-title">Components</h3>
      
      <div className="preview-group">
        <label className="preview-label">Buttons</label>
        <div className="button-row">
          <button className="btn btn-primary">Primary</button>
          <button className="btn btn-secondary">Secondary</button>
          <button className="btn btn-danger">Delete</button>
        </div>
      </div>

      <div className="preview-group">
        <label className="preview-label">Input Field</label>
        <input 
          type="text" 
          className="input" 
          placeholder="Enter text..."
          defaultValue="Sample input"
        />
      </div>

      <div className="preview-group">
        <label className="preview-label">Card Component</label>
        <div className="preview-card">
          <h4>Card Title</h4>
          <p>This card demonstrates how content containers look with the current theme.</p>
          <button className="btn btn-sm btn-primary">Action</button>
        </div>
      </div>

      <div className="preview-group">
        <label className="preview-label">Alerts</label>
        <div className="alert alert-success">Operation completed successfully</div>
        <div className="alert alert-danger">An error occurred</div>
      </div>
    </div>
  );
}

export default ThemeTestApp;

// Unused legacy components below - kept for reference
/* eslint-disable @typescript-eslint/no-unused-vars */

function ColorPalette() {
  const { theme } = useTheme();

  const colors = [
    { name: 'Background', value: theme.palette.background, var: '--fd-bg' },
    { name: 'Surface', value: theme.palette.surface, var: '--fd-surface' },
    { name: 'Primary', value: theme.palette.primary, var: '--fd-primary' },
    { name: 'Accent', value: theme.palette.accent, var: '--fd-accent' },
    { name: 'Text', value: theme.palette.text, var: '--fd-text' },
    { name: 'Danger', value: theme.palette.danger, var: '--fd-danger' },
    { name: 'Success', value: theme.palette.success, var: '--fd-success' },
    { name: 'Border', value: theme.palette.border, var: '--fd-border' },
  ];

  return (
    <section className="theme-test-section" id="colors">
      <h2>Color Palette</h2>
      <div className="color-grid">
        {colors.map((color) => (
          <div key={color.name} className="color-card">
            <div 
              className="color-swatch" 
              style={{ backgroundColor: color.value }}
            />
            <div className="color-info">
              <strong>{color.name}</strong>
              <code>{color.value}</code>
              <code className="color-var">{color.var}</code>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ComponentShowcase() {
  return (
    <section className="theme-test-section" id="components">
      <h2>Component Showcase</h2>

      {/* Buttons */}
      <div className="showcase-group">
        <h3>Buttons</h3>
        <div className="button-group">
          <button className="btn btn-primary">Primary</button>
          <button className="btn btn-secondary">Secondary</button>
          <button className="btn btn-danger">Danger</button>
          <button className="btn btn-success">Success</button>
        </div>
      </div>

      {/* Cards */}
      <div className="showcase-group">
        <h3>Cards</h3>
        <div className="card-grid">
          <div className="card">
            <h4 className="card-title">Card Title</h4>
            <p className="card-content">
              This is a card component using CSS variables for theming.
              It automatically adapts to theme changes.
            </p>
            <button className="btn btn-primary btn-sm">Action</button>
          </div>
          <div className="card card-accent">
            <h4 className="card-title">Accent Card</h4>
            <p className="card-content">
              This card uses the accent color for highlighting.
            </p>
            <button className="btn btn-secondary btn-sm">Learn More</button>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="showcase-group">
        <h3>Form Controls</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Text Input</label>
            <input 
              type="text" 
              className="input" 
              placeholder="Enter text..." 
            />
          </div>
          <div className="form-group">
            <label>Select</label>
            <select className="input">
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="showcase-group">
        <h3>Alerts</h3>
        <div className="alert alert-info">
          <strong>Info:</strong> This is an informational message.
        </div>
        <div className="alert alert-success">
          <strong>Success:</strong> Operation completed successfully!
        </div>
        <div className="alert alert-warning">
          <strong>Warning:</strong> Please review this action.
        </div>
        <div className="alert alert-danger">
          <strong>Error:</strong> Something went wrong.
        </div>
      </div>

      {/* Badges */}
      <div className="showcase-group">
        <h3>Badges</h3>
        <div className="badge-group">
          <span className="badge">Default</span>
          <span className="badge badge-primary">Primary</span>
          <span className="badge badge-success">Success</span>
          <span className="badge badge-danger">Danger</span>
        </div>
      </div>
    </section>
  );
}

function DensityDemo() {
  const { theme } = useTheme();
  
  return (
    <section className="theme-test-section" id="density">
      <h2>Density: {theme.density.toUpperCase()}</h2>
      <p className="section-description">
        Density controls spacing throughout the UI. Current multiplier: {
          theme.density === 'sd' ? '0.75x (Compact)' :
          theme.density === 'hd' ? '1.0x (Balanced)' :
          '1.25x (Spacious)'
        }
      </p>

      <div className="density-comparison">
        <div className="density-card">
          <h4>Compact (SD)</h4>
          <div className="density-demo density-sd">
            <div className="demo-item">Item 1</div>
            <div className="demo-item">Item 2</div>
            <div className="demo-item">Item 3</div>
          </div>
        </div>

        <div className="density-card">
          <h4>Balanced (HD)</h4>
          <div className="density-demo density-hd">
            <div className="demo-item">Item 1</div>
            <div className="demo-item">Item 2</div>
            <div className="demo-item">Item 3</div>
          </div>
        </div>

        <div className="density-card">
          <h4>Spacious (UHD)</h4>
          <div className="density-demo density-uhd">
            <div className="demo-item">Item 1</div>
            <div className="demo-item">Item 2</div>
            <div className="demo-item">Item 3</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ThemeList({ themes }: { themes: any[] }) {
  const { theme: currentTheme, setTheme } = useTheme();

  return (
    <section className="theme-test-section" id="themes">
      <h2>Available Themes ({themes.length})</h2>
      
      <div className="theme-switcher-demo">
        <h3>Switcher Variants</h3>
        
        <div className="switcher-variant">
          <h4>Dropdown</h4>
          <ThemeSwitcher variant="dropdown" />
        </div>

        <div className="switcher-variant">
          <h4>Button Group</h4>
          <ThemeSwitcher variant="buttons" />
        </div>

        <div className="switcher-variant">
          <h4>Compact</h4>
          <CompactThemeSwitcher />
        </div>
      </div>

      <div className="theme-grid">
        {themes.map((t) => (
          <div 
            key={t.name} 
            className={`theme-preview-card ${t.name === currentTheme.name ? 'active' : ''}`}
            onClick={() => setTheme(t.name)}
          >
            <div className="theme-preview-header">
              <h4>{t.displayName || t.name}</h4>
              {t.name === currentTheme.name && (
                <span className="badge badge-primary">Active</span>
              )}
            </div>

            <div className="theme-preview-colors">
              <div className="preview-color" style={{ background: t.palette.background }} />
              <div className="preview-color" style={{ background: t.palette.surface }} />
              <div className="preview-color" style={{ background: t.palette.primary }} />
              <div className="preview-color" style={{ background: t.palette.accent }} />
            </div>

            <div className="theme-preview-info">
              <span>Density: {t.density.toUpperCase()}</span>
              <span>Radius: {t.borderRadius}px</span>
            </div>

            {t.metadata?.description && (
              <p className="theme-preview-desc">{t.metadata.description}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
