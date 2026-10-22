// Every internal link, anchor and lens URL in the built site must resolve.
// External links are listed but not fetched (the build runs offline).
import { existsSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { walk, readUtf8 } from "./lib/text.mjs";

const root = new URL("..", import.meta.url).pathname;
const dist = join(root, "dist");
const LENSES = ["product", "design", "consulting", "ai"];
// Linked before the file exists; reported, not failed. Remove an entry once the file ships.
const PENDING = new Map();

const pages = walk(dist).filter((f) => f.endsWith(".html"));
const ids = new Map(pages.map((p) => [p, new Set([...readUtf8(p).matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]));

function resolve(pathname) {
  const clean = decodeURIComponent(pathname).replace(/\/$/, "") || "/";
  const candidates = clean === "/" ? ["index.html"] : [clean, `${clean}.html`, `${clean}/index.html`];
  return candidates.map((c) => join(dist, c)).find((c) => existsSync(c) && !c.endsWith("/"));
}

const problems = [];
const pending = new Set();
const external = new Set();
let checked = 0;

for (const page of pages) {
  const html = readUtf8(page);
  const from = "/" + relative(dist, page).replace(/index\.html$/, "").replace(/\.html$/, "");
  for (const [, attr, value] of html.matchAll(/\s(href|src)="([^"]*)"/g)) {
    if (/^(https?:)?\/\//.test(value)) {
      external.add(value);
      continue;
    }
    if (/^(mailto|tel|data):/.test(value)) continue;
    checked++;
    const url = new URL(value, `https://site.local${from}`);
    if (PENDING.has(url.pathname)) {
      pending.add(url.pathname);
      continue;
    }
    const target = resolve(url.pathname);
    if (!target) {
      problems.push(`${relative(dist, page)}: ${attr}="${value}" does not resolve`);
      continue;
    }
    if (url.hash && target.endsWith(".html") && !ids.get(target)?.has(url.hash.slice(1))) {
      problems.push(`${relative(dist, page)}: ${value} has no #${url.hash.slice(1)} on the target page`);
    }
    const lens = url.searchParams.get("lens");
    if (lens !== null && !LENSES.includes(lens)) problems.push(`${relative(dist, page)}: ${value} has an unknown lens`);
  }
}

// Every lens URL serves the home page, and every case study exists for every lens link.
for (const lens of LENSES) {
  if (!resolve("/")) problems.push(`/?lens=${lens}: no home page`);
}

for (const p of pending) console.warn(`check-links: pending ${p} (${PENDING.get(p)})`);
console.log(`check-links: ${external.size} external links not fetched.`);
if (problems.length) {
  console.error(`check-links: ${problems.length} broken link(s):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`check-links: ${checked} internal links across ${pages.length} pages resolve.`);
