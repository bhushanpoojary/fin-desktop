import { defineConfig } from '@playwright/test'

// E2E tests launch the packaged Electron app. These are scaffolding and are skipped until
// production main-process wiring + packaging land (see roadmap Phase 4).
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  reporter: 'list',
})
