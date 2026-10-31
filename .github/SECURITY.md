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

- The **default authentication provider stores credentials in `localStorage` unencrypted** and
  is for demos only — **do not use it in production**. A production OAuth2/OIDC provider is on
  the [roadmap](../fin-desktop/OPENFIN_PARITY_ROADMAP.md) (Phase 5).
- A full **permissions / content-security model** is planned (Phase 5). Until then, only load
  applications and app directories you trust.

## Disclosure

We follow coordinated disclosure. We will credit reporters (unless anonymity is requested)
once a fix is released.
