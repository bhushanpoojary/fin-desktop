# Git Strategy for FinDesktop Customizations

This document outlines recommended git strategies for managing FinDesktop customizations.

---

## Strategy 1: Single Repository with Protected Extensions

Keep everything in one repository but protect your customizations from being overwritten.

### Recommended .gitignore Additions

Add this to your `.gitignore`:

```gitignore
# FinDesktop: Protect customer customizations
# Uncomment these lines if you want to keep extensions private
# src/extensions/**
# !src/extensions/README.md
# !src/extensions/index.ts

# FinDesktop: Protect configuration
# Uncomment if you have sensitive configuration
# src/config/FinDesktopConfig.ts
```

### Git Workflow

```bash
# Update core from upstream
git pull origin main

# Your extensions in src/extensions/ are ignored
# Your config in src/config/ might need merge resolution
```

**Pros:**
- ✅ Simple setup
- ✅ Easy to get core updates

**Cons:**
- ❌ Need to be careful with .gitignore
- ❌ Risk of accidentally committing to wrong branch

---

## Strategy 2: Branch-Based Separation

Use git branches to separate core and customizations.

### Branch Structure

```
main            ← Track upstream FinDesktop
  ↓ merge
custom          ← Your customizations
  ↓ merge
production      ← Deployed version
```

### Workflow

```bash
# Get core updates
git checkout main
git pull upstream main

# Merge into custom branch
git checkout custom
git merge main

# Resolve any conflicts (usually just FinDesktopConfig.ts)
# Test your customizations

# Deploy
git checkout production
git merge custom
```

**Pros:**
- ✅ Clear separation of concerns
- ✅ Easy to see what you've customized
- ✅ Can contribute back to core easily

**Cons:**
- ❌ More complex git workflow
- ❌ Need to resolve merge conflicts

---

## Strategy 3: Separate Repositories (Recommended)

Keep core and customizations in separate repositories.

### Repository Structure

```
Repository 1: fin-desktop (upstream)
├── src/core/
├── src/extensions/ (examples only)
└── ARCHITECTURE.md

Repository 2: my-company-findesktop (your repo)
├── .gitignore
├── package.json
├── src/
│   ├── extensions/          ← Your customizations
│   │   ├── AcmeAuth.ts
│   │   └── AcmeTheme.ts
│   └── config/
│       └── FinDesktopConfig.ts
└── README.md
```

### Setup

```bash
# Clone core repository
git clone https://github.com/your-org/fin-desktop.git

# Create your customization repository
mkdir my-company-findesktop
cd my-company-findesktop
git init

# Copy only what you need
cp -r ../fin-desktop/src/extensions ./src/
cp -r ../fin-desktop/src/config ./src/

# Create package.json that depends on fin-desktop
npm init
```

### Update Workflow

```bash
# In fin-desktop repository
git pull origin main

# In your repository  
# Nothing to do! Your customizations are separate
```

**Pros:**
- ✅ Complete separation
- ✅ No merge conflicts ever
- ✅ Private customizations
- ✅ Multiple projects can share extensions
- ✅ Ready for future NPM package model

**Cons:**
- ❌ More initial setup
- ❌ Need to manually sync if core interfaces change

---

## Strategy 4: Monorepo with Workspaces

Use a monorepo structure with yarn/pnpm workspaces.

### Structure

```
findesktop-monorepo/
├── package.json (workspace root)
├── packages/
│   ├── core/               ← Git submodule or npm package
│   │   └── src/core/
│   ├── extensions/         ← Your customizations
│   │   └── src/extensions/
│   └── app/                ← Your application
│       └── src/
└── pnpm-workspace.yaml
```

### pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'
```

**Pros:**
- ✅ Excellent for multiple FinDesktop apps
- ✅ Shared extensions across apps
- ✅ Type safety across packages

**Cons:**
- ❌ Complex setup
- ❌ Requires workspace tooling knowledge

---

## Recommendation by Use Case

### Small Team / Single Deployment
→ **Strategy 2: Branch-Based Separation**

### Medium Team / Multiple Deployments
→ **Strategy 3: Separate Repositories**

### Large Organization / Many Products
→ **Strategy 4: Monorepo**

---

## Future: NPM Package Model

When FinDesktop core is published to NPM, the setup becomes even simpler:

```bash
# Create your project
npm init
npm install @bhushan/fin-desktop-core

# Create your extensions
mkdir src/extensions
# No need to track core code at all!
```

Your `package.json`:

```json
{
  "name": "my-company-findesktop",
  "dependencies": {
    "@bhushan/fin-desktop-core": "^2.0.0"
  }
}
```

Update core:

```bash
npm update @bhushan/fin-desktop-core
```

**This is the ultimate goal** - clean separation with NPM versioning.

---

## What to Commit vs Ignore

### Always Commit
- ✅ `src/extensions/` (your customizations)
- ✅ `src/config/FinDesktopConfig.ts` (your configuration)
- ✅ Your application code
- ✅ Tests for your extensions

### Consider Ignoring
- ⚠️ `src/core/` (if using submodule or npm package)
- ⚠️ Environment-specific config files
- ⚠️ Secrets and credentials

### Never Commit
- ❌ `node_modules/`
- ❌ `dist/` or `build/`
- ❌ `.env` files with secrets
- ❌ IDE-specific files

---

## Migration Path

Current setup → Future NPM package:

1. **Now**: Use Strategy 2 or 3
2. **When NPM available**: 
   ```bash
   # Remove src/core from your repo
   git rm -r src/core
   
   # Install from NPM
   npm install @bhushan/fin-desktop-core
   
   # Update imports
   # Before: import { X } from '../core/...'
   # After:  import { X } from '@bhushan/fin-desktop-core'
   ```

3. **Profit**: Clean upgrades forever!

---

Choose the strategy that fits your team size and deployment complexity. All strategies support the core architecture principle: **customizations are safe from core updates**.
