# FinDesktop Architecture: Core vs Customer Layer

## Overview

FinDesktop implements a **"Core vs Customer Layer"** architecture that enables safe customization even after future git pulls. This architecture cleanly separates the core product code from customer-specific customizations, ensuring that updates to the core don't break or overwrite your customizations.

## Architecture Principles

### 1. Stable Interface Contracts
All customer code depends **only** on stable interfaces defined in `src/core/interfaces/`. These interfaces are public extension contracts that will not break without a major version bump.

### 2. Separation of Concerns
- **Core Layer**: Maintained by the FinDesktop team, updated via git pull
- **Customer Layer**: Modified by end-users, never touched by core updates
- **Configuration**: Simple wiring layer that connects core and custom implementations

### 3. Plugin Architecture
Every major subsystem (auth, theming, notifications, etc.) is defined as an interface with default and custom implementations.

---

## Directory Structure

```
src/
├── core/                           # ⚠️ DO NOT MODIFY - Updated via git pull
│   ├── interfaces/                 # Public extension contracts
│   │   ├── IAuthProvider.ts
│   │   ├── INotificationProvider.ts
│   │   ├── IThemeProvider.ts
│   │   ├── IChannelProvider.ts
│   │   └── IProductBranding.ts
│   ├── components/                 # Core building blocks
│   │   ├── WindowManager.ts
│   │   ├── LayoutManager.ts
│   │   ├── NotificationCenter.ts
│   │   ├── ThemeEngine.ts
│   │   └── AuthFramework.ts
│   └── defaults/                   # Default implementations
│       ├── DefaultAuthProvider.ts
│       ├── DefaultNotificationProvider.ts
│       ├── DefaultThemeProvider.ts
│       ├── DefaultChannelProvider.ts
│       ├── DefaultBranding.ts
│       └── default.config.ts
│
├── extensions/                     # ✅ SAFE TO MODIFY - Your customizations
│   ├── CustomBranding.ts
│   ├── CustomAuthProvider.ts
│   ├── CustomThemeProvider.ts
│   └── README.md                   # Extension documentation
│
└── config/                         # ✅ SAFE TO MODIFY - Your configuration
    └── FinDesktopConfig.ts         # Wire up your custom providers
```

---

## What Goes Where?

### Core Layer (`src/core/`)

**DO NOT MODIFY THIS FOLDER**

This folder contains:
- **Interfaces**: Public contracts that define how providers work
- **Components**: Core building blocks like WindowManager, ThemeEngine, etc.
- **Defaults**: Reference implementations of all interfaces

Changes to this folder come from:
- Git pulls from the main FinDesktop repository
- NPM package updates (in the future)

### Extensions Layer (`src/extensions/`)

**SAFE TO MODIFY**

This folder is specifically for your customizations:
- Custom authentication providers
- Custom themes and branding
- Custom notification systems
- Custom channel providers
- Any other custom implementations

This folder is **never touched** by core updates.

### Configuration (`src/config/`)

**SAFE TO MODIFY**

This is where you wire everything together:
- Choose between default and custom providers
- Configure which implementation to use for each subsystem
- Add environment-specific configuration

---

## How to Customize

### Step 1: Understand the Interfaces

All customization starts with the core interfaces in `src/core/interfaces/`:

```typescript
// Example: IAuthProvider interface
export interface IAuthProvider {
  initialize(): Promise<void>;
  login(credentials: { username: string; password: string }): Promise<AuthResult>;
  logout(): Promise<void>;
  isAuthenticated(): boolean;
  getCurrentUser(): User | null;
  refreshToken(): Promise<string>;
  validateToken(token: string): Promise<boolean>;
}
```

### Step 2: Create Your Custom Implementation

Create a new file in `src/extensions/`:

```typescript
// src/extensions/MyCompanyAuthProvider.ts
import type { IAuthProvider, User, AuthResult } from '../core/interfaces/IAuthProvider';

export class MyCompanyAuthProvider implements IAuthProvider {
  async initialize(): Promise<void> {
    // Your initialization logic
  }

  async login(credentials): Promise<AuthResult> {
    // Call your company's auth API
    const response = await fetch('https://auth.mycompany.com/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    // Return AuthResult
  }

  // ... implement other methods
}
```

### Step 3: Export from Extensions

Add your provider to `src/extensions/index.ts`:

```typescript
export * from './MyCompanyAuthProvider';
```

### Step 4: Wire It Up

Update `src/config/FinDesktopConfig.ts`:

```typescript
import { MyCompanyAuthProvider } from '../extensions';

export const finDesktopConfig = {
  authProvider: new MyCompanyAuthProvider(),
  // ... other providers
};
```

### Step 5: Use It in Your App

```typescript
import { finDesktopConfig } from './config/FinDesktopConfig';

// Initialize the auth framework with your custom provider
const authFramework = new AuthFramework();
await authFramework.initialize(finDesktopConfig.authProvider);
```

---

## Example Customizations

### 1. Custom Branding

```typescript
// src/extensions/AcmeBranding.ts
import type { IProductBranding } from '../core/interfaces/IProductBranding';

export class AcmeBranding implements IProductBranding {
  getProductName() { return 'Acme Trading Platform'; }
  getLogoUrl() { return '/acme-logo.svg'; }
  getBrandColors() {
    return {
      primary: '#ff6b00',
      secondary: '#333333',
      accent: '#00d4ff',
      background: '#ffffff',
    };
  }
  // ... other methods
}
```

### 2. OAuth Authentication

```typescript
// src/extensions/OAuth2Provider.ts
import type { IAuthProvider } from '../core/interfaces/IAuthProvider';

export class OAuth2Provider implements IAuthProvider {
  async login(credentials) {
    // Redirect to OAuth provider
    window.location.href = `https://oauth.provider.com/authorize?...`;
  }
  // ... handle OAuth callback and token management
}
```

### 3. Custom Themes

```typescript
// src/extensions/CorporateThemeProvider.ts
import type { IThemeProvider, Theme } from '../core/interfaces/IThemeProvider';

export class CorporateThemeProvider implements IThemeProvider {
  private themes = [
    { id: 'corporate', name: 'Corporate', colors: {...} },
    { id: 'trading-floor', name: 'Trading Floor', colors: {...} },
  ];
  // ... implement theme management
}
```

---

## Upgrade Strategy

### When Core Updates Are Released

1. **Pull Updates**:
   ```bash
   git pull origin main
   ```

2. **What Gets Updated**:
   - ✅ `src/core/**` - Core code and interfaces
   - ✅ Default implementations
   - ❌ `src/extensions/**` - Your customizations remain untouched
   - ⚠️ `src/config/FinDesktopConfig.ts` - May have merge conflicts (easy to resolve)

3. **Resolve Conflicts** (if any):
   - Typically only in `FinDesktopConfig.ts`
   - Keep your custom provider selections
   - Add any new providers that were introduced

### Migration Example

**Before update:**
```typescript
export const finDesktopConfig = {
  authProvider: new CustomAuthProvider(),
  themeProvider: new CustomThemeProvider(),
};
```

**Core adds new NotificationProvider:**
```typescript
// Your config after update:
export const finDesktopConfig = {
  authProvider: new CustomAuthProvider(),      // ✅ Unchanged
  themeProvider: new CustomThemeProvider(),    // ✅ Unchanged
  notificationProvider: new DefaultNotificationProvider(), // ✅ New, use default
};
```

---

## Interface Stability Guarantee

All interfaces in `src/core/interfaces/` are marked with:

```typescript
/**
 * Public extension contract – do not break without major version bump.
 */
```

This means:
- ✅ **Minor/Patch Updates**: Add new optional methods, maintain backwards compatibility
- ❌ **Breaking Changes**: Only in major version releases (1.x → 2.x)
- 📢 **Deprecation**: 6-month warning before removing any method

---

## Git Strategies for Customizations

### Option 1: Keep Extensions in the Same Repo

Add to `.gitignore`:
```gitignore
# Ignore customer customizations (optional)
src/extensions/**
!src/extensions/README.md
```

Use branches:
- `main` - Track upstream FinDesktop
- `custom` - Your customizations

Merge strategy:
```bash
git checkout main
git pull origin main      # Get core updates
git checkout custom
git merge main            # Merge into custom branch
```

### Option 2: Separate Repository (Recommended for Large Teams)

```
# Core repository (upstream)
fin-desktop/
  src/core/
  src/extensions/ (examples only)

# Your company repository
my-company-desktop/
  package.json (depends on fin-desktop)
  src/
    extensions/    # Your customizations
    config/        # Your configuration
```

---

## Future: NPM Package Distribution

In the future, FinDesktop core will be published as an NPM package:

```bash
npm install @bhushan/fin-desktop-core
```

Your project structure:
```
my-findesktop-app/
├── package.json
│   └── dependencies:
│       └── "@bhushan/fin-desktop-core": "^2.0.0"
├── src/
│   ├── extensions/        # Your customizations
│   │   ├── CustomAuth.ts
│   │   └── CustomTheme.ts
│   └── config/
│       └── FinDesktopConfig.ts
└── App.tsx
```

Usage:
```typescript
import { AuthFramework, ThemeEngine } from '@bhushan/fin-desktop-core';
import { CustomAuthProvider } from './extensions';
import { finDesktopConfig } from './config/FinDesktopConfig';

// Use core with your customizations
```

---

## Best Practices

### 1. Always Implement Full Interface
Don't partially implement interfaces - provide all required methods:

```typescript
// ❌ Bad
export class CustomAuth implements IAuthProvider {
  async login() { ... }
  // Missing other required methods!
}

// ✅ Good
export class CustomAuth implements IAuthProvider {
  async initialize() { ... }
  async login() { ... }
  async logout() { ... }
  // ... all methods implemented
}
```

### 2. Use Composition Over Extension

```typescript
// ✅ Preferred: Composition
import { DefaultAuthProvider } from '../core/defaults';

export class EnhancedAuth implements IAuthProvider {
  private defaultAuth = new DefaultAuthProvider();

  async login(credentials) {
    // Add custom logic
    console.log('Custom logging');
    // Delegate to default
    return this.defaultAuth.login(credentials);
  }
}
```

### 3. Document Your Customizations

Add comments explaining why you customized:

```typescript
/**
 * CustomAuthProvider
 * 
 * Integrates with our company's SAML 2.0 SSO system.
 * Required for compliance with IT security policy #2024-03.
 * 
 * Contact: security@mycompany.com
 */
export class CustomAuthProvider implements IAuthProvider {
  // ...
}
```

### 4. Test Against Interface

Write tests that verify your implementation:

```typescript
import type { IAuthProvider } from '../core/interfaces';
import { CustomAuthProvider } from './CustomAuthProvider';

describe('CustomAuthProvider', () => {
  let provider: IAuthProvider;

  beforeEach(() => {
    provider = new CustomAuthProvider();
  });

  it('should implement all required methods', () => {
    expect(provider.initialize).toBeDefined();
    expect(provider.login).toBeDefined();
    expect(provider.logout).toBeDefined();
    // ... test all interface methods
  });
});
```

---

## Common Scenarios

### Scenario 1: Add Company SSO

1. Create `src/extensions/CompanySSOProvider.ts`
2. Implement `IAuthProvider` interface
3. Update `src/config/FinDesktopConfig.ts`:
   ```typescript
   authProvider: new CompanySSOProvider()
   ```

### Scenario 2: Custom Notifications (Slack/Teams)

1. Create `src/extensions/SlackNotificationProvider.ts`
2. Implement `INotificationProvider` interface
3. Update configuration

### Scenario 3: Multi-Tenant Branding

1. Create multiple branding classes:
   ```typescript
   src/extensions/TenantABranding.ts
   src/extensions/TenantBBranding.ts
   ```
2. Use environment variable to switch:
   ```typescript
   const branding = process.env.TENANT === 'A'
     ? new TenantABranding()
     : new TenantBBranding();
   ```

---

## Troubleshooting

### Problem: Git Pull Overwrote My Changes

**Solution**: Your changes were likely in `src/core/`. Move them to `src/extensions/`.

### Problem: Interface Changed After Update

**Solution**: Check the changelog for breaking changes. Update your implementation to match the new interface.

### Problem: Can't Find the Right Extension Point

**Solution**: Check if a suitable interface exists in `src/core/interfaces/`. If not, request a new interface in the FinDesktop GitHub issues.

---

## Support & Contributions

- **Core Issues**: Report to FinDesktop GitHub repository
- **Custom Implementation Help**: Consult `src/extensions/README.md` and example implementations
- **Feature Requests**: Open an issue requesting new interfaces or extension points

---

## Summary

| Folder | Owner | Git Updates | Purpose |
|--------|-------|-------------|---------|
| `src/core/` | FinDesktop Team | ✅ Yes | Core product code |
| `src/extensions/` | You | ❌ No | Custom implementations |
| `src/config/` | You | ⚠️ Maybe | Configuration wiring |

**Key Takeaway**: Keep your customizations in `src/extensions/` and `src/config/`, and you'll never have merge conflicts with core updates!

---

*Last Updated: December 2025*
*Version: 1.0.0*
