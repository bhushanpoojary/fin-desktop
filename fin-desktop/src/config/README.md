# Config Provider System

A clean, type-safe abstraction for configuring apps and layouts in the Fin Desktop shell.

## Overview

The config system allows clients to swap their own config provider without touching core application code. The default implementation loads from static JSON files, but clients can implement their own provider (e.g., loading from a REST API, database, or custom source).

## Architecture

### Core Types (`types.ts`)

- **`AppDefinition`**: Defines an application with metadata (id, title, icon, category, tags, launch URL, window options)
- **`WorkspaceLayout`**: Defines a saved workspace layout with generic `data` field
- **`PlatformConfig`**: Container for apps and layouts

### Interface (`IConfigProvider.ts`)

All config providers must implement:
- `getPlatformConfig()`: Load complete platform configuration
- `getApps()`: Get list of available apps
- `getLayouts()`: Get saved workspace layouts
- `getLayoutById(id)`: Find specific layout by ID

### Default Implementation (`DemoConfigProvider.ts`)

Loads configuration from static JSON files:
- `/config/demo-apps.json` - App definitions
- `/config/demo-layouts.json` - Workspace layouts

Features:
- Lazy loading with caching
- Graceful handling of missing layouts file
- Type-safe JSON parsing

### Factory (`ConfigProviderFactory.ts`)

Central place to instantiate the correct provider:

```typescript
// Use default (demo) provider
const provider = ConfigProviderFactory.create();

// Use environment variable (VITE_CONFIG_PROVIDER)
// In .env: VITE_CONFIG_PROVIDER=remote
const provider = ConfigProviderFactory.create();

// Inject custom provider
const customProvider = new MyCustomProvider();
const provider = ConfigProviderFactory.create({ 
  customProvider 
});

// Explicitly specify kind
const provider = ConfigProviderFactory.create({ 
  kind: 'demo' 
});
```

## Usage Example

```typescript
import { ConfigProviderFactory } from './config/ConfigProviderFactory';
import type { AppDefinition } from './config/types';

// In your component or app initialization
const configProvider = ConfigProviderFactory.create();

// Load all apps
const apps: AppDefinition[] = await configProvider.getApps();

// Load complete config
const config = await configProvider.getPlatformConfig();
console.log(config.apps, config.layouts);

// Load specific layout
const layout = await configProvider.getLayoutById('trading-desk');
```

## Creating a Custom Provider

To implement your own config provider:

1. **Implement the interface:**

```typescript
import type { IConfigProvider } from './config/IConfigProvider';
import type { AppDefinition, WorkspaceLayout, PlatformConfig } from './config/types';

export class RemoteConfigProvider implements IConfigProvider {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async getPlatformConfig(): Promise<PlatformConfig> {
    const response = await fetch(`${this.apiUrl}/config`);
    return response.json();
  }

  async getApps(): Promise<AppDefinition[]> {
    const response = await fetch(`${this.apiUrl}/apps`);
    return response.json();
  }

  async getLayouts(): Promise<WorkspaceLayout[]> {
    const response = await fetch(`${this.apiUrl}/layouts`);
    return response.json();
  }

  async getLayoutById(id: string): Promise<WorkspaceLayout | undefined> {
    try {
      const response = await fetch(`${this.apiUrl}/layouts/${id}`);
      if (!response.ok) return undefined;
      return response.json();
    } catch {
      return undefined;
    }
  }
}
```

2. **Use your custom provider:**

```typescript
// Option A: Direct injection
import { ConfigProviderFactory } from './config/ConfigProviderFactory';
import { RemoteConfigProvider } from './providers/RemoteConfigProvider';

const customProvider = new RemoteConfigProvider('https://api.example.com');
const provider = ConfigProviderFactory.create({ customProvider });

// Option B: Extend the factory (modify ConfigProviderFactory.ts)
// Add your provider to the switch statement:
case "remote":
  return new RemoteConfigProvider(import.meta.env.VITE_API_URL);
```

3. **Set environment variable (optional):**

```bash
# .env or .env.local
VITE_CONFIG_PROVIDER=remote
VITE_API_URL=https://api.example.com
```

## JSON Schema

### demo-apps.json

```json
[
  {
    "id": "order-ticket",
    "title": "Order Ticket",
    "iconUrl": "/icons/order-ticket.png",
    "category": "Trading",
    "tags": ["order", "ticket", "trade"],
    "launchUrl": "/apps/order-ticket",
    "windowOptions": {
      "width": 800,
      "height": 600,
      "resizable": true
    }
  }
]
```

### demo-layouts.json

```json
[
  {
    "id": "default",
    "name": "Default Workspace",
    "data": {
      "version": 1,
      "panels": []
    }
  }
]
```

## Future Enhancements

- Add FDC3 intent support to `AppDefinition`
- Add permission/role-based app filtering
- Support for app versioning
- Layout templates and presets
- Dynamic app discovery/registration
- App categories and grouping UI
