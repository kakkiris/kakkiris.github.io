// Renders one typographic Open Graph card (1200 x 630) per page into public/og/.
// Run locally after changing titles: node scripts/build-og.mjs (needs a running `npm run preview`
// on port 4322 for the fonts, and Chrome). The PNGs are committed, so CI never runs this.
import { mkdirSync } from "node:fs";

const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = process.env.OG_BASE ?? "http://localhost:4322";
const { default: puppeteer } = await import(process.env.PUPPETEER_PATH ?? "puppeteer-core");
const { CASES } = await import("../src/data/cases.ts").catch(() => ({ CASES: null }));

const cards = [
  { file: "home", kicker: "Product Manager · Monk AI Group · UCL", title: "I turn messy operational workflows into working software." },
  { file: "about", kicker: "About", title: "Product manager at Monk AI Group, final-year student at UCL." },
  ...Object.values(CASES ?? {}).map((c) => ({ file: c.slug, kicker: c.context, title: c.title, note: c.outcome })),
];

const out = new URL("../public/og/", import.meta.url).pathname;
mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
for (const card of cards) {
  await page.goto(`${BASE}/404`, { waitUntil: "networkidle0" });
  await page.evaluate((card) => {
    document.documentElement.removeAttribute("data-theme");
    document.body.innerHTML = `
      <div style="position:fixed;inset:0;background:#f6f3ee;color:#1b1a18;padding:72px 88px;display:flex;flex-direction:column;justify-content:space-between;font-family:Inter,sans-serif">
        <div style="font-size:24px;color:#6b665e">${card.kicker}</div>
        <div>
          <div style="font:400 ${card.title.length > 40 ? 68 : 84}px/1.05 Newsreader,serif;letter-spacing:-0.015em;max-width:960px">${card.title}</div>
          ${card.note ? `<div style="margin-top:28px;font:italic 400 34px/1.2 Newsreader,serif;color:#b4441f">${card.note}</div>` : ""}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #dcd6cc;padding-top:24px;font-size:24px">
          <span style="font-weight:600">Kerem Akkiris</span><span style="color:#6b665e">kakkiris.github.io</span>
        </div>
      </div>`;
  }, card);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${out}${card.file}.png` });
  console.log("og", card.file);
}
await browser.close();
