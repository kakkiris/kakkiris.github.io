// Fails if an em dash appears anywhere: copy, alt text, metadata, code or comments.
// node scripts/check-dashes.mjs          checks the source
// node scripts/check-dashes.mjs --dist   checks the built site
import { existsSync, statSync } from "node:fs";
import { relative } from "node:path";
import { walk, readUtf8 } from "./lib/text.mjs";

const EM_DASH = String.fromCharCode(0x2014);
const root = new URL("..", import.meta.url).pathname;
const targets = process.argv.includes("--dist")
  ? ["dist"]
  : ["src", "public", "scripts", ".github", "astro.config.mjs", "package.json", "README.md"];

const files = targets
  .map((t) => root + t)
  .filter(existsSync)
  .flatMap((p) => (statSync(p).isDirectory() ? walk(p) : [p]));

const hits = [];
for (const file of files) {
  readUtf8(file)
    .split("\n")
    .forEach((line, i) => {
      const col = line.indexOf(EM_DASH);
      if (col !== -1) hits.push(`${relative(root, file)}:${i + 1}:${col + 1}`);
    });
}

if (hits.length) {
  console.error(`Em dash found in ${hits.length} place(s). Rewrite with a comma, colon or full stop:`);
  for (const h of hits) console.error(`  ${h}`);
  process.exit(1);
}
console.log(`check-dashes: ${files.length} files, no em dashes.`);
