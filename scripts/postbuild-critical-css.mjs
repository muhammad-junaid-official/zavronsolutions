/**
 * Post-build: eliminate render-blocking CSS.
 *
 * For every HTML page in dist/, Beasties inlines the CSS needed for the
 * above-the-fold render and swaps the full stylesheet to a non-blocking
 * media="print" -> onload="this.media='all'" load (with <noscript> fallback).
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';
import Beasties from 'beasties';

const DIST = new URL('../dist/', import.meta.url).pathname;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (entry.name.endsWith('.html')) yield p;
  }
}

const beasties = new Beasties({
  path: DIST,
  publicPath: '/',
  preload: 'media',
  pruneSource: false,
  inlineFonts: false,
  compress: true,
  logLevel: 'warn',
});

let count = 0;
for await (const file of walk(DIST)) {
  const rel = relative(DIST, file);
  if (rel.startsWith('admin/') || rel.startsWith('google')) continue;
  const html = await readFile(file, 'utf8');
  if (!html.includes('rel="stylesheet"')) continue;
  const out = await beasties.process(html);
  await writeFile(file, out);
  count++;
}
console.log(`critical CSS inlined for ${count} pages`);
