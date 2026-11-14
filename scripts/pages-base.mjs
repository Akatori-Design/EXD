// GitHub Pages serves this site from a sub-path (https://<owner>.github.io/EXD/), but the
// pages link to each other and to public files with root-absolute paths ("/login.html",
// "/assets/…", "/"). Vite's `--base` prefixes the URLs it bundles; this pass prefixes the rest
// in the built HTML and JS: quoted strings that point at a page, a public asset, or the home "/".
//
// usage: node scripts/pages-base.mjs <distDir> <base>     e.g. node scripts/pages-base.mjs dist /EXD/
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const [dir = 'dist', baseArg = '/EXD/'] = process.argv.slice(2);
const base = `/${baseArg.replace(/^\/+|\/+$/g, '')}/`;
const prefix = base.slice(1); // "EXD/"

// "/x.html…", "/assets/…", or exactly "/" (also followed by ?query or #hash) inside quotes or backticks
const quoted = new RegExp(String.raw`(["'\x60])\/(?!\/|${prefix})(?=(?:assets\/|[\w-]+\.html\b|[?#])|\1)`, 'g');
// url(/assets/…) in inline styles
const cssUrl = new RegExp(String.raw`url\((["']?)\/(?!\/|${prefix})(?=assets\/)`, 'g');

async function* walk(d) {
  for (const e of await readdir(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

let files = 0;
let hits = 0;
for await (const file of walk(dir)) {
  const ext = extname(file);
  if (!['.html', '.js', '.css'].includes(ext)) continue;
  const src = await readFile(file, 'utf8');
  let n = 0;
  const out = src
    .replace(quoted, (_, q) => (n++, `${q}${base}`))
    .replace(cssUrl, (_, q) => (n++, `url(${q}${base}`));
  if (n) {
    await writeFile(file, out);
    files++;
    hits += n;
  }
}
console.log(`pages-base: prefixed ${hits} paths with ${base} in ${files} files`);
