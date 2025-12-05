# Quick Start Guide: FinDesktop Customization

Get up and running with FinDesktop customizations in 5 minutes!

---

## 🚀 5-Minute Quick Start

### Step 1: Understand the Structure (1 minute)

```
src/
├── core/          ← Core code (DON'T touch)
├── extensions/    ← Your customizations (SAFE to edit)
└── config/        ← Wire it all together (SAFE to edit)
```

**Golden Rule**: Only edit `extensions/` and `config/`

---

### Step 2: Choose What to Customize (1 minute)

Pick one or more:

- [ ] **Branding** - Logo, colors, company name
- [ ] **Authentication** - SSO, OAuth, SAML
- [ ] **Themes** - Custom color schemes
- [ ] **Notifications** - Slack, Teams, email
- [ ] **Channels** - Custom inter-app communication

---

### Step 3: Copy & Modify Example (2 minutes)

#### Example: Custom Branding

1. **Open** `src/extensions/CustomBranding.ts`

2. **Edit** the values:
   ```typescript
   getProductName() { 
     return 'Acme Trading Platform';  // ← Change this
   }
   
   getBrandColors() {
     return {
       primary: '#ff6b00',    // ← Your brand color
       secondary: '#333333',
       accent: '#00d4ff',
       background: '#ffffff',
     };
   }
   ```

3. **That's it!** Your branding is customized.

---

### Step 4: Wire It Up (1 minute)

Open `src/config/FinDesktopConfig.ts`:

```typescript
export const finDesktopConfig = {
  branding: new CustomBranding(),  // ← Already done!
  // ...
};
```

If using defaults, just uncomment the import and switch:

```typescript
// Before
branding: new CustomBranding()

// After  
branding: new DefaultBranding()
```

---

## 🎨 Common Customizations

### 1. Custom Branding (5 minutes)

**File**: `src/extensions/CustomBranding.ts`

```typescript
export class CustomBranding implements IProductBranding {
  getProductName() { return 'Your Product Name'; }
  getLogoUrl() { return '/your-logo.svg'; }
  getCompanyName() { return 'Your Company'; }
  getBrandColors() {
    return {
      primary: '#YOUR_COLOR',
      // ...
    };
  }
}
```

**Wire up**: Already done in `FinDesktopConfig.ts`!

---

### 2. Custom Authentication (15 minutes)

**Create**: `src/extensions/MyAuthProvider.ts`

```typescript
import type { IAuthProvider } from '../core/interfaces';

export class MyAuthProvider implements IAuthProvider {
  async login(credentials) {
    // Call your auth API
    const response = await fetch('https://auth.mycompany.com/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    const data = await response.json();
    return { success: true, token: data.token, user: data.user };
  }
  
  // Implement other required methods...
  async logout() { /* ... */ }
  isAuthenticated() { /* ... */ }
  getCurrentUser() { /* ... */ }
  async refreshToken() { /* ... */ }
  async validateToken() { /* ... */ }
  async initialize() { /* ... */ }
}
```

**Export**: Add to `src/extensions/index.ts`
```typescript
export * from './MyAuthProvider';
```

**Wire up**: In `src/config/FinDesktopConfig.ts`
```typescript
import { MyAuthProvider } from '../extensions';

export const finDesktopConfig = {
  authProvider: new MyAuthProvider(),
  // ...
};
```

---

### 3. Custom Theme (10 minutes)

**Edit**: `src/extensions/CustomThemeProvider.ts`

Add your custom theme:

```typescript
private createMyTheme(): Theme {
  return {
    id: 'my-theme',
    name: 'My Company Theme',
    colors: {
      primary: '#1e40af',
      background: '#f8fafc',
      text: '#0f172a',
      // ... more colors
    },
  };
}
```

Register it in `initialize()`:

```typescript
async initialize() {
  this.registerTheme(this.createMyTheme());
  // ...
}
```

**Already wired up** in config!

---

## 🔄 Update Workflow

### Getting Core Updates

```bash
# Pull latest core updates
git pull origin main

# Your extensions/ are safe! ✅
# Config might have conflicts (easy to resolve)
```

### Resolving Conflicts

If `FinDesktopConfig.ts` has conflicts:

```typescript
<<<<<<< HEAD
  authProvider: new MyAuthProvider(),  // Your custom
=======
  channelProvider: new DefaultChannelProvider(),  // New from core
>>>>>>> main
```

**Resolution**: Keep both!

```typescript
  authProvider: new MyAuthProvider(),        // ✅ Your custom
  channelProvider: new DefaultChannelProvider(),  // ✅ New from core
```

---

## 📋 Interface Cheat Sheet

### All Available Interfaces

| Interface | Purpose | Default Implementation |
|-----------|---------|------------------------|
| `IAuthProvider` | Authentication | `DefaultAuthProvider` |
| `INotificationProvider` | Notifications | `DefaultNotificationProvider` |
| `IThemeProvider` | Theming | `DefaultThemeProvider` |
| `IChannelProvider` | Inter-app communication | `DefaultChannelProvider` |
| `IProductBranding` | Branding | `DefaultBranding` |

### Creating Custom Provider Template

```typescript
// 1. Import the interface
import type { IYourInterface } from '../core/interfaces';

// 2. Implement the interface
export class MyCustomProvider implements IYourInterface {
  // 3. Implement ALL required methods
  async initialize() { /* ... */ }
  // ... other methods
}

// 4. Export from extensions/index.ts
export * from './MyCustomProvider';

// 5. Wire up in config/FinDesktopConfig.ts
import { MyCustomProvider } from '../extensions';
export const finDesktopConfig = {
  yourProvider: new MyCustomProvider(),
};
```

---

## 🛠️ Development Tips

### Tip 1: Start with Examples

Don't start from scratch! Copy and modify:
- `CustomBranding.ts` for branding
- `CustomAuthProvider.ts` for auth
- `CustomThemeProvider.ts` for themes

### Tip 2: TypeScript is Your Friend

If you implement an interface incorrectly, TypeScript will tell you:

```typescript
// ❌ TypeScript error: missing methods
export class MyAuth implements IAuthProvider {
  async login() { }
  // Error: Missing logout, isAuthenticated, etc.
}
```

### Tip 3: Test Incrementally

1. Customize one thing at a time
2. Test it works
3. Move to next customization

### Tip 4: Read the Interface

Each interface has detailed JSDoc comments:

```typescript
/**
 * Authenticate a user with credentials
 * @param credentials User credentials
 * @returns Authentication token or user session
 */
login(credentials: { username: string; password: string }): Promise<AuthResult>;
```

---

## 🐛 Troubleshooting

### Problem: "Cannot find module '../core/interfaces'"

**Solution**: Make sure you're importing from the right path:
```typescript
// ✅ Correct
import type { IAuthProvider } from '../core/interfaces';

// ❌ Wrong
import type { IAuthProvider } from './core/interfaces';
```

### Problem: "Type X is not assignable to type Y"

**Solution**: Make sure you implement ALL interface methods. Check the interface definition in `src/core/interfaces/`.

### Problem: Git overwrote my changes

**Solution**: Your changes were probably in `src/core/`. Move them to `src/extensions/` instead.

### Problem: How do I switch between default and custom?

**Solution**: Edit `src/config/FinDesktopConfig.ts`:

```typescript
// Use custom
branding: new CustomBranding()

// Use default
branding: new DefaultBranding()
```

---

## 📚 Next Steps

1. ✅ Read this Quick Start (you're here!)
2. 📖 Browse `src/extensions/` examples
3. 🎨 Customize branding (easiest)
4. 🔐 Add auth if needed (medium)
5. 🎨 Customize themes (medium)
6. 📖 Read full `ARCHITECTURE.md` (comprehensive guide)

---

## 💡 Pro Tips

### Environment-Based Configuration

```typescript
// src/config/FinDesktopConfig.ts
const isDevelopment = process.env.NODE_ENV === 'development';

export const finDesktopConfig = {
  authProvider: isDevelopment 
    ? new DefaultAuthProvider()    // Mock auth in dev
    : new MyAuthProvider(),        // Real auth in prod
};
```

### Composition Over Inheritance

Wrap default providers to add functionality:

```typescript
export class EnhancedAuth implements IAuthProvider {
  private defaultAuth = new DefaultAuthProvider();

  async login(credentials) {
    console.log('Logging in...');           // Add logging
    const result = await this.defaultAuth.login(credentials);
    this.trackAnalytics('login');           // Add analytics
    return result;
  }
  
  // Delegate other methods to defaultAuth...
}
```

### Multiple Tenants

```typescript
const tenantBranding = {
  'acme': new AcmeBranding(),
  'globex': new GlobexBranding(),
};

export const finDesktopConfig = {
  branding: tenantBranding[process.env.TENANT] || new DefaultBranding(),
};
```

---

## ✅ Quick Checklist

Before deploying your customization:

- [ ] All interface methods implemented
- [ ] TypeScript compiles without errors
- [ ] Tested in development
- [ ] Exported from `extensions/index.ts`
- [ ] Wired up in `FinDesktopConfig.ts`
- [ ] Documented any custom behavior
- [ ] Team knows about the customization

---

## 🎯 Common Use Cases

| Use Case | Interface | Time Estimate |
|----------|-----------|---------------|
| Change logo/colors | `IProductBranding` | 5 min |
| Add SSO | `IAuthProvider` | 30 min |
| Add custom theme | `IThemeProvider` | 15 min |
| Slack notifications | `INotificationProvider` | 20 min |
| Custom channels | `IChannelProvider` | 20 min |

---

## 📞 Need Help?

1. **Check examples** in `src/extensions/`
2. **Read interface docs** in `src/core/interfaces/`
3. **Check full guide** in `ARCHITECTURE.md`
4. **Ask your team lead**
5. **Open GitHub issue** for core bugs

---

**Remember**: Only edit `src/extensions/` and `src/config/` - and you'll never have conflicts! 🎉

---

*Last Updated: December 2025*
