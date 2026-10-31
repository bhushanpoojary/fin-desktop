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
- [x] Implement **Views** using Electron `WebContentsView` / `BrowserView` (not iframes) for isolation + performance — `WebContentsViewHost` adapter + interactive controller/stage demo (`npm run dev:platform`): drag app tiles in a React controller to split/tab **real OS web views** live via an IPC `window.platform` bridge
- [x] Implement **Layout engine** (tabbing + splitting) — pure immutable tree (`split`/`stack`) in `src/platform/layout/` with `computeLayout` bounds math + tests
- [x] Window can host multiple tabbed/split Views — `PlatformWindow` positions each stack's active View and hides the rest (tabbing) + splits
- [x] Programmatic API: `createView`, `closeView`, `reparentView`, `getLayout`, `applyLayout` — `addView`/`splitView`/`closeView`/`activateView`/`moveView`/`setBounds`/`applyLayout`/`getSnapshot`, fully unit-tested with a fake host
- [x] Platform lifecycle events (`platform-api-ready`, `window-created`, `view-attached`) — typed emitter: `window-created`/`window-closed`/`view-created`/`view-closed`/`layout-changed`

### 1.2 Snap, Dock & Group (OpenFin Snap & Dock)
- [x] Edge/snap-to-screen magnetism when dragging windows — `snapRect` + `detectDockZone`/`dockZoneBounds` in `src/platform/snap/` with tests
- [x] Window-to-window snapping (magnetic edges between app windows) — `snapRect` snaps to neighbour edges
- [x] Window grouping (move/resize as a unit) — `moveGroup`/`groupBounds`/`unionBounds` in `src/platform/dock/` with tests
- [x] Tab windows together (drag a window into another's tab strip) — center-drop tabifies into a pane; wired end-to-end to real views in the controller/stage demo
- [x] Visual drop zones / dock preview overlays while dragging — `computeDropTarget` region + preview rect, shown live in the Platform Playground and controller drag-dock
- [~] Undock / tear-out a tab into its own window — `tearOut` + layout `removeView`/`createRoot` support it; multi-window tear-out GUI pending
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
- [x] Save / restore named snapshots (workspaces) — `Platform.getSnapshot()` / `applySnapshot()` + `PlatformWindow.applyLayout()`; wired to Save/Restore buttons in the Playground and the real-windows controller
- [ ] Auto-restore last session on launch
- [x] Export/import workspace as JSON file — `serializeSnapshot` / `deserializeSnapshot` (versioned, validated); exposed as editable JSON in both demos
- [ ] Pluggable persistence backend (localStorage → IndexedDB → remote REST) via `ILayoutManager`
- [ ] Per-user cloud sync of workspaces (optional provider)

> **Phase 1 progress:** the framework-agnostic Platform core is complete and fully unit-tested in `src/platform/` (layout engine, snapshots, snap/dock geometry, window placement, runtime). It is now wired to real Electron `WebContentsView` windows via the `WebContentsViewHost` adapter + an IPC `window.platform` bridge, with two interactive demos: the renderer-only **Platform Playground** (`?test=platform`, launchable from the workspace Launcher) and the **controller/stage** real-windows demo (`npm run dev:platform`). Remaining: multi-window tear-out, frameless custom chrome, hotkeys/zoom, and Electron `screen`/placement runtime wiring.

---

## 🔌 Phase 2 — FDC3 2.0 Full Compliance & Interop (`P0`)

Current impl is custom Phase 1/2. Align to the **FDC3 2.0 standard** so third-party apps work out of the box.

### 2.1 Standards Compliance
- [~] Implement the full `fdc3` global API surface (`window.fdc3`) per FDC3 2.0 — installed on `window.fdc3` via `bootstrap.ts` over the desktop bus (broadcast / addContextListener / raiseIntent (+ targeted + results) / raiseIntentForContext / user channels / findIntent / getInfo / getAppMetadata / open / findInstances); live demo at `?test=fdc3`. Remaining: result-channel helpers + full resolver UI
- [~] `getInfo()`, `getAppMetadata()`, FDC3 version negotiation — `getInfo()` reports FDC3 2.0 and `getAppMetadata(appId)` returns public AppD metadata (name/title/description/version/publisher/icons/screenshots) from the directory, tested; version negotiation pending
- [x] Standard context types (`fdc3.instrument`, `fdc3.contact`, `fdc3.organization`, `fdc3.country`, etc.) — typed model + factories + guards in `src/interop/fdc3/context.ts` with tests
- [x] Standard intents (`ViewChart`, `ViewNews`, `ViewQuote`, `StartCall`, `StartChat`, `ViewContact`, etc.) — `Intents` constants + `isStandardIntent` in `src/interop/fdc3/intents.ts` with tests
- [x] `raiseIntentForContext()` (resolve intents from a context) — `DesktopAgent.raiseIntentForContext` resolves via the App Directory, tested
- [x] `addIntentListener` / `addContextListener` with result types (`IntentResult`, `Channel`) — listeners + `IntentResolution` done; **intents with results** implemented: handlers may return a `Context` or a `Channel`, and `raiseIntent(...).getResult()` resolves it (async-aware, first-handler wins), tested
- [ ] Pass the official **FDC3 Conformance Test Suite**

### 2.2 Channels (standards-based)
- [x] User channels (the colored channels — map existing impl to FDC3 user channels) — 8 default colored user channels in `InteropBroker`
- [x] App channels (`getOrCreateChannel`) — idempotent app channels, tested
- [x] Private channels (`createPrivateChannel`) for 1:1 streaming — unique private channels, tested
- [x] Channel `broadcast` / `addContextListener` / `getCurrentContext` fully spec-compliant — `ChannelImpl` with per-type caching + latest-context replay, tested
- [x] Cross-window + cross-process channel propagation via the bus — `Transport` abstraction + broker sync (memory transport for tests, `createBusTransport` adapter for the Electron bus); two brokers interop with no echo loops, and **replay-on-join** (a late-joining window pulls the channel's current context via a request/state handshake), all tested

### 2.3 Interop Broker (OpenFin Interop)
- [x] Central interop broker in main process (routes context/intents between all entities) — `InteropBroker` + `DesktopAgent` facade; two agents interop exactly like separate FDC3 apps (tested). Cross-process transport pending
- [x] Context linking between views by channel membership — `DesktopAgent` user-channel membership links context; joining replays cached context (tested)
- [x] Interop override API (customers can customize broker behavior) — `InteropOverride` hooks (`onBeforeBroadcast` / `onBeforeRaiseIntent`) let customers transform, redirect, or block broadcasts + intents before delivery; wired into the broker, tested
- [x] Interop debugging/inspector panel (see every context + intent flowing) — `InteropBroker.observe` / `DesktopAgent.observe` emit local + remote events; live `Fdc3Inspector` UI at `?test=fdc3-inspector`, tested

### 2.4 App Directory (FDC3 spec)
- [x] FDC3-compliant App Directory data model (`AppD` records v2) — `AppDirectoryApp` + `AppDirectory` in `src/interop/fdc3/appDirectory.ts` with `findIntent` / `findIntentsByContext` / `findAppsByContext`, tested
- [x] Load app directory from a remote REST endpoint (not just in-code registry) — `loadAppDirectory` / `AppDirectoryLoader` (injected `fetch`, bare-array or `{ applications }` payloads), tested
- [x] Support multiple app directories + merging — `mergeApps` + multi-source `AppDirectoryLoader` (dedupe by `appId`, later wins), tested
- [x] App metadata: icons, screenshots, intents, contexts, publisher, version — full AppD fields (appId/name/title/description/icons/**screenshots**/**publisher**/**version**/intents/contexts) modeled + surfaced via `getAppMetadata`, tested
- [x] Local + remote hybrid directory with caching — TTL cache in `AppDirectoryLoader` (cached within TTL, `refresh()` forces reload), tested

---

## 🧩 Phase 3 — Workspace Components (`P1`)

OpenFin Workspace ships Home, Dock, Store, Notifications, Browser. Build OSS equivalents.

### 3.1 Home / Launcher (search-first)
- [x] Global command palette / spotlight-style launcher (⌘/Ctrl+Space) — reusable `CommandPalette` (Ctrl/⌘+K) with keyboard nav + match highlighting; demo at `?test=palette`
- [x] Fuzzy search across apps, workspaces, intents, and custom providers — `fuzzyMatch` (substring + word-boundary scoring) + `SearchRegistry` aggregating ranked results across providers, tested
- [x] Pluggable search providers (apps, docs, actions, external data) — `SearchProvider` interface + `createListProvider`; registry aggregates/ranks all, tested
- [x] Recent + favorite apps — `UsageTracker` records frequency + recency, supports favorites, and boosts search ranking (favorites float to top); wired into `CommandPalette`, tested
- [x] Keyboard-first navigation — ↑/↓ to move, ⏎ to run, esc to close, type to filter

### 3.2 Dock / App Bar
- [x] Configurable dock (pinned apps, groups, dropdown menus) — `DockModel` holds pinned buttons, nested dropdown groups, and separators; demo at `?test=dock`
- [x] Custom buttons + actions (raise intent, open workspace, run function) — typed `DockAction` union (`launchApp`/`raiseIntent`/`openWorkspace`/`runFunction`/`openUrl`)
- [x] Dock position (top/bottom/left/right), auto-hide — `setPosition`/`orientation` + `autoHide`, live in the demo
- [x] Per-user dock customization + persistence — pin/unpin/reorder + running-app indicator (ephemeral); `serialize()`/`deserialize()` round-trip, tested

### 3.3 App Store / Catalog
- [x] Browsable catalog of apps from the app directory — `AppCatalog` wraps app-directory records + store metadata; demo at `?test=store`
- [x] Install / pin / launch from catalog — install/uninstall + pin (installs first; uninstall unpins) + launch, with per-user `serialize()`/`deserialize()`
- [x] Categories, tags, search, featured — derived category/tag facets, featured row, and fuzzy search with category/tag narrowing, tested
- [x] Private/enterprise catalog support — `private` apps hidden from browse/search unless `includePrivate` is set (enterprise toggle in demo)

### 3.4 Browser (multi-tab container)
- [x] Multi-tab browser window hosting Views (pages) — `BrowserModel` manages tabs + panes with per-tab back/forward history; demo at `?test=browser`
- [x] Tabs, split views, save page-layout as workspace — side-by-side `split()`/`unsplit()` panes + `toWorkspace()`/`fromWorkspace()` snapshot round-trip, tested
- [x] Per-tab FDC3 channel membership indicator — `setChannel` per tab with colored indicator in the tab strip + page
- [x] Address bar + navigation controls for arbitrary URLs — global/address bar `navigate` + back/forward with history truncation

### 3.5 Notifications Center (upgrade existing)
- [x] Dedicated notification center panel (history, grouped, filterable) — `NotificationStore` with newest-first history, `grouped()` by key, and filter by group/priority/unread/query; demo at `?test=notifications`
- [x] Priority levels + Do-Not-Disturb mode — low/normal/high/critical; DND suppresses delivery except critical (still retained in history)
- [x] Rich notifications (buttons, inputs, images, progress) — action buttons, reply inputs, image/emoji, and clamped `updateProgress`
- [x] Notification routing to FDC3 intents/actions — `act()` returns an FDC3 route (intent + context) for the notification or a specific button
- [x] Persistence + badge counts in tray/dock — `badgeCount()` (unread, non-dismissed) + `serialize()`/`deserialize()` round-trip
- [x] OS-native notification fallback — injectable `OsNotificationSink` used when no in-app `onToast` renderer is attached

---

## 📦 Phase 4 — Runtime, Manifest & Deployment (`P0`)

How apps get launched and how the platform is distributed.

- [x] **Application manifest** format (JSON) — declarative app/platform definition (OpenFin manifest parity) — typed `AppManifest`/`PlatformManifest` in `src/manifest/` (startup app, window options, runtime pin, declared permissions, platform snapshot) + `validateManifest` with path-tagged errors, tested
- [x] Launch platform/app from a manifest URL — `loadManifest(url, fetch)` + `launchManifest(platform, manifest)` spawns the window/startup view and **auto-derives the Platform `canOpenUrl` guard from the manifest's declared domains** (startup URL always allowed); restores a platform manifest's snapshot. Tested
- [~] **Deep linking** — custom protocol (`findesktop://` / `fins://`-style) to launch apps/workspaces — `parseDeepLink`/`buildDeepLink`/`handleDeepLink` in `src/deeplink/` (launch-manifest / launch-app / raise-intent, round-trip + dispatch), tested; OS protocol registration + runtime wiring pending
- [~] Runtime Version Manager concept — pin/select platform runtime version per manifest — `runtime.version` modeled + validated; version selection/switching pending
- [~] **Auto-update** (electron-updater): background download, staged rollout, rollback — pure update model in `src/update/`: semver parse/compare, `checkForUpdate` (version **channels** + **staged rollout** via deterministic per-machine bucket + mandatory override) and `UpdateController` (install + **rollback** over an injectable installer); demo at `?test=update`, tested. Remaining: electron-updater wiring + background download
- [ ] Installer generation per OS (NSIS/MSI, DMG, AppImage/deb/rpm)
- [ ] Silent/enterprise install flags + MSI for group policy deployment
- [ ] Offline/air-gapped install support
- [x] Health check / self-diagnostic command (`--diagnostics`) — `DiagnosticsRunner` in `src/diagnostics/` runs named checks (runtime-version / permission / connectivity builders), aggregates a worst-status report (thrown checks → fail), and `formatReport` renders CLI text; demo at `?test=diagnostics`, tested

---

## 🔐 Phase 5 — Security & Permissions (`P0`)

Enterprise adoption is impossible without a real security model.

- [x] **Permissions API** — per-app/per-domain capability grants (clipboard, notifications, filesystem, external process, etc.) — `Capabilities` + `PermissionPolicy` (grant/deny/revoke, per-app scoped) in `src/security/` with tests
- [~] Manifest-declared permissions + runtime prompts — `ManifestPermissions.request` + policy resolution (granted/denied/**prompt**) done; the runtime prompt UI is pending
- [x] Content security: domain allow-lists, CSP enforcement for Views — `matchDomain`/`isUrlAllowed` + `PermissionPolicy.isDomainAllowed`, **enforced in the Platform runtime** via an injectable `canOpenUrl` guard (blocked views throw; wired to the allow-list in the real `WebContentsView` demo), tested
- [ ] Secure context isolation audit (contextBridge only, no `nodeIntegration` in Views)
- [x] API security policy (which apps can call which platform APIs) — `PermissionPolicy.resolve/can` gates capabilities by admin defaults + manifest + runtime grants (documented precedence), tested
- [ ] Code signing + signature verification of manifests
- [x] Secrets handling — remove unencrypted credential storage from default auth (previously a known gap) — `DefaultAuthProvider` now keeps the session token in a pluggable `SecureTokenStore` (**in-memory by default — no plaintext on disk**; inject an OS-keychain store to persist); only the non-secret user profile is cached. Tested
- [x] Production-grade auth provider examples (OAuth2/OIDC/PKCE, SAML, SSO) — OAuth 2.0 Authorization Code + **PKCE** helpers in `src/security/auth/oauth2.ts` (auth URL, callback parse, token/refresh bodies, PKCE S256 verified against the RFC 7636 vector), tested
- [x] Token refresh + secure token storage (OS keychain/credential vault) — `TokenManager` auto-refreshes expiring tokens with **single-flight** de-duplication over a pluggable `SecureTokenStore`, tested
- [ ] Entitlements / license enforcement hooks
- [ ] Security documentation + threat model

---

## 📨 Phase 6 — Messaging & Integration APIs (`P1`)

- [x] **Inter-Application Bus (IAB)** — publish/subscribe + send (point-to-point), typed — `InterAppBus` in `src/messaging/`: topic subscriptions with per-sender filtering (`'*'` = any), `publish` broadcast + `send` point-to-point (delivery counts), `unsubscribeAll`; demo at `?test=messaging`, tested
- [x] **Channels API (provider/client)** — request/response RPC between apps (OpenFin `Channel`) — `ChannelBus`/`ChannelProvider`/`ChannelClient`: client→provider `dispatch`, provider→client `dispatch`/`publish`, async handlers, connection tracking + connect/disconnect events, tested
- [x] External connections — connect non-Electron apps (Node, Python, .NET, Java) via WebSocket/named-pipe adapter — `ExternalGateway`/`ExternalClient` over an injectable `DuplexConnection` (in-memory pair for tests) + a validated JSON wire protocol: hello/auth handshake, cross-boundary pub/sub + point-to-point send, and channel RPC `dispatch`; subscriptions cleaned up on disconnect; demo at `?test=external`, tested
- [ ] Language SDKs / client libs (JS/TS first, then .NET, Python, Java stubs)
- [ ] Native window embedding (dock external native windows into layouts) `P3`
- [ ] Office/Excel integration bridge `P3`
- [x] Clipboard API (read/write, formats) — `Clipboard` in `src/integration/` with multi-format write (`text/plain` + `text/html` + custom), `writeHtml` (derives plain text), change notifications, over an injectable `ClipboardBackend` (in-memory default; Electron/browser adapter plugs in); demo at `?test=integration`, tested
- [x] Global hotkey registration API — `HotkeyRegistry` parses accelerators (`CmdOrCtrl+Shift+K`, platform-resolved), normalizes equivalent spellings + key aliases to one signature, and dispatches via `handleKeyEvent` (DOM keydown / Electron `globalShortcut` adapter), tested
- [x] File drag-and-drop between apps — `DragManager` in `src/integration/`: typed drag payloads (items + files + source), format-aware drop targets (`'*'`/`'files'`/explicit), single active session, live accept/reject + hover state; bridges native drag events in the demo at `?test=dragdrop`, tested

---

## 📈 Phase 7 — Enterprise: Telemetry, Logging & Management (`P1`)

- [x] Structured logging to disk (rotating files) + log levels (extend existing `useLogger`) — `Logger` with levels, child/contextual loggers, and a pluggable `LogSink` in `src/telemetry/`; **`RotatingFileSink`** rotates by size into bounded backups (`app.log`/`app.1.log`…) over an injectable `LogFileSystem` (in-memory for tests; Node `fs` adapter plugs in); demo at `?test=logging`, tested
- [ ] Crash reporting / minidump collection (electron crashReporter)
- [x] Usage analytics API (app launches, intent flows, errors) with pluggable sink — `Telemetry` (`trackAppLaunch`/`trackIntent`/`trackError`) over a `TelemetrySink` (memory/console/custom), buffering + batch auto-flush, tested
- [x] Opt-in/opt-out telemetry + privacy controls — disabled-by-default no-op `track`, runtime `setEnabled`, recursive **PII redaction** of configured keys, tested
- [x] System health dashboard (memory/CPU per window, process explorer) — `HealthMonitor` in `src/health/`: classifies per-process CPU/memory against thresholds (ok/warn/critical), rolls up totals + overall status, bounded history, `top(n)` consumers, over an injectable `ProcessSampler` (Electron `getAppMetrics` adapter plugs in); demo at `?test=health`, tested
- [ ] Remote config / feature flags
- [ ] Group policy / centralized config management
- [ ] Audit trail for compliance (who did what, when)
- [ ] Admin console / management plane `P3`

---

## 🎨 Phase 8 — Developer Experience & SDK (`P1`)

An OSS OpenFin replacement lives or dies by DX.

- [~] Publish a versioned **`@findesktop/sdk`** npm package (typed client API) — public API surface built in `src/sdk/` (namespaced `fdc3`/`platform`/`manifest`/`deeplink`/`security` + `getFdc3`/`isInFinDesktop`), tested; npm package.json/publish wiring pending
- [~] Publish **`@findesktop/fdc3`** FDC3 API shim for apps — the compliant agent is exported via the SDK (`fdc3` namespace) + `window.fdc3`; separate published package pending
- [ ] CLI (`findesktop init`, `findesktop dev`, `findesktop package`) to scaffold apps
- [ ] App starter templates (React, Vue, Angular, vanilla)
- [ ] Hot-reload dev server integration for third-party apps
- [x] Interop/FDC3 **inspector devtool** (see contexts, intents, channels live) — `InteropBroker.observe` stream + `Fdc3Inspector` panel (`?test=fdc3-inspector`), local + remote events, tested
- [x] Mock platform for unit testing apps outside the container — `createMockFdc3` / `createMockFdc3Pair` / `createMockPlatform` + inspectable `MemoryPlatformHost` in `src/sdk/testing.ts`, tested
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
| 1 | Platform & window mgmt | P0 | ◧ Core done + wired to real WebContentsView windows (1.1 ✓, 1.2 mostly ✓) |
| 2 | FDC3 2.0 & interop | P0 | ◧ Core + transport + `window.fdc3` wired (demo `?test=fdc3`); full surface/conformance pending |
| 3 | Workspace components | P1 | ✓ Launcher + dock + app-store + browser + notifications-center all done |
| 4 | Runtime, manifest, deploy | P0 | ◧ Manifest model+load+launch + deep-link parser done; auto-update/installers/OS-protocol pending |
| 5 | Security & permissions | P0 | ◧ Policy + domain enforcement + secure tokens/OAuth2-PKCE done; prompts/CSP-headers/code-signing pending |
| 6 | Messaging & integration | P1 | ◧ IAB + Channels + external-connections + clipboard/hotkeys/drag-drop done; native embedding/Office bridge (P3) pending |
| 7 | Enterprise telemetry | P1 | ◧ Analytics + structured logger + opt-in/redaction done; file sink/crash/health pending |
| 8 | Developer experience/SDK | P1 | ◧ SDK public surface + mock platform/fdc3 done; npm packaging/CLI/docs pending |
| 9 | Website & community | P2 | ☐ Partial (website repo) |
| 10 | Differentiators | P2/P3 | ☐ Not started |

---

*Generated as the master build plan for turning FinDesktop into the leading open-source
OpenFin replacement. Update statuses as work lands; keep this file as the north star.*
