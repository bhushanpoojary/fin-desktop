# Core Layer - FinDesktop

This folder contains the core FinDesktop implementation that should **not** be modified by end-users.

## ⚠️ Important: Do Not Modify

This folder is owned and maintained by the FinDesktop core team. Changes here are distributed via:
- Git pulls from the main repository
- NPM package updates (future)

**If you need to customize behavior, use the extension points in `src/extensions/` instead.**

---

## Structure

```
core/
├── interfaces/           # Public extension contracts
│   ├── IAuthProvider.ts
│   ├── INotificationProvider.ts
│   ├── IThemeProvider.ts
│   ├── IChannelProvider.ts
│   └── IProductBranding.ts
│
├── components/           # Core building blocks
│   ├── WindowManager.ts
│   ├── LayoutManager.ts
│   ├── NotificationCenter.ts
│   ├── ThemeEngine.ts
│   └── AuthFramework.ts
│
└── defaults/             # Reference implementations
    ├── DefaultAuthProvider.ts
    ├── DefaultNotificationProvider.ts
    ├── DefaultThemeProvider.ts
    ├── DefaultChannelProvider.ts
    ├── DefaultBranding.ts
    └── default.config.ts
```

---

## Interfaces (Extension Contracts)

These are the **public API surface** that custom implementations must follow.

- **Stability**: Will not break without major version bump
- **Versioning**: Follows semantic versioning
- **Deprecation**: 6-month notice before removing any method

All interfaces are marked with:
```typescript
/**
 * Public extension contract – do not break without major version bump.
 */
```

---

## Components (Core Building Blocks)

These are the main systems that power FinDesktop:

- **WindowManager**: Manages window lifecycle and positioning
- **LayoutManager**: Handles workspace layouts and persistence
- **NotificationCenter**: Routes notifications through the configured provider
- **ThemeEngine**: Applies themes from the configured provider
- **AuthFramework**: Manages authentication through the configured provider

Components are designed to be:
- Provider-agnostic (work with any implementation of the interface)
- Testable (can be mocked easily)
- Extensible (can be wrapped or composed)

---

## Defaults (Reference Implementations)

Default implementations serve as:
1. **Working examples** of how to implement each interface
2. **Fallback implementations** when no custom provider is specified
3. **Testing baseline** for validating custom implementations

You can:
- ✅ Use them as-is
- ✅ Extend them via composition
- ✅ Reference them when building custom implementations
- ❌ Modify them directly (use extensions instead)

---

## Usage

### For Core Developers

When adding new features:

1. **Define interface first** in `interfaces/`
2. **Create default implementation** in `defaults/`
3. **Add to core component** if needed in `components/`
4. **Export from index.ts**
5. **Update ARCHITECTURE.md** with usage examples

### For Extension Developers

See `src/extensions/README.md` for how to create custom implementations.

---

## Future: NPM Package

This core will eventually be published as:

```bash
npm install @bhushan/fin-desktop-core
```

Customer repositories will then import from the package:

```typescript
import { 
  AuthFramework, 
  ThemeEngine,
  type IAuthProvider,
  type IThemeProvider 
} from '@bhushan/fin-desktop-core';

import { MyCustomAuth } from './extensions';

const auth = new AuthFramework();
await auth.initialize(new MyCustomAuth());
```

Benefits:
- ✅ Clean separation of core and custom code
- ✅ Versioned releases with semantic versioning
- ✅ No git merge conflicts
- ✅ Multiple projects can share custom extensions

---

## Contributing to Core

Found a bug or want to add a feature? Please:

1. Open an issue in the main repository
2. Follow the contribution guidelines
3. Ensure all tests pass
4. Update documentation

Remember: Changes here affect all FinDesktop users, so maintain backwards compatibility!

---

## Questions?

- For core issues: GitHub Issues
- For extension help: See `src/extensions/README.md`
- For architecture: See `ARCHITECTURE.md`
