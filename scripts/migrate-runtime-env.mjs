// scripts/migrate-runtime-env.mjs
//
// Astro v6 removed `Astro.locals.runtime.env` / `locals.runtime.env`.
// The replacement is `import { env } from 'cloudflare:workers'`.
// This script rewrites every affected file in src/pages once.

import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const root = process.cwd();

const files = execSync(
  `grep -rl "runtime\\.env" src/ --include="*.astro" --include="*.ts"`,
  { cwd: root, encoding: 'utf-8' }
)
  .trim()
  .split('\n')
  .filter(Boolean);

const IMPORT_LINE = `import { env } from 'cloudflare:workers';`;

for (const relPath of files) {
  let code = readFileSync(relPath, 'utf-8');
  const before = code;

  // Drop redundant local aliases: `const env = Astro.locals.runtime.env;`
  // or `const env = locals.runtime.env;` — the imported `env` replaces them.
  code = code.replace(/\s*const env = (Astro\.locals\.runtime\.env|locals\.runtime\.env);/g, '');

  // Replace remaining usages.
  code = code.replaceAll('Astro.locals.runtime.env', 'env');
  code = code.replaceAll('locals.runtime.env', 'env');

  if (code === before) continue; // nothing changed (shouldn't happen given grep)

  if (!code.includes(`from 'cloudflare:workers'`)) {
    if (relPath.endsWith('.astro')) {
      // Insert right after the opening frontmatter fence.
      code = code.replace(/^---\n/, `---\n${IMPORT_LINE}\n`);
    } else {
      code = `${IMPORT_LINE}\n${code}`;
    }
  }

  writeFileSync(relPath, code, 'utf-8');
  console.log(`[migrate-runtime-env] Updated ${relPath}`);
}

console.log(`[migrate-runtime-env] Done. ${files.length} files processed.`);
