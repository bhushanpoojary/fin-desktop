import { test, expect, _electron as electron } from '@playwright/test'

// Scaffold: launches the Electron app and asserts a window opens.
// Skipped until a production build + prod main wiring exist (roadmap Phase 4).
// Remove `.skip` once `npm run build` output is loaded by electron/main.cjs in production.
test.skip('app launches and opens a window', async () => {
  const app = await electron.launch({ args: ['electron/main.cjs'] })
  const window = await app.firstWindow()

  expect(await window.title()).toBeTruthy()

  await app.close()
})
