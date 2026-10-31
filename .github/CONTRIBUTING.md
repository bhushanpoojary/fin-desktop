# Contributing to FinDesktop

Thanks for your interest in making FinDesktop the best open-source OpenFin alternative! 🎉

## Ways to contribute

- **Report bugs** — open a [bug report](https://github.com/bhushanpoojary/fin-desktop/issues/new/choose)
- **Request features** — open a [feature request](https://github.com/bhushanpoojary/fin-desktop/issues/new/choose)
- **Improve docs** — fix typos, clarify guides, add examples
- **Write code** — pick an item from the [roadmap](../fin-desktop/OPENFIN_PARITY_ROADMAP.md) or a `good first issue`

## Development setup

The application lives in the `fin-desktop/` subfolder.

```bash
git clone https://github.com/bhushanpoojary/fin-desktop.git
cd fin-desktop/fin-desktop
npm install
npm run dev
```

### Useful scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Run renderer + Electron with HMR |
| `npm run build` | Production renderer build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type-check |
| `npm run test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright) |

## Architecture: Core vs Customer

FinDesktop separates framework code from customizations:

- **`src/core/`** — framework internals. Avoid changing these in feature PRs unless the PR is a core change.
- **`src/extensions/`** & **`src/config/`** — customization layer. Example/customer code goes here.

Read [ARCHITECTURE.md](../fin-desktop/ARCHITECTURE.md) before large changes.

## Pull request checklist

Before opening a PR, make sure:

- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run test` passes
- [ ] New logic has unit tests where practical
- [ ] Docs updated if behavior changed
- [ ] Commits follow [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `feat:`, `fix:`, `docs:`)

## Commit message format

We use Conventional Commits to drive the changelog:

```
feat(fdc3): add raiseIntentForContext support
fix(window): prevent crash when docking across monitors
docs(readme): clarify quick start
```

## Code of Conduct

By participating you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](../LICENSE).
