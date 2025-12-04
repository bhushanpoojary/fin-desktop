# Launcher Feature

A modern, searchable app launcher with category filtering and keyboard-friendly UX for the Fin Desktop shell.

## Overview

The Launcher provides a "desktop OS launcher" experience, allowing users to browse, search, and launch apps from the platform catalog.

## Components

### `Launcher`

Main launcher component that displays the app catalog grid.

**Props:**
- `onLaunch?: (app: AppDefinition) => void` - Callback when user launches an app

**Features:**
- Loads apps from config provider via `useAppsCatalog` hook
- Live search across app title, id, and tags
- Category filtering
- Responsive grid layout
- Loading and error states
- Keyboard navigation support (Tab, Enter, Space)
- Shows app count with search feedback

**Usage:**
```tsx
import { Launcher } from './features/launcher';

function App() {
  const handleLaunch = (app: AppDefinition) => {
    console.log("Launch", app.id);
    // Open app window, navigate to route, etc.
  };

  return <Launcher onLaunch={handleLaunch} />;
}
```

### `LauncherSearchBox`

Search input and category dropdown component.

**Props:**
- `searchText: string` - Current search text
- `onSearchTextChange: (value: string) => void` - Search text change handler
- `category: string` - Current selected category (empty string = "All")
- `onCategoryChange: (value: string) => void` - Category change handler
- `categories: string[]` - List of available categories

**Features:**
- Search input with autofocus
- ESC key to clear search
- Category dropdown with "All" option
- Accessible form controls

### `useAppsCatalog` Hook

React hook to load apps from the config provider.

**Returns:** `AppsCatalogState`
```typescript
{
  apps: AppDefinition[];      // All available apps
  categories: string[];       // Unique categories (sorted)
  isLoading: boolean;         // Loading state
  error?: string;             // Error message if load failed
}
```

**Features:**
- Lazy loads apps on mount
- Extracts and deduplicates categories
- Handles loading/error states
- Cleanup on unmount

**Usage:**
```tsx
import { useAppsCatalog } from './features/launcher';

function MyComponent() {
  const { apps, categories, isLoading, error } = useAppsCatalog();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{apps.length} apps available</div>;
}
```

## Keyboard Support

- **Tab** - Navigate between search box, category dropdown, and app tiles
- **Enter/Space** - Launch focused app
- **ESC** (in search box) - Clear search text

## Filtering Logic

Apps are filtered by:
1. **Category** (if selected) - Exact match on `app.category`
2. **Search text** (case-insensitive substring match) across:
   - `app.title`
   - `app.id`
   - `app.tags[]` (if present)

## Styling

The launcher uses `Launcher.css` with:
- Responsive grid (auto-fill with min 160px columns)
- Hover effects on app tiles
- Focus states for keyboard navigation
- Modern rounded corners and shadows
- Gradient placeholder icons for apps without `iconUrl`
- Mobile-responsive breakpoints

## App Icon Handling

- If `app.iconUrl` is provided → Display as `<img>`
- If no `iconUrl` → Show gradient circle with first letter of title

## Future Enhancements

- Recent/favorite apps section
- Drag and drop to customize order
- Grid vs list view toggle
- Advanced search (AND/OR operators)
- Search history
- App ratings/usage tracking
- Keyboard shortcuts (e.g., Cmd+K to focus search)
