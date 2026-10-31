// Bundles the (tested, framework-agnostic) TS Platform runtime into a CommonJS module the
// Electron main process can require. Run via `npm run build:platform`.

import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');

await build({
  entryPoints: [resolve(root, 'src/platform/index.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node18',
  outfile: resolve(here, 'platform.bundle.cjs'),
  logLevel: 'info',
});

console.log('[platform] bundle built → electron/platform/platform.bundle.cjs');
