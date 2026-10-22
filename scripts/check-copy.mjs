// Copy checks on the built pages (and the case data before a build):
// 1. no real client, people or place names (salted hashes in forbidden-terms.json)
// 2. none of the banned AI-sounding words
// 3. no US spellings
// 4. no questions in the copy (the site states, it does not ask)
import { existsSync, readFileSync } from "node:fs";
import { relative } from "node:path";
import { walk, readUtf8, readableText, normalise, hashTerm } from "./lib/text.mjs";

const root = new URL("..", import.meta.url).pathname;
const dist = process.argv.includes("--dist");
const files = dist ? walk(root + "dist").filter((f) => f.endsWith(".html")) : walk(root + "src");

const BANNED = [
  /\bunlock(s|ed|ing)?\b/i,
  /\bseamless(ly)?\b/i,
  /\bleverag(e|es|ed|ing)\b/i,
  /\brevolutioni[sz](e|es|ed|ing)\b/i,
  /\bpassionate about\b/i,
  /\bdelv(e|es|ing)\b/i,
  /\bempower(s|ed|ing|ment)?\b/i,
  /\bcutting[- ]edge\b/i,
  /\bgame[- ]chang(er|ing)\b/i,
  /\bsynerg(y|ies)\b/i,
];

// US forms of words this site is likely to use; the UK form is what should appear.
const US_SPELLINGS = [
  /\b(organiz|prioritiz|optimiz|recogniz|realiz|analyz|specializ|summariz|standardiz|minimiz|maximiz|customiz|utiliz|visualiz|normaliz|anonymiz|emphasiz|categoriz|finaliz|characteriz|personaliz|centraliz|authoriz|digitiz)(e|es|ed|ing|ation|ations)\b/i,
  /\b(color|behavior|favorite|labor|honor|flavor|neighbor)(s|ed|ing|ful)?\b/i,
  /\b(center|centers|catalog|catalogs|modeling|modeled|labeling|labeled|canceled|canceling|traveled|fulfill|defense)\b/i,
];

const terms = JSON.parse(readFileSync(new URL("forbidden-terms.json", import.meta.url), "utf8"));
const forbidden = new Set(terms.hashes);

const problems = [];
for (const file of files) {
  const raw = readUtf8(file);
  const text = dist ? readableText(raw) : raw;
  const where = relative(root, file);

  const words = normalise(text).split(" ");
  for (let n = 1; n <= terms.maxWords; n++) {
    for (let i = 0; i + n <= words.length; i++) {
      const gram = words.slice(i, i + n).join(" ");
      if (forbidden.has(hashTerm(terms.salt, gram))) problems.push(`${where}: real name or place "${gram}"`);
    }
  }
  if (!dist) continue; // the remaining checks read copy, not code

  for (const re of BANNED) {
    const m = text.match(re);
    if (m) problems.push(`${where}: banned word "${m[0]}"`);
  }
  for (const re of US_SPELLINGS) {
    const m = text.match(re);
    if (m) problems.push(`${where}: US spelling "${m[0]}"`);
  }
  const question = text.match(/[A-Za-z][^.!?\n]{3,}\?/);
  if (question) problems.push(`${where}: question in copy "${question[0].trim()}"`);
  // Launch builds (CI sets PORTFOLIO_LAUNCH=1) must not carry draft wording
  if (process.env.PORTFOLIO_LAUNCH === "1" && raw.includes("data-draft")) problems.push(`${where}: draft wording still on the page`);
}

if (problems.length) {
  console.error(`check-copy: ${problems.length} problem(s):`);
  for (const p of [...new Set(problems)]) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`check-copy: ${files.length} files, ${terms.count} protected names, no problems.`);
