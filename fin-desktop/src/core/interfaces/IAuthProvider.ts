/**
 * IAuthProvider Interface
 * 
 * Public extension contract – do not break without major version bump.
 * 
 * This interface defines the authentication contract for FinDesktop.
 * Implement this interface to provide custom authentication logic.
 */

export interface IAuthProvider {
  /**
   * Initialize the authentication provider
   */
  initialize(): Promise<void>;

  /**
   * Authenticate a user with credentials
   * @param credentials User credentials
   * @returns Authentication token or user session
   */
  login(credentials: { username: string; password: string }): Promise<AuthResult>;

  /**
   * Log out the current user
   */
  logout(): Promise<void>;

  /**
   * Check if a user is currently authenticated
   */
  isAuthenticated(): boolean;

  /**
   * Get the current authenticated user
   */
  getCurrentUser(): User | null;

  /**
   * Refresh the authentication token
   */
  refreshToken(): Promise<string>;

  /**
   * Validate a token
   * @param token Token to validate
   */
  validateToken(token: string): Promise<boolean>;
}

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  roles: string[];
}

export interface AuthResult {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}
