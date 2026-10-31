# FinDesktop — AI Handoff / What's Left

> Status note for the next AI agent. Last updated 2026-11-01. The authoritative checklist is
> [OPENFIN_PARITY_ROADMAP.md](./OPENFIN_PARITY_ROADMAP.md) — this file summarizes conventions and
> the remaining work so you can pick up quickly.

## Repo layout
- **Git root:** `C:/repo/react/fin-desktop` (has `.github/`, `LICENSE`).
- **Project:** `C:/repo/react/fin-desktop/fin-desktop` (run all `npm` commands here).
- Electron main is CommonJS `.cjs` under `electron/` (loaded directly, no build step).

## Validation gates (must stay green before every commit)
```
npm run typecheck        # tsc -b
npm run test             # vitest  (~490 passing / 6 skipped)
npm run lint             # eslint  (0 errors + 84 tracked warnings baseline)
npm run build            # vite
node --check electron/<file>.cjs   # after editing any electron cjs file
```

## House conventions (follow these)
- TS strict + `erasableSyntaxOnly`: **no** parameter properties, **no** enums (use `const` objects +
  explicit field declarations), `import type`, no unused locals/params.
- **Pattern per feature:** pure framework-agnostic model in `src/<area>/` + an injectable boundary
  (so it's testable with fakes) + `__tests__/` + a GUI demo in `src/examples/<Name>Demo.tsx(.css)`.
- **Register every demo in 3 places:** `src/main.tsx` (`?test=<id>` route),
  `src/examples/demoRegistry.ts` (gallery + floating launcher), `electron/demoMenu.cjs` (native menu).
- Keep lint at the **84-warning baseline**. Avoid `Math.random()` in component/hook bodies
  (`react-hooks/purity`). Mutating a `useMemo`/`useState` value warns (`react-hooks/immutability`);
  reading `useRef.current` in render warns (`react-hooks/refs`). For intentional demo-only mutation,
  keep `useMemo` + a single `// eslint-disable-next-line react-hooks/immutability`.
- Commit per unit: validate → update the roadmap → `git add -A; git commit; git push origin main`.
  PowerShell flags git's stderr progress as `NativeCommandError` even on success — verify via the
  `old..new  main -> main` line or `git status -sb`.

## Testing gotchas
- `ChannelImpl` context handlers are called with **one** arg (no metadata); intent handlers get
  `{ source }`. Don't assert `expect.anything()` for a 2nd context-handler arg.
- `IntentResolution` now carries a `getResult` function — assert with `toMatchObject`, not `toEqual`.

## Done (high level)
- **Phase 1** platform core + real `WebContentsView` wiring (mostly).
- **Phase 2** FDC3: engine, channels (user/app/private), cross-window transport, inspector,
  **intents-with-results (`getResult`)**, `getAppMetadata`, `open`/`findInstances`, targeted
  `raiseIntent`, **interop override** hooks. *(Conformance suite + resolver UI still open.)*
- **Phase 3** workspace components: command palette, dock, app store, browser, notifications — **complete**.
- **Phase 4** manifest model/load/launch, deep-link parser, **auto-update model** (channels + staged
  rollout + rollback), **self-diagnostics** (`--diagnostics`), **semver range** helpers.
- **Phase 5** security policy + domain enforcement + secure tokens + OAuth2-PKCE.
- **Phase 6** messaging: IAB, Channels RPC, external connections, clipboard, hotkeys, drag-drop — core complete.
- **Phase 7** enterprise — **complete except P3 admin console**: structured logging + **rotating file
  sink**, analytics + opt-in/redaction, **crash reporting**, **system health/process explorer**,
  **remote config + feature flags**, **group policy**, **audit trail**.
- **Phase 8** SDK surface + mock platform/fdc3; **CLI arg parser** foundation.
- Cross-cutting: demo gallery + floating launcher + Electron Demos menu; `src/util/backoff.ts`.

## What's left (suggested next, roughly by value)
1. **Phase 2 FDC3 conformance** — run/pass the official FDC3 2.0 conformance suite; result-channel
   helpers; a real intent-resolver UI. *(Version negotiation done: `src/interop/fdc3/versionNegotiation.ts`.)*
2. **Phase 4 deployment** — wire `electron-updater` to the pure update model; OS protocol registration
   for deep links; installer generation (NSIS/MSI, DMG, AppImage); silent/enterprise install flags.
3. **Phase 8 DX** — publish `@findesktop/sdk` + `@findesktop/fdc3` npm packages (package.json/exports/
   build); flesh out the CLI (`init`/`dev`/`package`) — arg parser + **command router** exist
   (`src/cli/args.ts`, `src/cli/commands.ts`); still need bin wiring + scaffolding actions; starter
   templates; API docs.
4. **Phase 5 security** — runtime permission prompt UI; CSP headers on Views; context-isolation
   audit. *(Manifest signature verification done: `src/security/manifestSignature.ts`; policy +
   domain allow-list + secure tokens + OAuth2-PKCE already done.)*
5. **Phase 6 P3** — native window embedding; Office/Excel bridge; language client stubs (.NET/Python/Java).
6. **Phase 7 P3** — admin console / management plane.
7. **Phase 9/10** — website & community polish; differentiators.

## How to pick up
- Read the target phase section in `OPENFIN_PARITY_ROADMAP.md` (items are annotated with the module
  that implements them). `[ ]` = todo, `[~]` = partial, `[x]` = done.
- Mirror an existing module (e.g. `src/update/`, `src/health/`) for structure, tests, and demo wiring.
