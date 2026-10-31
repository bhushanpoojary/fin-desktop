# Security Policy

## Supported Versions

FinDesktop is in active early development. Security fixes are applied to the `main` branch.
Until a `1.0` release, only the latest `main` is officially supported.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, report them privately via GitHub's
[private vulnerability reporting](https://github.com/bhushanpoojary/fin-desktop/security/advisories/new)
(Security → Advisories → Report a vulnerability).

Please include:

- A description of the vulnerability and its impact
- Steps to reproduce (proof-of-concept if possible)
- Affected version / commit
- Any suggested remediation

We aim to acknowledge reports within **5 business days** and provide a remediation timeline
after triage.

## Scope & known limitations

FinDesktop is a desktop container that runs web applications. Note the following during early
development:

- The **default authentication provider** is a demo (accepts any credentials) and is **not for
  production**. It no longer persists the session token in plaintext — the token is held in a
  pluggable `SecureTokenStore` (in-memory by default; inject an OS-keychain store to persist).
  Production OAuth 2.0 / OIDC + PKCE helpers and a `TokenManager` ship in `src/security/auth/`.
- A **permissions / content-security model** is implemented in `src/security/` (capability
  policy + domain allow-lists, enforced by the Platform runtime). Still, only load applications
  and app directories you trust.

## Disclosure

We follow coordinated disclosure. We will credit reporters (unless anonymity is requested)
once a fix is released.
