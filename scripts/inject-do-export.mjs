// scripts/inject-do-export.mjs
//
// @astrojs/cloudflare builds dist/server/entry.mjs and only exports the
// Astro request handler (`export { worker_entry_default as default }`).
// Any Durable Object class referenced in wrangler.toml MUST be exported
// from that same entry module, or `wrangler deploy` fails with:
//   "Cannot apply new-class migration to class 'X' that is not exported
//    by script. [code: 10070]"
//
// This script runs after `astro build` and appends the compiled Durable
// Object class(es) directly into dist/server/entry.mjs as named exports,
// compiling from the canonical TypeScript source with esbuild so the
// source of truth stays in src/lib/*.ts.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { transformSync } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const entryPath = path.join(root, 'dist/server/entry.mjs');

// Add every Durable Object class that needs to be exported here.
const durableObjects = [
  { file: 'src/lib/traffic-do.ts', exportName: 'TrafficCoordinator' },
];

if (!existsSync(entryPath)) {
  console.error(`[inject-do-export] entry.mjs not found at ${entryPath}. Did "astro build" run first?`);
  process.exit(1);
}

let entryCode = readFileSync(entryPath, 'utf-8');
let appended = [];

for (const { file, exportName } of durableObjects) {
  const srcPath = path.join(root, file);
  if (!existsSync(srcPath)) {
    console.error(`[inject-do-export] Missing source file: ${srcPath}`);
    process.exit(1);
  }

  const ts = readFileSync(srcPath, 'utf-8');
  const { code } = transformSync(ts, {
    loader: 'ts',
    format: 'esm',
    target: 'es2022',
  });

  // esbuild's ESM output moves `export class Foo {...}` into a bare class
  // declaration plus a separate trailing `export { Foo };` statement.
  // Strip ALL export statements from the compiled output so we can add
  // exactly one clean, de-duplicated export ourselves below (otherwise
  // we'd end up with two `export { TrafficCoordinator }` statements,
  // which is a SyntaxError).
  const classCode = code.replace(/export\s*\{[^}]*\}\s*;?/g, '').trim();

  if (entryCode.includes(`class ${exportName}`)) {
    console.log(`[inject-do-export] ${exportName} already present in entry.mjs, skipping.`);
    continue;
  }

  entryCode += `\n// --- injected by scripts/inject-do-export.mjs ---\n${classCode}\nexport { ${exportName} };\n`;
  appended.push(exportName);
}

if (appended.length > 0) {
  writeFileSync(entryPath, entryCode, 'utf-8');
  console.log(`[inject-do-export] Appended exports to entry.mjs: ${appended.join(', ')}`);
} else {
  console.log('[inject-do-export] Nothing to append.');
}
