/**
 * Theme Customization Page
 * 
 * A modern, professional theme customization interface with:
 * - 2-column responsive layout
 * - Interactive theme cards with hover effects
 * - Live component preview
 * - Full keyboard accessibility
 * 
 * Access via: http://localhost:5173/?test=theme
 */

import { useState } from 'react';
import { ThemeProvider, useTheme } from '../core/theme/ThemeManager';
import { finDesktopConfig } from '../config/FinDesktopConfig';
import type { Theme } from '../core/theme/ThemeTypes';
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
    <div className="theme-page">
      {/* Header */}
      <header className="theme-header">
        <div className="theme-header-content">
          <div className="theme-header-title">
            <div className="theme-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
            </div>
            <div>
              <h1>Theme Customization</h1>
              <p>Personalize your workspace appearance</p>
            </div>
          </div>
          
          <div className="theme-badge">
            <span className="theme-badge-label">Active</span>
            <span className="theme-badge-value">{theme.displayName || theme.name}</span>
          </div>
        </div>
      </header>

      {/* Main Content - 2 Column Layout */}
      <main className="theme-main">
        <div className="theme-container">
          <div className="theme-layout">
            {/* Left Column: Theme Selector */}
            <section className="theme-selector-section">
              <div className="section-header">
                <h2 className="section-title">Choose Your Theme</h2>
                <p className="section-subtitle">
                  Select a theme to instantly transform your workspace
                </p>
              </div>

              <div className="theme-grid">
                {availableThemes.map((t) => (
                  <ThemeCard
                    key={t.name}
                    theme={t}
                    isActive={t.name === theme.name}
                    onSelect={() => setTheme(t.name)}
                  />
                ))}
              </div>
            </section>

            {/* Right Column: Live Preview */}
            <section className="theme-preview-section">
              <div className="section-header">
                <h2 className="section-title">Live Preview</h2>
                <p className="section-subtitle">
                  See how components look with the selected theme
                </p>
              </div>

              <PreviewPanel />
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * ThemeCard Component
 * 
 * Displays a theme option with:
 * - Color swatches
 * - Theme name and description
 * - Metadata (density, border radius)
 * - Active state indicator
 * - Hover effects
 * - Keyboard accessibility
 */
interface ThemeCardProps {
  theme: Theme;
  isActive: boolean;
  onSelect: () => void;
}

function ThemeCard({ theme, isActive, onSelect }: ThemeCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <button
      className={`theme-card ${isActive ? 'theme-card-active' : ''}`}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`Select ${theme.displayName || theme.name} theme`}
      aria-pressed={isActive}
    >
      {/* Color Swatches */}
      <ThemeSwatch palette={theme.palette} />

      {/* Theme Info */}
      <div className="theme-card-body">
        <div className="theme-card-header">
          <h3 className="theme-card-title">{theme.displayName || theme.name}</h3>
          {isActive && (
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              className="theme-check-icon"
              aria-hidden="true"
            >
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
            </svg>
          )}
        </div>

        {theme.metadata?.description && (
          <p className="theme-card-description">{theme.metadata.description}</p>
        )}

        <div className="theme-card-meta">
          <span className="meta-item">{theme.density.toUpperCase()}</span>
          <span className="meta-divider">•</span>
          <span className="meta-item">{theme.borderRadius}px radius</span>
        </div>
      </div>
    </button>
  );
}

/**
 * ThemeSwatch Component
 * 
 * Displays a grid of color swatches from the theme palette
 */
interface ThemeSwatchProps {
  palette: Theme['palette'];
}

function ThemeSwatch({ palette }: ThemeSwatchProps) {
  const swatchColors = [
    palette.background,
    palette.surface,
    palette.primary,
    palette.accent,
  ];

  return (
    <div className="theme-swatch">
      {swatchColors.map((color, index) => (
        <div
          key={index}
          className="theme-swatch-color"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

/**
 * PreviewPanel Component
 * 
 * Displays live preview of UI components using current theme:
 * - Buttons (Primary, Secondary, Danger)
 * - Input fields
 * - Cards
 * - Alerts
 */
function PreviewPanel() {
  const [inputValue, setInputValue] = useState('Sample input text');

  return (
    <div className="preview-panel">
      {/* Buttons Preview */}
      <div className="preview-section">
        <label className="preview-label">Buttons</label>
        <div className="preview-buttons">
          <button className="preview-btn preview-btn-primary">Primary Button</button>
          <button className="preview-btn preview-btn-secondary">Secondary</button>
          <button className="preview-btn preview-btn-danger">Delete</button>
        </div>
      </div>

      {/* Input Field Preview */}
      <div className="preview-section">
        <label className="preview-label" htmlFor="preview-input">
          Input Field
        </label>
        <input
          id="preview-input"
          type="text"
          className="preview-input"
          placeholder="Enter text..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </div>

      {/* Card Preview */}
      <div className="preview-section">
        <label className="preview-label">Card Component</label>
        <div className="preview-card">
          <h4 className="preview-card-title">Sample Card</h4>
          <p className="preview-card-text">
            This card component demonstrates how content containers adapt to your selected theme.
            All colors, spacing, and borders update dynamically.
          </p>
          <button className="preview-btn preview-btn-primary preview-btn-sm">
            Card Action
          </button>
        </div>
      </div>

      {/* Alerts Preview */}
      <div className="preview-section">
        <label className="preview-label">Alert Messages</label>
        <div className="preview-alerts">
          <div className="preview-alert preview-alert-success">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span>Operation completed successfully</span>
          </div>
          <div className="preview-alert preview-alert-error">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <span>An error occurred during processing</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThemeTestApp;
