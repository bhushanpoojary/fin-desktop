<div align="center">

# FinDesktop

### The open-source desktop interop platform for financial & enterprise apps

An OpenFin / Finsemble / Glue42 alternative built on **Electron · React 19 · TypeScript · FDC3**.

[Quick Start](#quick-start) · [Features](#features) · [Roadmap](./fin-desktop/OPENFIN_PARITY_ROADMAP.md) · [Docs](./fin-desktop/docs/README.md) · [Contributing](./.github/CONTRIBUTING.md)

</div>

---

FinDesktop lets you run multiple web apps together in one desktop container with **shared
context (FDC3)**, **colored channels**, **intents**, **window docking**, **notifications**,
and **theming** — all behind a pluggable "Core vs Customer" architecture so you can customize
without forking.

## Why FinDesktop?

| | FinDesktop | OpenFin / Finsemble / Glue42 |
|---|---|---|
| License cost | **Free & open source (MIT)** | Per-seat commercial license |
| Platform | Windows · macOS · Linux | Primarily Windows |
| Standards | FDC3 (→ 2.0) | FDC3 |
| Customization | Pluggable providers, no fork | Varies |
| Web-first mode | Planned | Limited |

See the full competitive plan in [OPENFIN_PARITY_ROADMAP.md](./fin-desktop/OPENFIN_PARITY_ROADMAP.md).

## Features

- **FDC3 interop** — context broadcasting, intents, app directory, intent resolver
- **Finsemble-style channels** — colored user channels with a visual picker
- **Multi-window workspace** — docking, layout persistence, system tray
- **Notification center** — toasts with action handlers and history
- **Pluggable providers** — auth, theme, branding, notifications, channels
- **Theming** — CSS-variable driven, Bloomberg-inspired dark theme

## Quick start

```bash
git clone https://github.com/bhushanpoojary/fin-desktop.git
cd fin-desktop/fin-desktop
npm install
npm run dev     # Vite renderer + Electron shell with HMR
```

> The application code lives in the [`fin-desktop/`](./fin-desktop) subfolder. The
> [`FinDesktop-Website`](https://github.com/bhushanpoojary) repo hosts the docs/marketing site.

## Repository layout

```
.
├── fin-desktop/        # The FinDesktop platform (Electron + React app)
├── .github/            # Community health files, issue templates, CI
└── LICENSE             # MIT
```

## Contributing

We welcome contributions! Start with [CONTRIBUTING.md](./.github/CONTRIBUTING.md) and the
[Code of Conduct](./.github/CODE_OF_CONDUCT.md). Found a security issue? See
[SECURITY.md](./.github/SECURITY.md).

## License

[MIT](./LICENSE) © FinDesktop contributors
