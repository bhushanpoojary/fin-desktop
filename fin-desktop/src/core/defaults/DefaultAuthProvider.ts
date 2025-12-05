/**
 * DefaultAuthProvider
 * 
 * Default implementation of IAuthProvider for FinDesktop.
 * This provides basic authentication functionality.
 * 
 * Customers can extend or replace this with their own implementation.
 */

import type { IAuthProvider, User, AuthResult } from '../interfaces/IAuthProvider';

export class DefaultAuthProvider implements IAuthProvider {
  private currentUser: User | null = null;
  private token: string | null = null;

  async initialize(): Promise<void> {
    console.log('DefaultAuthProvider initialized');
    // Check for stored session
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      this.token = storedToken;
      this.currentUser = JSON.parse(storedUser);
    }
  }

  async login(credentials: { username: string; password: string }): Promise<AuthResult> {
    // Simple mock authentication - replace with real auth logic
    console.log('Attempting login for:', credentials.username);

    // Mock: Accept any credentials for demo purposes
    if (credentials.username && credentials.password) {
      const user: User = {
        id: `user-${Date.now()}`,
        username: credentials.username,
        email: `${credentials.username}@example.com`,
        displayName: credentials.username,
        roles: ['user'],
      };

      const token = `token-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      this.currentUser = user;
      this.token = token;

      // Persist session
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));

      return {
        success: true,
        token,
        user,
      };
    }

    return {
      success: false,
      error: 'Invalid credentials',
    };
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    console.log('User logged out');
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
    localStorage.setItem('auth_token', newToken);
    
    return newToken;
  }

  async validateToken(token: string): Promise<boolean> {
    // Mock validation - in production, verify with auth server
    return token.startsWith('token-');
  }
}
