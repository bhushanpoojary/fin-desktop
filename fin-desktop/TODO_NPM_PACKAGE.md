# TODO: Future NPM Package Migration

This document tracks tasks for migrating FinDesktop core to an NPM package.

---

## Goal

Publish FinDesktop core as `@bhushan/fin-desktop-core` on NPM, enabling:
- Clean separation of core and customer code
- Versioned releases
- No git merge conflicts for customers
- Multiple customer projects sharing the same core

---

## Phase 1: Preparation (Current)

- [x] Create core layer architecture
- [x] Define stable interfaces
- [x] Create default implementations
- [x] Create extension examples
- [x] Document architecture
- [ ] Write comprehensive tests for all interfaces
- [ ] Create migration guide for existing codebases
- [ ] Set up CI/CD pipeline

---

## Phase 2: Package Setup

### Tasks

- [ ] Create NPM organization: `@bhushan` or `@findesktop`
- [ ] Set up package.json for the core package
  ```json
  {
    "name": "@bhushan/fin-desktop-core",
    "version": "1.0.0",
    "main": "./dist/index.js",
    "types": "./dist/index.d.ts",
    "exports": {
      ".": "./dist/index.js",
      "./interfaces": "./dist/interfaces/index.js",
      "./components": "./dist/components/index.js",
      "./defaults": "./dist/defaults/index.js"
    }
  }
  ```

- [ ] Set up TypeScript build configuration
  ```json
  {
    "compilerOptions": {
      "declaration": true,
      "declarationMap": true,
      "outDir": "./dist"
    }
  }
  ```

- [ ] Configure bundler (Rollup or tsup)
- [ ] Set up package exports for tree-shaking
- [ ] Create publish workflow

---

## Phase 3: Documentation

### Tasks

- [ ] Create package README.md with:
  - Installation instructions
  - Quick start guide
  - API documentation
  - Migration from git-based approach

- [ ] Set up documentation website (e.g., VitePress)
  - Getting Started
  - API Reference
  - Extension Guides
  - Examples
  - Migration Guides

- [ ] Create example projects:
  - [ ] Minimal example
  - [ ] Full-featured example
  - [ ] Custom auth example
  - [ ] Multi-tenant example

---

## Phase 4: Breaking Changes Policy

### Establish Semver Contract

**Major (x.0.0)**: Breaking changes to interfaces
- Removing methods from interfaces
- Changing method signatures
- Removing required properties

**Minor (0.x.0)**: Backwards-compatible additions
- Adding optional methods to interfaces
- Adding new interfaces
- Adding new components

**Patch (0.0.x)**: Bug fixes
- Fixing bugs in default implementations
- Documentation updates
- Performance improvements

### Deprecation Policy

Before removing any interface method:
1. Mark as `@deprecated` in JSDoc
2. Keep for at least 2 major versions
3. Provide migration path in docs
4. Log console warning when used

Example:
```typescript
export interface IAuthProvider {
  /**
   * @deprecated Use login() instead. Will be removed in v3.0.0
   */
  authenticate?(): Promise<void>;
  
  login(): Promise<void>;
}
```

---

## Phase 5: Testing Strategy

### Unit Tests

- [ ] Test all default implementations
- [ ] Test all core components
- [ ] Test configuration helpers
- [ ] Test error handling

### Integration Tests

- [ ] Test interface contracts
- [ ] Test provider initialization
- [ ] Test provider switching
- [ ] Test lifecycle hooks

### Type Tests

- [ ] Verify TypeScript types are correct
- [ ] Test that custom implementations type-check
- [ ] Test that all exports are accessible

---

## Phase 6: Release Process

### Pre-release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] Changelog written
- [ ] Version bumped
- [ ] Git tag created
- [ ] NPM package built
- [ ] Package tested in example project

### Release Workflow

```bash
# 1. Update version
npm version major|minor|patch

# 2. Build package
npm run build

# 3. Run tests
npm test

# 4. Publish to NPM
npm publish --access public

# 5. Create GitHub release
gh release create v1.0.0
```

### Automated CI/CD

```yaml
# .github/workflows/publish.yml
name: Publish Package

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## Phase 7: Customer Migration

### Migration Script

Create a script to help customers migrate:

```bash
#!/bin/bash
# migrate-to-npm.sh

echo "Migrating FinDesktop to NPM package..."

# 1. Remove core folder
git rm -r src/core

# 2. Install NPM package
npm install @bhushan/fin-desktop-core

# 3. Update imports (using sed or a Node script)
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i \
  's|from ["\x27]../core/|from ["\x27]@bhushan/fin-desktop-core|g'

echo "Migration complete! Please test your application."
```

### Migration Guide

Document:
1. How to remove src/core from repo
2. How to install NPM package
3. How to update imports
4. How to update configuration
5. Common issues and solutions

---

## Phase 8: Ecosystem

### Additional Packages

Consider creating:

- [ ] `@bhushan/fin-desktop-react` - React hooks and components
- [ ] `@bhushan/fin-desktop-testing` - Testing utilities
- [ ] `@bhushan/fin-desktop-cli` - CLI for scaffolding
- [ ] Extension packages:
  - `@bhushan/fin-desktop-auth-oauth`
  - `@bhushan/fin-desktop-auth-saml`
  - `@bhushan/fin-desktop-notifications-slack`
  - etc.

### Community Extensions

- [ ] Set up extension registry
- [ ] Create extension submission process
- [ ] Establish quality guidelines
- [ ] Create extension template

---

## Success Metrics

### Technical Metrics

- [ ] Core package < 100KB gzipped
- [ ] Type coverage > 95%
- [ ] Test coverage > 90%
- [ ] Zero TypeScript errors
- [ ] Build time < 30 seconds

### Adoption Metrics

- [ ] 10+ internal projects using it
- [ ] 5+ community extensions
- [ ] 100+ npm downloads/week
- [ ] <5 open issues on average

---

## Timeline

### Q1 2026
- Complete Phase 1-3
- Private beta with internal teams

### Q2 2026
- Complete Phase 4-6
- Public beta release

### Q3 2026
- Complete Phase 7-8
- Stable 1.0.0 release

### Ongoing
- Regular releases
- Community support
- New features

---

## Notes

### Package Naming Options

1. `@bhushan/fin-desktop-core` ✅ (Recommended)
2. `@findesktop/core`
3. `fin-desktop-core`
4. `@bhushan/findesktop`

### Consider These Patterns

- Peer dependencies for React/Electron
- Optional dependencies for integrations
- Separate runtime and types packages
- Provide both ESM and CJS builds

---

## Questions to Resolve

- [ ] Should we include React components in core or separate package?
- [ ] How to handle Electron-specific APIs?
- [ ] Should extensions be NPM packages too?
- [ ] What about versioning for extensions?
- [ ] Private NPM registry or public?
- [ ] Monorepo or separate repos per package?

---

## Resources

- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [TypeScript Package Publishing](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)

---

*Last Updated: December 2025*
*Next Review: Q1 2026*
