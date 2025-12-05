# FinDesktop Architecture Diagram

Visual representation of the Core vs Customer Layer architecture.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FinDesktop Application                    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Your Application Code                      │    │
│  │         (React components, business logic)             │    │
│  └─────────────────────┬──────────────────────────────────┘    │
│                        │                                         │
│                        │ uses                                    │
│                        ▼                                         │
│  ┌────────────────────────────────────────────────────────┐    │
│  │           FinDesktop Configuration Layer                │    │
│  │         (src/config/FinDesktopConfig.ts)               │    │
│  │                                                          │    │
│  │   Wires: Default Providers ◄─► Custom Providers        │    │
│  └───────────┬────────────────────────────┬────────────────┘    │
│              │                            │                     │
│      depends on                   depends on                   │
│              │                            │                     │
│  ┌───────────▼────────────┐   ┌──────────▼──────────────┐     │
│  │   Core Layer            │   │  Customer Layer         │     │
│  │   (src/core/)           │   │  (src/extensions/)      │     │
│  │   ⚠️ DON'T MODIFY       │   │  ✅ SAFE TO MODIFY     │     │
│  │                         │   │                          │     │
│  │  • Interfaces           │   │  • CustomBranding        │     │
│  │  • Components           │   │  • CustomAuthProvider    │     │
│  │  • Default Providers    │   │  • CustomThemeProvider   │     │
│  └─────────────────────────┘   └──────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     Core Components                               │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐          │
│  │   Window    │  │   Layout    │  │  Notification   │          │
│  │   Manager   │  │   Manager   │  │     Center      │          │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘          │
│         │                │                   │                   │
│         └────────────────┼───────────────────┘                   │
│                          │                                       │
│                          │ uses providers                        │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────────────┐        │
│  │               Provider Interfaces                    │        │
│  │  ┌───────────────────────────────────────────────┐  │        │
│  │  │  IAuthProvider  │  IThemeProvider  │ etc...   │  │        │
│  │  └───────────────────────────────────────────────┘  │        │
│  └──────────────────────┬──────────────────────────────┘        │
│                         │                                        │
│         ┌───────────────┴────────────────┐                      │
│         │                                │                      │
│         ▼                                ▼                      │
│  ┌─────────────────┐           ┌─────────────────┐             │
│  │    Default      │           │     Custom      │             │
│  │ Implementations │           │ Implementations │             │
│  │  (src/core/)    │           │ (src/extensions)│             │
│  └─────────────────┘           └─────────────────┘             │
└──────────────────────────────────────────────────────────────────┘
```

---

## Dependency Flow

```
Application Code
    │
    ├─► uses ThemeEngine ──┐
    ├─► uses AuthFramework ┼──► depends on ──► IThemeProvider ◄──┐
    └─► uses NotificationCenter ┘                                  │
                                                                   │
                              ┌────────────────────────────────────┤
                              │                                    │
                         implements                           implements
                              │                                    │
                    ┌─────────▼─────────┐            ┌───────────▼────────┐
                    │ DefaultThemeProvider│           │ CustomThemeProvider │
                    │  (core/defaults/)    │           │  (extensions/)      │
                    └──────────────────────┘           └─────────────────────┘
                              ▲                                    ▲
                              │                                    │
                              └──────── Config chooses ────────────┘
                                   (FinDesktopConfig.ts)
```

---

## Git Update Flow

### Before Git Pull

```
Your Repository
├── src/
│   ├── core/              ← May be updated
│   │   ├── interfaces/    ← Rarely changes (stable)
│   │   ├── components/    ← Gets new features
│   │   └── defaults/      ← Gets improvements
│   │
│   ├── extensions/        ← YOUR CODE (untouched)
│   │   ├── CustomAuth.ts
│   │   └── CustomTheme.ts
│   │
│   └── config/            ← YOUR CODE (may conflict)
│       └── FinDesktopConfig.ts
```

### After Git Pull

```
Your Repository
├── src/
│   ├── core/              ← ✅ Updated with new features
│   │   ├── interfaces/    ← ✅ Still stable (no breaking changes)
│   │   ├── components/    ← ✅ New features added
│   │   └── defaults/      ← ✅ Improvements added
│   │
│   ├── extensions/        ← ✅ YOUR CODE (unchanged)
│   │   ├── CustomAuth.ts  ← ✅ Still works!
│   │   └── CustomTheme.ts ← ✅ Still works!
│   │
│   └── config/            ← ⚠️ May need merge (easy)
│       └── FinDesktopConfig.ts
```

---

## Provider Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                    Interface (Contract)                      │
│                                                              │
│  export interface IAuthProvider {                           │
│    login(credentials): Promise<AuthResult>                  │
│    logout(): Promise<void>                                  │
│    isAuthenticated(): boolean                               │
│    getCurrentUser(): User | null                            │
│  }                                                           │
└────────┬─────────────────────────────────┬──────────────────┘
         │                                 │
         │ implements                      │ implements
         │                                 │
    ┌────▼──────────┐              ┌──────▼─────────┐
    │    Default    │              │     Custom     │
    │ Auth Provider │              │  Auth Provider │
    │               │              │                │
    │ • Mock login  │              │ • OAuth flow   │
    │ • Local store │              │ • JWT tokens   │
    │ • Simple logic│              │ • SSO redirect │
    └───────────────┘              └────────────────┘
           ▲                              ▲
           │                              │
           └──── Config selects one ──────┘
                 (FinDesktopConfig.ts)
```

---

## Customization Flow

```
Step 1: Choose Provider to Customize
    │
    └─► Pick interface from src/core/interfaces/
            │
            │
Step 2: Create Custom Implementation
    │
    └─► Create file in src/extensions/
            │
            ├─► Implement all interface methods
            │
            └─► Add your custom logic
                    │
                    │
Step 3: Export Your Provider
    │
    └─► Add to src/extensions/index.ts
            │
            │
Step 4: Wire It Up
    │
    └─► Update src/config/FinDesktopConfig.ts
            │
            ├─► Import your provider
            │
            └─► Assign to config object
                    │
                    │
Step 5: Done! ✅
    │
    └─► Your customization is active
            │
            └─► Safe from future git pulls
```

---

## Data Flow Example: Authentication

```
1. User enters credentials
    │
    ▼
2. Application calls AuthFramework.login()
    │
    ▼
3. AuthFramework delegates to configured provider
    │
    ├──► DefaultAuthProvider?     ──► Mock authentication
    │
    └──► CustomAuthProvider?      ──► Call company SSO API
                                            │
                                            ▼
4. Provider returns AuthResult
    │
    ▼
5. AuthFramework updates state
    │
    ▼
6. Application receives result
    │
    └──► Success: Show dashboard
    │
    └──► Failure: Show error
```

---

## Theme Application Flow

```
1. Application initializes ThemeEngine
    │
    ▼
2. ThemeEngine loads configured provider
    │
    ├──► DefaultThemeProvider?     ──► Light/Dark themes
    │
    └──► CustomThemeProvider?      ──► Corporate themes
                │
                ▼
3. Provider returns available themes
    │
    ▼
4. ThemeEngine applies current theme
    │
    ├──► Set CSS variables
    │
    ├──► Apply to document root
    │
    └──► Notify listeners
            │
            ▼
5. Application UI updates with new theme
```

---

## File Organization Tree

```
src/
│
├── core/                          🔒 CORE LAYER (Read-only)
│   │
│   ├── interfaces/                📜 Public Contracts
│   │   ├── IAuthProvider.ts       🔌 Auth interface
│   │   ├── IThemeProvider.ts      🔌 Theme interface
│   │   ├── INotificationProvider.ts
│   │   ├── IChannelProvider.ts
│   │   ├── IProductBranding.ts
│   │   └── index.ts               📦 Export all
│   │
│   ├── components/                🧩 Core Building Blocks
│   │   ├── WindowManager.ts       🪟 Window lifecycle
│   │   ├── LayoutManager.ts       📐 Layout management
│   │   ├── NotificationCenter.ts  🔔 Notification router
│   │   ├── ThemeEngine.ts         🎨 Theme applicator
│   │   ├── AuthFramework.ts       🔐 Auth coordinator
│   │   └── index.ts               📦 Export all
│   │
│   ├── defaults/                  🎁 Default Implementations
│   │   ├── DefaultAuthProvider.ts
│   │   ├── DefaultThemeProvider.ts
│   │   ├── DefaultNotificationProvider.ts
│   │   ├── DefaultChannelProvider.ts
│   │   ├── DefaultBranding.ts
│   │   ├── default.config.ts      ⚙️ Config helper
│   │   └── index.ts               📦 Export all
│   │
│   ├── FinDesktopApp.example.ts   📖 Usage example
│   ├── README.md                  📚 Core docs
│   └── index.ts                   📦 Main export
│
├── extensions/                    ✅ CUSTOMER LAYER (Edit freely)
│   │
│   ├── CustomBranding.ts          🏢 Your branding
│   ├── CustomAuthProvider.ts      🔐 Your auth
│   ├── CustomThemeProvider.ts     🎨 Your themes
│   ├── README.md                  📚 Extension guide
│   └── index.ts                   📦 Export customs
│
└── config/                        ⚙️ CONFIGURATION (Edit freely)
    └── FinDesktopConfig.ts        🔧 Wire everything
```

---

## Version Upgrade Visualization

### Minor Version Update (1.0.0 → 1.1.0)

```
BEFORE                             AFTER
────────────────────────────────────────────────────────────
src/core/                          src/core/
├── interfaces/                    ├── interfaces/
│   ├── IAuth.ts (v1)              │   ├── IAuth.ts (v1.1)
│   └── ITheme.ts (v1)             │   ├── ITheme.ts (v1.1)
│                                  │   └── INewFeature.ts ✨ NEW
├── components/                    ├── components/
│   └── AuthFramework.ts           │   ├── AuthFramework.ts ⬆️
│                                  │   └── NewComponent.ts ✨ NEW
└── defaults/                      └── defaults/
                                       └── DefaultNew.ts ✨ NEW

src/extensions/                    src/extensions/
├── CustomAuth.ts ✅               ├── CustomAuth.ts ✅ (Still works!)
└── CustomTheme.ts ✅              └── CustomTheme.ts ✅ (Still works!)

src/config/                        src/config/
└── Config.ts                      └── Config.ts ⚠️ (Add new provider)

Result: ✅ Backwards compatible, your code works!
```

### Major Version Update (1.x → 2.0.0)

```
BEFORE                             AFTER
────────────────────────────────────────────────────────────
src/core/                          src/core/
└── interfaces/                    └── interfaces/
    ├── IAuth.ts (v1)                  └── IAuth.ts (v2) 🔴 BREAKING
        login(creds)                       ├── Added: logout()
                                           └── Changed: login(opts)

src/extensions/                    src/extensions/
└── CustomAuth.ts ⚠️               └── CustomAuth.ts 🔧 (Needs update)
    implements v1                      must implement v2

Result: ⚠️ Breaking changes, but documented migration path
```

---

## Testing Strategy

```
┌────────────────────────────────────────────────────────────┐
│                      Testing Layers                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Unit Tests                                          │  │
│  │  • Test each default provider                        │  │
│  │  • Test each core component                          │  │
│  │  • Mock interfaces for isolation                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Integration Tests                                   │  │
│  │  • Test component + provider interaction             │  │
│  │  • Test config wiring                                │  │
│  │  • Test default vs custom switching                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Interface Contract Tests                            │  │
│  │  • Verify custom providers implement full interface  │  │
│  │  • Test against interface spec                       │  │
│  │  • Ensure type safety                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  End-to-End Tests                                    │  │
│  │  • Test full application flow                        │  │
│  │  • Test with custom providers                        │  │
│  │  • Smoke tests for upgrades                          │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## Legend

```
🔒 Core Layer - Do not modify
✅ Customer Layer - Safe to modify
⚙️ Configuration - Safe to modify
📜 Interfaces - Stable contracts
🧩 Components - Building blocks
🎁 Defaults - Reference implementations
📦 Exports - Package entry points
📚 Documentation
🔌 Extension points
⚠️ Attention needed
✨ New features
🔴 Breaking changes
🔧 Needs update
⬆️ Improved
```

---

*These diagrams illustrate the clean separation between core and customer code, ensuring safe customization.*
