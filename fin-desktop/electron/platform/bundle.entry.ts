// Entry bundled to CommonJS (electron/platform/platform.bundle.cjs) for the Electron main
// process. Re-exports exactly what the platform demo needs from the tested TS modules.

export { Platform, findStack, dropRegionToSplitDirection } from '../../src/platform';
export { isUrlAllowed } from '../../src/security';
