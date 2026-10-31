# FinDesktop

> The open-source desktop interop platform for financial & enterprise apps — an OpenFin /
> Finsemble / Glue42 alternative built on Electron, React 19, TypeScript, and FDC3.

FinDesktop lets you run multiple web apps together in a single desktop container with shared
context (FDC3), colored channels, intents, docking, notifications, theming, and a pluggable
"Core vs Customer" architecture.

See the full build-out plan in [OPENFIN_PARITY_ROADMAP.md](./OPENFIN_PARITY_ROADMAP.md).

## Features

- **FDC3 interop** — context broadcasting, intents, app directory, intent resolver
- **Finsemble-style channels** — colored user channels with a visual picker
- **Multi-window workspace** — docking, layout persistence, system tray
- **Notification center** — toasts with action handlers and history
- **Pluggable providers** — auth, theme, branding, notifications, channels
- **Theming** — CSS-variable driven, Bloomberg-inspired dark theme

## Quick start

```bash
# from this folder (fin-desktop/fin-desktop)
npm install
npm run dev          # Vite renderer + Electron shell with HMR
```

Other useful scripts:

```bash
npm run build        # Production renderer build
npm run lint         # ESLint
npm run typecheck    # TypeScript type-check (no emit)
npm run test         # Unit tests (Vitest)
npm run test:watch   # Unit tests in watch mode
npm run dev:test-docking   # Launch the window-docking test harness
```

## Tech stack

| Area      | Tech |
|-----------|------|
| UI        | React 19, TypeScript 5.9 |
| Build     | Vite 7 |
| Desktop   | Electron 39 |
| Layout    | flexlayout-react |
| Testing   | Vitest, Testing Library, Playwright (E2E) |

## Project structure

```
src/
├── core/         # Framework core (interfaces, defaults, fdc3, channels, notifications) — do not modify
├── extensions/   # Your customizations (safe to modify)
├── config/       # Wiring: choose default vs custom providers
├── apps/         # Demo applications (trading blotter, news, market grid, …)
├── workspace/    # Window docking + layout persistence
├── shell/        # App shell, login, splash
├── ui/           # Shared UI (channel picker, notifications, intent resolver)
└── shared/       # Desktop API bridge + hooks

electron/         # Main process: windows, IPC bus, tray, preload
docs/             # Documentation index
```

Read [ARCHITECTURE.md](./ARCHITECTURE.md) for the Core vs Customer design, and
[docs/README.md](./docs/README.md) for the full documentation index.

## Contributing

Contributions welcome! See [CONTRIBUTING.md](../.github/CONTRIBUTING.md) and our
[Code of Conduct](../.github/CODE_OF_CONDUCT.md). Security issues: see
[SECURITY.md](../.github/SECURITY.md).

## License

[MIT](../LICENSE) © FinDesktop contributors
