/**
 * AuthFramework - Core Component
 * 
 * Authentication and authorization framework using the configured IAuthProvider.
 * This is a core component - do not modify directly. Use extension points instead.
 */

import type { IAuthProvider, User, AuthResult } from '../interfaces/IAuthProvider';

export class AuthFramework {
  private provider: IAuthProvider | null = null;
  private authListeners: Set<(user: User | null) => void> = new Set();

  /**
   * Initialize the auth framework with a provider
   */
  async initialize(provider: IAuthProvider): Promise<void> {
    this.provider = provider;
    await provider.initialize();
    console.log('AuthFramework initialized with provider');
  }

  /**
   * Login with credentials
   */
  async login(username: string, password: string): Promise<AuthResult> {
    if (!this.provider) {
      return {
        success: false,
        error: 'Auth provider not initialized',
      };
    }

    const result = await this.provider.login({ username, password });
    
    if (result.success && result.user) {
      this.notifyAuthListeners(result.user);
    }

    return result;
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    if (this.provider) {
      await this.provider.logout();
      this.notifyAuthListeners(null);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.provider?.isAuthenticated() || false;
  }

  /**
   * Get the current user
   */
  getCurrentUser(): User | null {
    return this.provider?.getCurrentUser() || null;
  }

  /**
   * Refresh the authentication token
   */
  async refreshToken(): Promise<string | null> {
    if (this.provider) {
      try {
        return await this.provider.refreshToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Validate a token
   */
  async validateToken(token: string): Promise<boolean> {
    if (this.provider) {
      return await this.provider.validateToken(token);
    }
    return false;
  }

  /**
   * Subscribe to authentication state changes
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.authListeners.add(callback);
    return () => {
      this.authListeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of auth state change
   */
  private notifyAuthListeners(user: User | null): void {
    this.authListeners.forEach((listener) => listener(user));
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles.includes(role) || false;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return roles.some(role => user?.roles.includes(role)) || false;
  }

  /**
   * Check if user has all of the specified roles
   */
  hasAllRoles(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return roles.every(role => user?.roles.includes(role)) || false;
  }
}
