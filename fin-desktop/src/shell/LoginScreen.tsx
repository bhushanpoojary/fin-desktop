/**
 * LoginScreen - Demo login form for FinDesktop
 *
 * Displays a username/password form and delegates authentication to the provided
 * IAuthProvider. Styling lives in LoginScreen.css; pass `branding` to brand it.
 */

import React, { useState } from 'react';
import type { FormEvent } from 'react';
import type { IAuthProvider, User } from '../core/interfaces/IAuthProvider';
import type { IProductBranding } from '../core/interfaces/IProductBranding';
import './LoginScreen.css';

export interface LoginScreenProps {
  authProvider: IAuthProvider;
  onLoginSuccess: (user: User) => void;
  branding?: IProductBranding;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  authProvider,
  onLoginSuccess,
  branding,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const productName = branding?.getProductName() ?? 'FinDesktop';
  const tagline = branding?.getTagline() ?? 'The open-source desktop interop platform';
  const logoUrl = branding?.getLogoUrl();
  const brandColors = branding?.getBrandColors();

  const containerStyle = brandColors
    ? ({
        ['--brand-primary']: brandColors.primary,
        ['--brand-accent']: brandColors.accent,
      } as React.CSSProperties)
    : undefined;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await authProvider.login({ username, password });

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-screen" style={containerStyle}>
      <div className="login-aurora" aria-hidden="true" />
      <div className="login-grid" aria-hidden="true" />

      <div className="login-card">
        <div className="login-brand">
          {logoUrl ? (
            <img className="login-logo" src={logoUrl} alt={`${productName} logo`} />
          ) : (
            <div className="login-logo-fallback" aria-hidden="true">
              {productName.charAt(0)}
            </div>
          )}
          <div className="login-brand-text">
            <h1 className="login-title">{productName}</h1>
            <p className="login-subtitle">{tagline}</p>
          </div>
        </div>

        <div className="login-demo-badge">
          <span className="login-demo-dot" aria-hidden="true" />
          Demo mode — any non-empty credentials sign you in
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-field">
            <span className="login-label">Username</span>
            <div className="login-input-wrap">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                placeholder="Enter your username"
                className="login-input"
                autoComplete="username"
                autoFocus
              />
            </div>
          </label>

          <label className="login-field">
            <span className="login-label">Password</span>
            <div className="login-input-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="Enter your password"
                className="login-input"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-toggle"
                onClick={() => setShowPassword((v) => !v)}
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="login-submit" disabled={isLoading}>
            {isLoading && <span className="login-spinner" aria-hidden="true" />}
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="login-footer">Secured by {productName}</p>
      </div>
    </div>
  );
};

export default LoginScreen;
