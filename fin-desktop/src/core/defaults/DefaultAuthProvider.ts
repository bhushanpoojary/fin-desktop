/**
 * DefaultAuthProvider
 * 
 * ⚠️ WARNING: This is a demo/development authentication provider! ⚠️
 * 
 * Default implementation of IAuthProvider for FinDesktop.
 * This provides basic authentication functionality using localStorage.
 * It accepts ANY credentials for demo purposes - NOT for production!
 * 
 * For production, implement a custom IAuthProvider with real authentication:
 * - OAuth 2.0 / OpenID Connect
 * - SAML SSO
 * - JWT token validation
 * - Active Directory integration
 * - etc.
 * 
 * Customers can extend or replace this with their own implementation
 * in /extensions/CustomAuthProvider.ts
 */

import type { IAuthProvider, User, AuthResult } from '../interfaces/IAuthProvider';

export class DefaultAuthProvider implements IAuthProvider {
  private currentUser: User | null = null;
  private token: string | null = null;
  private authChangedCallbacks: Array<(user: User | null) => void> = [];

  async initialize(): Promise<void> {
    console.log('🔐 [DefaultAuthProvider] Initializing...');
    // Check for stored session
    const storedToken = localStorage.getItem('finDesktop.auth_token');
    const storedUser = localStorage.getItem('finDesktop.auth_user');
    
    if (storedToken && storedUser) {
      try {
        this.token = storedToken;
        this.currentUser = JSON.parse(storedUser);
        console.log('✅ [DefaultAuthProvider] Restored session for:', this.currentUser?.displayName);
      } catch (error) {
        console.warn('⚠️ [DefaultAuthProvider] Failed to restore session:', error);
        localStorage.removeItem('finDesktop.auth_token');
        localStorage.removeItem('finDesktop.auth_user');
      }
    } else {
      console.log('ℹ️ [DefaultAuthProvider] No stored session found');
    }
  }

  /**
   * Notify all registered callbacks of auth state change.
   */
  private notifyAuthChanged(user: User | null): void {
    this.authChangedCallbacks.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('❌ [DefaultAuthProvider] Error in auth changed callback:', error);
      }
    });
  }

  /**
   * Register a callback to be notified when auth state changes.
   * This is NOT part of the IAuthProvider interface but is useful for reactive auth.
   */
  onAuthChanged(callback: (user: User | null) => void): void {
    this.authChangedCallbacks.push(callback);
  }

  /**
   * Unregister an auth changed callback.
   */
  offAuthChanged(callback: (user: User | null) => void): void {
    const index = this.authChangedCallbacks.indexOf(callback);
    if (index !== -1) {
      this.authChangedCallbacks.splice(index, 1);
    }
  }

  async login(credentials: { username: string; password: string }): Promise<AuthResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    console.log('🔐 [DefaultAuthProvider] Attempting login for:', credentials.username);

    // Demo validation: Check for non-empty values
    if (!credentials.username || credentials.username.trim() === '') {
      return {
        success: false,
        error: 'Username is required',
      };
    }

    if (!credentials.password || credentials.password.trim() === '') {
      return {
        success: false,
        error: 'Password is required',
      };
    }

    // Mock: Accept any non-empty credentials for demo purposes
    const user: User = {
      id: credentials.username.trim(),
      username: credentials.username.trim(),
      email: `${credentials.username.trim()}@example.com`,
      displayName: credentials.username.trim(),
      roles: ['demo', 'user'],
    };

    const token = `token-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    this.currentUser = user;
    this.token = token;

    // Persist session
    localStorage.setItem('finDesktop.auth_token', token);
    localStorage.setItem('finDesktop.auth_user', JSON.stringify(user));

    console.log('✅ [DefaultAuthProvider] Login successful for:', user.displayName);

    // Notify listeners
    this.notifyAuthChanged(user);

    return {
      success: true,
      token,
      user,
    };
  }

  async logout(): Promise<void> {
    console.log('🚪 [DefaultAuthProvider] Logging out:', this.currentUser?.displayName);
    
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem('finDesktop.auth_token');
    localStorage.removeItem('finDesktop.auth_user');
    
    // Notify listeners
    this.notifyAuthChanged(null);
    
    console.log('✅ [DefaultAuthProvider] Logout complete');
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.token !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  async refreshToken(): Promise<string> {
    if (!this.token) {
      throw new Error('No token to refresh');
    }

    // Mock token refresh
    const newToken = `token-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    this.token = newToken;
    localStorage.setItem('finDesktop.auth_token', newToken);
    
    console.log('🔄 [DefaultAuthProvider] Token refreshed');
    return newToken;
  }

  async validateToken(token: string): Promise<boolean> {
    // Mock validation - in production, verify with auth server
    return token.startsWith('token-');
  }
}
