// Shared helpers for the content checks.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, extname } from "node:path";

export const TEXT_EXTENSIONS = new Set([
  ".astro", ".ts", ".mjs", ".js", ".css", ".md", ".mdx", ".json", ".html", ".svg", ".txt", ".xml", ".yml", ".yaml", ".py",
]);

export function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, files);
    else if (TEXT_EXTENSIONS.has(extname(name))) files.push(path);
  }
  return files;
}

/** Visible text of an HTML page plus the attributes people read (alt, title, aria-label, meta content). */
export function readableText(html) {
  const attrs = [...html.matchAll(/\s(?:alt|title|aria-label|content)="([^"]*)"/g)].map((m) => m[1]);
  const body = html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ");
  return decode([body, ...attrs].join("\n"));
}

function decode(s) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));
}

export function normalise(s) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function hashTerm(salt, term) {
  return createHash("sha256").update(`${salt}:${normalise(term)}`).digest("hex");
}

export function readUtf8(path) {
  return readFileSync(path, "utf8");
}
