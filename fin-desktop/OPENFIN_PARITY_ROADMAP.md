# FinDesktop → Open-Source OpenFin Replacement: Master Roadmap

> **Mission:** Build the best open-source alternative to OpenFin / Finsemble / Glue42 — a
> standards-based desktop interop platform for financial and enterprise apps. This document is
> the single source of truth for the build-out. Check items off as they land.

**Legend:** `[ ]` = todo · `[~]` = in progress · `[x]` = done
**Priority tags:** `P0` critical / parity-blocker · `P1` high value · `P2` nice-to-have · `P3` long-term

---

## 📊 Where We Are Today (Baseline)

Already shipped (keep, harden, and standardize):

- [x] Electron multi-window shell (workspace + child app windows)
- [x] Inter-process message bus (IPC pub/sub, broadcast to all windows)
- [x] FDC3 Phase 1 — context broadcasting (`Fdc3ContextBus`)
- [x] FDC3 Phase 2 — intents + app directory + resolver dialog
- [x] Finsemble-style colored channels API + picker UI
- [x] Notification center (toasts, actions, history)
- [x] Auth/login framework (pluggable provider, demo localStorage impl)
- [x] Theme engine (CSS variables, Bloomberg-style dark theme)
- [x] System tray integration (minimize/restore, context menu)
- [x] Window docking demo + layout persistence (localStorage)
- [x] App launcher + app registry (14 demo apps)
- [x] "Core vs Customer" plugin architecture (interfaces/defaults/extensions)

**Biggest gaps vs OpenFin:** true Platform/Views API (BrowserView, not iframes), FDC3 2.0
full compliance + Interop broker, snap-&-dock window management, Workspace components
(Home/Dock/Store/Browser), runtime/manifest launching, security/permissions model,
auto-update, and enterprise telemetry.

---

## 🎯 Phase 0 — Foundations & Project Hygiene (`P0`)

Make the repo credible as an OSS product before adding features.

- [x] Rewrite root `README.md` (product pitch + quickstart) — root product README + project dev README
- [x] Add `LICENSE` (MIT) at the repo root
- [x] Add `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md` (under `.github/`)
- [x] Add issue + PR templates (`.github/ISSUE_TEMPLATE/`, `pull_request_template.md`)
- [~] Consolidate the 30+ scattered `*.md` files into a `docs/` site structure — index created at `docs/README.md`; physical move still pending
- [ ] Set up monorepo structure (core runtime vs apps vs SDK) — consider pnpm/npm workspaces
- [x] Add automated testing: Vitest (unit) + Playwright (E2E scaffold) — unit tests green (41 passing)
- [x] Add CI pipeline (GitHub Actions: lint, typecheck, test, build matrix win/mac/linux) — `.github/workflows/ci.yml`
- [x] Add `electron-builder` for packaging/installers — `electron-builder.yml` (prod main wiring pending, Phase 4)
- [x] Add code signing config (Windows + macOS notarization) placeholders — documented in `electron-builder.yml`
- [x] Introduce strict TypeScript config + ESLint rules across the repo — `typecheck` script green; lint baseline established
- [x] Define semantic versioning + changelog (`CHANGELOG.md`)
- [ ] Publish a public roadmap + milestones on GitHub

> **Phase 0 validation (all green locally):** `npm run test` · `npm run typecheck` · `npm run lint` (0 errors, 82 tracked warnings) · `npm run build`. Remaining: monorepo restructure, physical docs move, GitHub milestones, and burning down the 82 lint warnings (see ratchet note in `eslint.config.js`).

---

## 🏗️ Phase 1 — Platform & Window Management Core (`P0`)

This is the heart of an OpenFin replacement. Move from iframe windows to a real platform.

### 1.1 Platform API (OpenFin `Platform` equivalent)
- [x] Define `Platform` provider concept (owns windows, views, layouts, snapshots) — `Platform` / `PlatformWindow` in `src/platform/runtime/` driving an injectable `PlatformHost`
- [~] Implement **Views** using Electron `WebContentsView` / `BrowserView` (not iframes) for isolation + performance — runtime brain + host boundary done; Electron `WebContentsView` adapter pending (GUI wiring)
- [x] Implement **Layout engine** (tabbing + splitting) — pure immutable tree (`split`/`stack`) in `src/platform/layout/` with `computeLayout` bounds math + tests
- [x] Window can host multiple tabbed/split Views — `PlatformWindow` positions each stack's active View and hides the rest (tabbing) + splits
- [x] Programmatic API: `createView`, `closeView`, `reparentView`, `getLayout`, `applyLayout` — `addView`/`splitView`/`closeView`/`activateView`/`moveView`/`setBounds`/`applyLayout`/`getSnapshot`, fully unit-tested with a fake host
- [x] Platform lifecycle events (`platform-api-ready`, `window-created`, `view-attached`) — typed emitter: `window-created`/`window-closed`/`view-created`/`view-closed`/`layout-changed`

### 1.2 Snap, Dock & Group (OpenFin Snap & Dock)
- [x] Edge/snap-to-screen magnetism when dragging windows — `snapRect` + `detectDockZone`/`dockZoneBounds` in `src/platform/snap/` with tests
- [x] Window-to-window snapping (magnetic edges between app windows) — `snapRect` snaps to neighbour edges
- [x] Window grouping (move/resize as a unit) — `moveGroup`/`groupBounds`/`unionBounds` in `src/platform/dock/` with tests
- [~] Tab windows together (drag a window into another's tab strip) — `computeDropTarget` center region → tabify (`addView`); GUI drag wiring pending
- [x] Visual drop zones / dock preview overlays while dragging — `computeDropTarget` returns region + preview rect (maps to `splitStack`/`addView`) with tests
- [~] Undock / tear-out a tab into its own window — `tearOut` + layout `removeView`/`createRoot` support it; GUI drag wiring pending
- [~] Multi-monitor aware snapping (respect display boundaries + DPI) — `pickMonitorForRect`/`pickMonitorForPoint` provide the monitor context; snap integration pending

### 1.3 Window Capabilities
- [ ] Frameless windows with custom chrome (title bar, min/max/close, drag region)
- [ ] Always-on-top toggle
- [~] Aspect-ratio lock + min/max size constraints — `applyAspectRatio` / `constrainSize` in `src/platform/window/` with tests; runtime wiring pending
- [ ] Window animations (open/close/minimize transitions)
- [ ] Window zoom controls + zoom persistence
- [ ] Hotkeys per-window and global (register/unregister)
- [~] Monitor/display info API (`getMonitorInfo`, move to monitor N) — pure `pickMonitorForPoint` / `pickMonitorForRect` done; Electron `screen` wiring pending
- [~] Smart window placement (cascade, center, remember last position) — `cascade` / `centerIn` / `clampToWorkArea` done; remember-last pending

### 1.4 Snapshots & Session Persistence
- [x] Snapshot = full serializable platform state (windows + views + layouts + bounds) — `PlatformSnapshot` model in `src/platform/snapshot/` with validated serialize/deserialize + tests
- [~] Save / restore named snapshots (workspaces) — `Platform.getSnapshot()` / `applySnapshot()` fully round-trip (tested); named storage/UI pending
- [ ] Auto-restore last session on launch
- [x] Export/import workspace as JSON file — `serializeSnapshot` / `deserializeSnapshot` (versioned, validated)
- [ ] Pluggable persistence backend (localStorage → IndexedDB → remote REST) via `ILayoutManager`
- [ ] Per-user cloud sync of workspaces (optional provider)

> **Phase 1 progress:** the framework-agnostic Platform core has landed in `src/platform/` — layout-tree engine, snapshot model, and snap/dock geometry — all pure and unit-tested (43 new tests, 84 total passing). Next: the Electron `WebContentsView` runtime that consumes these (real Views, programmatic API, drag/drop overlays, multi-monitor wiring).

---

## 🔌 Phase 2 — FDC3 2.0 Full Compliance & Interop (`P0`)

Current impl is custom Phase 1/2. Align to the **FDC3 2.0 standard** so third-party apps work out of the box.

### 2.1 Standards Compliance
- [ ] Implement the full `fdc3` global API surface (`window.fdc3`) per FDC3 2.0
- [ ] `getInfo()`, `getAppMetadata()`, FDC3 version negotiation
- [ ] Standard context types (`fdc3.instrument`, `fdc3.contact`, `fdc3.organization`, `fdc3.country`, etc.)
- [ ] Standard intents (`ViewChart`, `ViewNews`, `ViewQuote`, `StartCall`, `StartChat`, `ViewContact`, etc.)
- [ ] `raiseIntentForContext()` (resolve intents from a context)
- [ ] `addIntentListener` / `addContextListener` with result types (`IntentResult`, `Channel`)
- [ ] Pass the official **FDC3 Conformance Test Suite**

### 2.2 Channels (standards-based)
- [ ] User channels (the colored channels — map existing impl to FDC3 user channels)
- [ ] App channels (`getOrCreateChannel`)
- [ ] Private channels (`createPrivateChannel`) for 1:1 streaming
- [ ] Channel `broadcast` / `addContextListener` / `getCurrentContext` fully spec-compliant
- [ ] Cross-window + cross-process channel propagation via the bus

### 2.3 Interop Broker (OpenFin Interop)
- [ ] Central interop broker in main process (routes context/intents between all entities)
- [ ] Context linking between views by channel membership
- [ ] Interop override API (customers can customize broker behavior)
- [ ] Interop debugging/inspector panel (see every context + intent flowing)

### 2.4 App Directory (FDC3 spec)
- [ ] FDC3-compliant App Directory data model (`AppD` records v2)
- [ ] Load app directory from a remote REST endpoint (not just in-code registry)
- [ ] Support multiple app directories + merging
- [ ] App metadata: icons, screenshots, intents, contexts, publisher, version
- [ ] Local + remote hybrid directory with caching

---

## 🧩 Phase 3 — Workspace Components (`P1`)

OpenFin Workspace ships Home, Dock, Store, Notifications, Browser. Build OSS equivalents.

### 3.1 Home / Launcher (search-first)
- [ ] Global command palette / spotlight-style launcher (⌘/Ctrl+Space)
- [ ] Fuzzy search across apps, workspaces, intents, and custom providers
- [ ] Pluggable search providers (apps, docs, actions, external data)
- [ ] Recent + favorite apps
- [ ] Keyboard-first navigation

### 3.2 Dock / App Bar
- [ ] Configurable dock (pinned apps, groups, dropdown menus)
- [ ] Custom buttons + actions (raise intent, open workspace, run function)
- [ ] Dock position (top/bottom/left/right), auto-hide
- [ ] Per-user dock customization + persistence

### 3.3 App Store / Catalog
- [ ] Browsable catalog of apps from the app directory
- [ ] Install / pin / launch from catalog
- [ ] Categories, tags, search, featured
- [ ] Private/enterprise catalog support

### 3.4 Browser (multi-tab container)
- [ ] Multi-tab browser window hosting Views (pages)
- [ ] Tabs, split views, save page-layout as workspace
- [ ] Per-tab FDC3 channel membership indicator
- [ ] Address bar + navigation controls for arbitrary URLs

### 3.5 Notifications Center (upgrade existing)
- [ ] Dedicated notification center panel (history, grouped, filterable)
- [ ] Priority levels + Do-Not-Disturb mode
- [ ] Rich notifications (buttons, inputs, images, progress)
- [ ] Notification routing to FDC3 intents/actions
- [ ] Persistence + badge counts in tray/dock
- [ ] OS-native notification fallback

---

## 📦 Phase 4 — Runtime, Manifest & Deployment (`P0`)

How apps get launched and how the platform is distributed.

- [ ] **Application manifest** format (JSON) — declarative app/platform definition (OpenFin manifest parity)
- [ ] Launch platform/app from a manifest URL
- [ ] **Deep linking** — custom protocol (`findesktop://` / `fins://`-style) to launch apps/workspaces
- [ ] Runtime Version Manager concept — pin/select platform runtime version per manifest
- [ ] **Auto-update** (electron-updater): background download, staged rollout, rollback
- [ ] Installer generation per OS (NSIS/MSI, DMG, AppImage/deb/rpm)
- [ ] Silent/enterprise install flags + MSI for group policy deployment
- [ ] Offline/air-gapped install support
- [ ] Health check / self-diagnostic command (`--diagnostics`)

---

## 🔐 Phase 5 — Security & Permissions (`P0`)

Enterprise adoption is impossible without a real security model.

- [ ] **Permissions API** — per-app/per-domain capability grants (clipboard, notifications, filesystem, external process, etc.)
- [ ] Manifest-declared permissions + runtime prompts
- [ ] Content security: domain allow-lists, CSP enforcement for Views
- [ ] Secure context isolation audit (contextBridge only, no `nodeIntegration` in Views)
- [ ] API security policy (which apps can call which platform APIs)
- [ ] Code signing + signature verification of manifests
- [ ] Secrets handling — remove unencrypted credential storage from default auth (currently a known gap)
- [ ] Production-grade auth provider examples (OAuth2/OIDC/PKCE, SAML, SSO)
- [ ] Token refresh + secure token storage (OS keychain/credential vault)
- [ ] Entitlements / license enforcement hooks
- [ ] Security documentation + threat model

---

## 📨 Phase 6 — Messaging & Integration APIs (`P1`)

- [ ] **Inter-Application Bus (IAB)** — publish/subscribe + send (point-to-point), typed
- [ ] **Channels API (provider/client)** — request/response RPC between apps (OpenFin `Channel`)
- [ ] External connections — connect non-Electron apps (Node, Python, .NET, Java) via WebSocket/named-pipe adapter
- [ ] Language SDKs / client libs (JS/TS first, then .NET, Python, Java stubs)
- [ ] Native window embedding (dock external native windows into layouts) `P3`
- [ ] Office/Excel integration bridge `P3`
- [ ] Clipboard API (read/write, formats)
- [ ] Global hotkey registration API
- [ ] File drag-and-drop between apps

---

## 📈 Phase 7 — Enterprise: Telemetry, Logging & Management (`P1`)

- [ ] Structured logging to disk (rotating files) + log levels (extend existing `useLogger`)
- [ ] Crash reporting / minidump collection (electron crashReporter)
- [ ] Usage analytics API (app launches, intent flows, errors) with pluggable sink
- [ ] Opt-in/opt-out telemetry + privacy controls
- [ ] System health dashboard (memory/CPU per window, process explorer)
- [ ] Remote config / feature flags
- [ ] Group policy / centralized config management
- [ ] Audit trail for compliance (who did what, when)
- [ ] Admin console / management plane `P3`

---

## 🎨 Phase 8 — Developer Experience & SDK (`P1`)

An OSS OpenFin replacement lives or dies by DX.

- [ ] Publish a versioned **`@findesktop/sdk`** npm package (typed client API)
- [ ] Publish **`@findesktop/fdc3`** FDC3 API shim for apps
- [ ] CLI (`findesktop init`, `findesktop dev`, `findesktop package`) to scaffold apps
- [ ] App starter templates (React, Vue, Angular, vanilla)
- [ ] Hot-reload dev server integration for third-party apps
- [ ] Interop/FDC3 **inspector devtool** (see contexts, intents, channels live)
- [ ] Mock platform for unit testing apps outside the container
- [ ] Comprehensive API reference docs (TypeDoc) + guides + recipes
- [ ] Interactive sandbox / playground site (tie into FinDesktop-Website)
- [ ] Example gallery (trading blotter, chart, news, chat, OMS)
- [ ] Migration guide: "Coming from OpenFin/Finsemble/Glue42"

---

## 🌐 Phase 9 — Website & Community (`P2`)

Leverage the existing `FinDesktop-Website` repo.

- [ ] Landing page with clear OpenFin-alternative positioning + comparison table
- [ ] Live interactive demo (WebContainer or hosted)
- [ ] Full docs site (getting started, concepts, API, how-tos, FAQ) — partially started
- [ ] Blog / changelog
- [ ] Discord/Slack community + GitHub Discussions
- [ ] Showcase / "who's using it"
- [ ] Contributor onboarding + good-first-issues

---

## 🏁 Phase 10 — Differentiators (Win beyond parity) (`P2`/`P3`)

Where OSS can beat the incumbents.

- [ ] **Zero-license-cost** positioning (vs per-seat OpenFin licensing) — headline value
- [ ] First-class **web-first** mode (run the same apps in a browser tab, no install)
- [ ] **Cross-platform** parity (Windows, macOS, Linux — OpenFin is Win-centric)
- [ ] AI-assisted workspace (natural-language "open my morning trading layout")
- [ ] AI copilot for app interop (auto-suggest intents / context routing)
- [ ] Pluggable **everything** (auth, storage, directory, telemetry, theming) — already the architecture strength
- [ ] Theming marketplace + light/high-contrast/accessible themes
- [ ] Built-in **accessibility** (WCAG, screen-reader, keyboard-only) as a feature
- [ ] Performance budget: fast cold start, low memory per View
- [ ] Container-agnostic FDC3: interop with OpenFin/Finsemble apps where possible

---

## 🧭 Suggested Execution Order (first 5 milestones)

1. **M1 – Credible OSS base:** Phase 0 (README, license, CI, packaging, tests)
2. **M2 – Real platform:** Phase 1.1 Views + 1.2 snap/dock + 1.4 snapshots
3. **M3 – Standards interop:** Phase 2 FDC3 2.0 + Interop broker + REST app directory
4. **M4 – Workspace UX:** Phase 3 Home + Dock + Notifications upgrade
5. **M5 – Enterprise-ready:** Phase 4 manifest/auto-update + Phase 5 security/permissions

After M5 you have a genuinely deployable OpenFin alternative. Phases 6–10 broaden reach and
build the moat.

---

## ✅ Progress Tracker

| Phase | Theme | Priority | Status |
|------|-------|----------|--------|
| 0 | Foundations & hygiene | P0 | ☑ Mostly done (CI, tests, licensing, packaging scaffold) |
| 1 | Platform & window mgmt | P0 | ☐ In progress (pure core: layout/snapshot/snap done) |
| 2 | FDC3 2.0 & interop | P0 | ☐ Partial (Phase 1/2 custom) |
| 3 | Workspace components | P1 | ☐ Partial (notifications/launcher) |
| 4 | Runtime, manifest, deploy | P0 | ☐ Not started |
| 5 | Security & permissions | P0 | ☐ Not started |
| 6 | Messaging & integration | P1 | ☐ Partial (IPC bus) |
| 7 | Enterprise telemetry | P1 | ☐ Partial (logging) |
| 8 | Developer experience/SDK | P1 | ☐ Not started |
| 9 | Website & community | P2 | ☐ Partial (website repo) |
| 10 | Differentiators | P2/P3 | ☐ Not started |

---

*Generated as the master build plan for turning FinDesktop into the leading open-source
OpenFin replacement. Update statuses as work lands; keep this file as the north star.*
