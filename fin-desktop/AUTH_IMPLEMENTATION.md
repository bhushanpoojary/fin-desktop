# Authentication Implementation

## Overview

A simple demo authentication layer has been added to FinDesktop to showcase how authentication can be integrated. This implementation includes:

- An authentication interface (`IAuthProvider`) that already existed in the project
- An enhanced default provider with localStorage persistence (`DefaultAuthProvider`)
- A login screen UI component (`LoginScreen`)
- Integration with the main application shell (`AppShell`)
- An example custom auth provider for customer implementations

## 🚨 Important: Demo Auth Only

The `DefaultAuthProvider` is **NOT secure** and should **NOT be used in production**. It:
- Accepts ANY non-empty username/password
- Stores credentials in localStorage (unencrypted)
- Has no real validation or security measures

This is purely for demonstration and development purposes.

## Files Modified/Created

### Created Files

1. **`src/shell/LoginScreen.tsx`**
   - Beautiful centered login form with gradient background
   - Username and password inputs
   - Error handling and loading states
   - Integrates with any `IAuthProvider` implementation

### Enhanced Files

2. **`src/core/defaults/DefaultAuthProvider.ts`**
   - Enhanced with better logging and error handling
   - Added `onAuthChanged` callback support for reactive auth
   - Uses `finDesktop.*` prefixed localStorage keys
   - Simulates network delay for realistic feel

3. **`src/extensions/CustomAuthProvider.ts`**
   - Added `onAuthChanged` callback support
   - Enhanced comments explaining OAuth/SSO integration patterns

4. **`src/shell/AppShell.tsx`**
   - Added authentication flow:
     - Check for existing session on mount
     - Show login screen if not authenticated
     - Show splash screen while checking auth
     - Show workspace once authenticated
   - Subscribes to auth state changes
   - Resolves auth provider from config

## How It Works

### Authentication Flow

1. **App starts** → `AppShell` mounts
2. **Check session** → Calls `authProvider.initialize()` and `getCurrentUser()`
3. **Three states:**
   - `undefined`: Checking session (shows splash: "Checking session...")
   - `null`: Not authenticated (shows `LoginScreen`)
   - `User`: Authenticated (proceeds with normal workspace loading)
4. **After login** → User data stored in localStorage and state updated
5. **Logout** → Clears localStorage and resets to login screen

### Auth Provider Resolution

```typescript
// Priority order:
// 1. Explicit prop
// 2. Config (finDesktopConfig.authProvider)
// 3. Default fallback
const authProvider = 
  authProviderProp ?? 
  finDesktopConfig.authProvider ?? 
  new DefaultAuthProvider();
```

### Reactive Authentication

The enhanced providers support optional `onAuthChanged(callback)` method:

```typescript
// AppShell subscribes to auth changes
const provider = authProvider as any;
if (typeof provider.onAuthChanged === 'function') {
  provider.onAuthChanged((user) => {
    console.log('Auth state changed:', user);
    setCurrentUser(user);
  });
}
```

## Configuration

### Using Default Auth (Demo)

In `src/config/FinDesktopConfig.ts`:

```typescript
import { DefaultAuthProvider } from '../core/defaults';

export const finDesktopConfig = {
  authProvider: new DefaultAuthProvider(),
  // ... other config
};
```

### Using Custom Auth (Production)

In `src/config/FinDesktopConfig.ts`:

```typescript
import { CustomAuthProvider } from '../extensions/CustomAuthProvider';

export const finDesktopConfig = {
  authProvider: new CustomAuthProvider(),
  // ... other config
};
```

Then implement your auth logic in `src/extensions/CustomAuthProvider.ts`:

```typescript
async login(credentials: { username: string; password: string }): Promise<AuthResult> {
  // Call your OAuth/SAML/JWT API
  const response = await fetch('https://auth.yourcompany.com/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  
  const data = await response.json();
  
  // Store token, return user
  return {
    success: true,
    token: data.token,
    user: data.user,
  };
}
```

## Interface: IAuthProvider

Located in `src/core/interfaces/IAuthProvider.ts`:

```typescript
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

### Optional Extension

Both `DefaultAuthProvider` and `CustomAuthProvider` implement optional reactive auth:

```typescript
onAuthChanged(callback: (user: User | null) => void): void
offAuthChanged(callback: (user: User | null) => void): void
```

This enables `AppShell` to automatically react to login/logout events.

## Testing the Login Flow

1. **Start the app** (it should show the login screen)
2. **Enter any username and password** (must be non-empty)
3. **Click "Sign In"**
4. **You'll see:**
   - Login button changes to "Signing in..."
   - After ~300ms, splash screen shows "Initializing..."
   - Layout and desktop API load
   - Workspace appears

5. **Refresh the page:**
   - Session is restored from localStorage
   - You're automatically logged in (no login screen)

6. **To test logout:**
   - Open DevTools console
   - Run: `localStorage.clear()` and refresh
   - Login screen appears again

## Future Enhancements

### TODO: Add Logout Button

Currently, there's no UI button to log out. Future improvements:

1. Add a user menu in the workspace header
2. Wire the logout handler:

```typescript
// In AppShell
const handleLogout = async () => {
  await authProvider.logout();
  setCurrentUser(null);
  setIsLayoutReady(false);
  setIsDesktopApiReady(false);
};

// Pass to workspace via context
<AuthContext.Provider value={{ user: currentUser, logout: handleLogout }}>
  <WorkspaceShell />
</AuthContext.Provider>
```

### TODO: Pass User to Workspace

Currently, the user object is not passed to `WorkspaceShell`. Options:

1. **Via Context:**

```typescript
// Create AuthContext
export const AuthContext = createContext<{
  user: User | null;
  logout: () => Promise<void>;
}>(null);

// Provide in AppShell
<AuthContext.Provider value={{ user: currentUser, logout: handleLogout }}>
  <WorkspaceShell />
</AuthContext.Provider>

// Consume in workspace components
const { user, logout } = useContext(AuthContext);
```

2. **Via Props:**

```typescript
// Update WorkspaceShellProps
interface WorkspaceShellProps {
  user?: User;
  onLogout?: () => void;
}

// Pass from AppShell
<WorkspaceShell user={currentUser} onLogout={handleLogout} />
```

## Production Implementation Checklist

Before using this in production:

- [ ] Replace `DefaultAuthProvider` with `CustomAuthProvider`
- [ ] Implement real OAuth/SAML/JWT in `CustomAuthProvider`
- [ ] Add HTTPS for all auth API calls
- [ ] Implement token refresh logic
- [ ] Add proper error handling and user feedback
- [ ] Implement session timeout
- [ ] Add CSRF protection if using cookies
- [ ] Store tokens securely (not in localStorage if sensitive)
- [ ] Add multi-factor authentication (MFA) if required
- [ ] Implement proper role-based access control (RBAC)
- [ ] Add audit logging for authentication events
- [ ] Test logout clears all sensitive data
- [ ] Add "Remember Me" functionality if needed
- [ ] Implement account lockout after failed attempts
- [ ] Add password reset flow

## Example: OAuth Integration

See `src/extensions/CustomAuthProvider.ts` for detailed TODOs and examples of how to integrate:

- OAuth 2.0 / OpenID Connect
- SAML SSO
- JWT token validation
- Active Directory / LDAP

## Questions?

This implementation follows the existing patterns in FinDesktop:
- Uses the existing `IAuthProvider` interface
- Follows the config-based provider injection pattern
- Keeps customizations in `/extensions`
- Provides clear upgrade path from demo to production auth
