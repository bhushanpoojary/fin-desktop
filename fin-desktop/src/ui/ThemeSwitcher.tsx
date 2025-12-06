/**
 * Theme Switcher Component
 * 
 * A UI control for switching between available themes at runtime.
 * Can be placed in app header, toolbar, or settings menu.
 * 
 * ## Usage
 * 
 * ```tsx
 * import { ThemeSwitcher } from './ui/ThemeSwitcher';
 * 
 * // In your app header/toolbar:
 * function AppHeader() {
 *   return (
 *     <header>
 *       <h1>FinDesktop</h1>
 *       <ThemeSwitcher />
 *     </header>
 *   );
 * }
 * ```
 * 
 * ## Styling
 * 
 * The component uses CSS variables for styling, so it automatically adapts
 * to the current theme. You can customize appearance via CSS:
 * 
 * ```css
 * .theme-switcher {
 *   // Your custom styles
 * }
 * ```
 */

import { useTheme } from '../core/theme/ThemeManager';
import type { Theme } from '../core/theme/ThemeTypes';

/**
 * Theme Switcher Props
 */
interface ThemeSwitcherProps {
  /**
   * Display variant
   * - "dropdown": Classic select dropdown
   * - "buttons": Segmented button group
   * @default "dropdown"
   */
  variant?: 'dropdown' | 'buttons';

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Show theme display name instead of theme name
   * @default true
   */
  showDisplayName?: boolean;

  /**
   * Callback when theme changes (optional)
   */
  onThemeChange?: (theme: Theme) => void;
}

/**
 * Theme Switcher Component
 * 
 * Renders a control for switching between available themes.
 * Automatically syncs with ThemeManager context.
 * 
 * Place this component in:
 * - App header/toolbar for easy access
 * - Settings menu/modal
 * - User preferences panel
 * 
 * @example
 * ```tsx
 * // Simple dropdown in header
 * <ThemeSwitcher />
 * 
 * // Button group variant
 * <ThemeSwitcher variant="buttons" />
 * 
 * // With change callback
 * <ThemeSwitcher onThemeChange={(theme) => console.log('Theme changed:', theme.name)} />
 * ```
 */
export function ThemeSwitcher({
  variant = 'dropdown',
  className = '',
  showDisplayName = true,
  onThemeChange,
}: ThemeSwitcherProps) {
  const { theme, setTheme, availableThemes } = useTheme();

  const handleThemeChange = (themeName: string) => {
    setTheme(themeName);
    
    // Call optional callback
    if (onThemeChange) {
      const newTheme = availableThemes.find(t => t.name === themeName);
      if (newTheme) {
        onThemeChange(newTheme);
      }
    }
  };

  const getThemeLabel = (t: Theme): string => {
    return showDisplayName && t.displayName ? t.displayName : t.name;
  };

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <div className={`theme-switcher theme-switcher--dropdown ${className}`}>
        <label htmlFor="theme-select" className="theme-switcher__label">
          Theme:
        </label>
        <select
          id="theme-select"
          className="theme-switcher__select"
          value={theme.name}
          onChange={(e) => handleThemeChange(e.target.value)}
          aria-label="Select theme"
        >
          {availableThemes.map((t) => (
            <option key={t.name} value={t.name}>
              {getThemeLabel(t)}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Button group variant
  if (variant === 'buttons') {
    return (
      <div 
        className={`theme-switcher theme-switcher--buttons ${className}`}
        role="radiogroup"
        aria-label="Select theme"
      >
        {availableThemes.map((t) => (
          <button
            key={t.name}
            className={`theme-switcher__button ${
              t.name === theme.name ? 'theme-switcher__button--active' : ''
            }`}
            onClick={() => handleThemeChange(t.name)}
            aria-pressed={t.name === theme.name}
            aria-label={`Switch to ${getThemeLabel(t)} theme`}
          >
            {getThemeLabel(t)}
          </button>
        ))}
      </div>
    );
  }

  return null;
}

/**
 * Compact Theme Switcher (icon-only version)
 * 
 * A minimal theme switcher that cycles through themes with a single button.
 * Useful when space is limited (e.g., in a compact toolbar).
 * 
 * @example
 * ```tsx
 * <CompactThemeSwitcher />
 * ```
 */
export function CompactThemeSwitcher({ className = '' }: { className?: string }) {
  const { theme, setTheme, availableThemes } = useTheme();

  const cycleTheme = () => {
    const currentIndex = availableThemes.findIndex(t => t.name === theme.name);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    setTheme(availableThemes[nextIndex].name);
  };

  const getNextThemeName = (): string => {
    const currentIndex = availableThemes.findIndex(t => t.name === theme.name);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    const nextTheme = availableThemes[nextIndex];
    return nextTheme.displayName || nextTheme.name;
  };

  return (
    <button
      className={`theme-switcher theme-switcher--compact ${className}`}
      onClick={cycleTheme}
      aria-label={`Current theme: ${theme.displayName || theme.name}. Click to switch to ${getNextThemeName()}`}
      title={`Switch to ${getNextThemeName()}`}
    >
      <span className="theme-switcher__icon">🎨</span>
      <span className="theme-switcher__text">
        {theme.displayName || theme.name}
      </span>
    </button>
  );
}

/**
 * Default styles for ThemeSwitcher
 * 
 * Add these to your global CSS or import them in your app:
 * 
 * ```css
 * .theme-switcher {
 *   display: inline-flex;
 *   align-items: center;
 *   gap: 0.5rem;
 * }
 * 
 * .theme-switcher__label {
 *   font-size: 0.875rem;
 *   color: var(--fd-text-secondary, var(--fd-text));
 *   margin-right: 0.25rem;
 * }
 * 
 * .theme-switcher__select {
 *   padding: 0.375rem 0.75rem;
 *   background: var(--fd-surface);
 *   color: var(--fd-text);
 *   border: 1px solid var(--fd-border);
 *   border-radius: var(--fd-radius);
 *   font-size: 0.875rem;
 *   cursor: pointer;
 *   transition: border-color 0.2s;
 * }
 * 
 * .theme-switcher__select:hover {
 *   border-color: var(--fd-primary);
 * }
 * 
 * .theme-switcher__select:focus {
 *   outline: none;
 *   border-color: var(--fd-primary);
 *   box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
 * }
 * 
 * .theme-switcher--buttons {
 *   display: inline-flex;
 *   gap: 0.25rem;
 *   padding: 0.25rem;
 *   background: var(--fd-surface);
 *   border-radius: var(--fd-radius);
 * }
 * 
 * .theme-switcher__button {
 *   padding: 0.375rem 0.75rem;
 *   background: transparent;
 *   color: var(--fd-text);
 *   border: none;
 *   border-radius: calc(var(--fd-radius) - 2px);
 *   font-size: 0.875rem;
 *   cursor: pointer;
 *   transition: all 0.2s;
 * }
 * 
 * .theme-switcher__button:hover {
 *   background: var(--fd-bg);
 * }
 * 
 * .theme-switcher__button--active {
 *   background: var(--fd-primary);
 *   color: white;
 * }
 * 
 * .theme-switcher--compact {
 *   display: inline-flex;
 *   align-items: center;
 *   gap: 0.375rem;
 *   padding: 0.375rem 0.75rem;
 *   background: var(--fd-surface);
 *   color: var(--fd-text);
 *   border: 1px solid var(--fd-border);
 *   border-radius: var(--fd-radius);
 *   font-size: 0.875rem;
 *   cursor: pointer;
 *   transition: all 0.2s;
 * }
 * 
 * .theme-switcher--compact:hover {
 *   border-color: var(--fd-primary);
 *   background: var(--fd-bg);
 * }
 * 
 * .theme-switcher__icon {
 *   font-size: 1rem;
 * }
 * 
 * .theme-switcher__text {
 *   font-weight: 500;
 * }
 * ```
 */
