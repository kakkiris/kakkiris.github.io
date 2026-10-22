// Hero load sequence: split the headline into words, group them by rendered line,
// then stagger each line by 60ms. The intro and links follow. Whole sequence under 700ms.

const STAGGER = 60;
const DURATION = 320;
const BUDGET = 680;

const root = document.documentElement;
const hero = document.querySelector<HTMLElement>("[data-hero-root]");
const headline = hero?.querySelector<HTMLElement>('[data-hero="split"]');

function wrapWords(node: Node) {
  for (const child of [...node.childNodes]) {
    if (child.nodeType === Node.TEXT_NODE) {
      const parts = (child.textContent ?? "").split(/(\s+)/);
      const frag = document.createDocumentFragment();
      for (const part of parts) {
        if (!part) continue;
        if (/^\s+$/.test(part)) {
          frag.append(" ");
        } else {
          const span = document.createElement("span");
          span.className = "word";
          span.textContent = part;
          frag.append(span);
        }
      }
      child.replaceWith(frag);
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      wrapWords(child);
    }
  }
}

async function run() {
  if (!hero || !headline) return;
  // Wait briefly for the web fonts so lines are measured as they will render.
  if (document.fonts && document.fonts.status !== "loaded") {
    await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 100))]);
  }

  // Screen readers get the sentence whole, not word by word.
  headline.setAttribute("aria-label", (headline.textContent ?? "").replace(/\s+/g, " ").trim());
  wrapWords(headline);
  const words = [...headline.querySelectorAll<HTMLElement>(".word")];
  const tops: number[] = [];
  for (const word of words) {
    const top = Math.round(word.offsetTop);
    let line = tops.findIndex((t) => Math.abs(t - top) < 4);
    if (line === -1) line = tops.push(top) - 1;
    word.dataset.line = String(line);
  }

  // Keep the whole sequence inside the budget, even when a phone wraps to many lines.
  const lines = Math.max(tops.length, 1);
  const after = 2; // intro, then links
  const stagger = Math.min(STAGGER, (BUDGET - DURATION) / (lines - 1 + after));
  for (const word of words) word.style.setProperty("--d", `${Number(word.dataset.line) * stagger}ms`);
  for (const el of hero.querySelectorAll<HTMLElement>("[data-hero-after]")) {
    const step = lines - 1 + Number(el.dataset.heroAfter);
    el.style.setProperty("--d", `${Math.round(step * stagger)}ms`);
  }

  hero.classList.add("is-revealing");
  root.dataset.heroReady = "";
}

run().catch(() => {
  hero?.classList.add("is-revealing");
  root.dataset.heroReady = "";
});
