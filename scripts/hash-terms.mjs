// Turns the private list of real client, people and place names into salted hashes,
// so the check can run in CI without the names ever entering the repository.
// node scripts/hash-terms.mjs ../private/forbidden-terms.txt
import { writeFileSync, readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { hashTerm, normalise } from "./lib/text.mjs";

const source = process.argv[2];
if (!source) {
  console.error("Usage: node scripts/hash-terms.mjs <path to private terms file>");
  process.exit(1);
}

const terms = readFileSync(source, "utf8")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"));
const salt = randomBytes(16).toString("hex");
const maxWords = Math.max(...terms.map((t) => normalise(t).split(" ").length));
const hashes = [...new Set(terms.map((t) => hashTerm(salt, t)))].sort();

writeFileSync(
  new URL("forbidden-terms.json", import.meta.url),
  JSON.stringify({ salt, maxWords, count: hashes.length, hashes }, null, 2) + "\n",
);
console.log(`Hashed ${hashes.length} terms (longest ${maxWords} words) into scripts/forbidden-terms.json`);
