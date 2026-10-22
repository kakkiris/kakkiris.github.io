// Lens switch. Rows reorder with a FLIP animation (each row slides from where it was to
// where it now sits) while the number and outcome columns cross-fade. The active pill
// indicator slides between options, and the URL is updated with history.replaceState.
// The reorder itself is window.__applyLens, defined inline in WorkIndex.astro.

declare global {
  interface Window {
    __applyLens?: (id: string) => boolean;
  }
}

const EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";
const LAYOUT = 520;
const SMALL = 320;
const PRESS = 180;
const REDUCED = 120;

const root = document.documentElement;
const list = document.querySelector<HTMLOListElement>("[data-cases]");
const wrap = list?.parentElement;
const ghosts = document.querySelector<HTMLElement>("[data-ghosts]");
const group = document.querySelector<HTMLElement>("[data-lens-group]");
const indicator = document.querySelector<HTMLElement>("[data-lens-indicator]");
const note = document.querySelector<HTMLElement>("[data-lens-note]");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");

let running: Animation[] = [];

function visibleRows() {
  return [...(list?.children ?? [])].filter((li): li is HTMLElement => !(li as HTMLElement).hidden);
}

function placeIndicator() {
  const active = group?.querySelector<HTMLElement>('button[aria-pressed="true"]');
  if (!active || !indicator) return;
  indicator.style.width = `${active.offsetWidth}px`;
  indicator.style.height = `${active.offsetHeight}px`;
  indicator.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
}

/** A frozen copy of an element, pinned to where it was, for fading out. */
function ghost(el: HTMLElement, rect: DOMRect, origin: DOMRect) {
  const copy = el.cloneNode(true) as HTMLElement;
  copy.removeAttribute("data-case");
  copy.querySelectorAll<HTMLElement>("[style]").forEach((n) => n.style.removeProperty("view-transition-name"));
  copy.querySelectorAll("a").forEach((a) => a.removeAttribute("href"));
  Object.assign(copy.style, {
    top: `${rect.top - origin.top}px`,
    left: `${rect.left - origin.left}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  });
  return copy;
}

function switchTo(id: string) {
  if (!list || !wrap || !ghosts || !window.__applyLens) return;
  if (root.dataset.lens === id) return;
  const reduce = reduced.matches;

  // First: where everything is now, mid-animation included.
  const origin = wrap.getBoundingClientRect();
  const heightBefore = origin.height;
  const before = new Map<HTMLElement, { row: DOMRect; parts: [HTMLElement, DOMRect][] }>();
  for (const row of visibleRows()) {
    const parts = [...row.querySelectorAll<HTMLElement>("[data-num], .outcome")].map(
      (p) => [p, p.getBoundingClientRect()] as [HTMLElement, DOMRect],
    );
    before.set(row, { row: row.getBoundingClientRect(), parts });
  }
  const pending = [...before].map(([row, b]) => ({
    row,
    rowGhost: ghost(row, b.row, origin),
    partGhosts: b.parts.map(([p, r]) => ghost(p, r, origin)),
  }));

  for (const a of running) a.cancel();
  running = [];
  ghosts.replaceChildren();

  if (!window.__applyLens(id)) return;
  const url = new URL(location.href);
  url.searchParams.set("lens", id);
  history.replaceState(history.state, "", url);
  placeIndicator();

  // Last, then invert and play.
  const fadeOut = { duration: reduce ? REDUCED : PRESS, easing: EASE, fill: "forwards" as const };
  const fadeIn = reduce
    ? { duration: REDUCED, easing: "linear" }
    : { duration: SMALL, delay: LAYOUT - SMALL, easing: EASE, fill: "backwards" as const };

  for (const { row, rowGhost, partGhosts } of pending) {
    const leaving = row.hidden;
    const moved = !leaving && Math.abs(before.get(row)!.row.top - row.getBoundingClientRect().top) > 0.5;
    const outgoing = leaving ? [rowGhost] : moved ? partGhosts : [];
    for (const g of outgoing) {
      ghosts.append(g);
      const a = g.animate([{ opacity: 1 }, { opacity: 0 }], fadeOut);
      a.finished.then(() => g.remove(), () => g.remove());
      running.push(a);
    }
  }

  for (const row of visibleRows()) {
    const was = before.get(row);
    if (!was) {
      const frames = reduce
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            { opacity: 0, transform: "translateY(12px)" },
            { opacity: 1, transform: "none" },
          ];
      running.push(row.animate(frames, fadeIn));
      continue;
    }
    const dy = was.row.top - row.getBoundingClientRect().top;
    if (Math.abs(dy) <= 0.5) continue;
    if (!reduce) {
      // A travelling row passes over the rows it crosses.
      row.style.zIndex = "2";
      const slide = row.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], {
        duration: LAYOUT,
        easing: EASE,
      });
      slide.finished.finally(() => row.style.removeProperty("z-index")).catch(() => {});
      running.push(slide);
    }
    for (const part of row.querySelectorAll<HTMLElement>("[data-num], .outcome")) {
      running.push(part.animate([{ opacity: 0 }, { opacity: 1 }], fadeIn));
    }
  }

  const heightAfter = wrap.getBoundingClientRect().height;
  if (!reduce && Math.abs(heightAfter - heightBefore) > 0.5) {
    running.push(
      wrap.animate([{ height: `${heightBefore}px` }, { height: `${heightAfter}px` }], {
        duration: LAYOUT,
        easing: EASE,
      }),
    );
  }

  if (note) running.push(note.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduce ? REDUCED : SMALL, easing: EASE }));
}

if (group && list) {
  group.classList.add("has-indicator");
  placeIndicator();
  requestAnimationFrame(() => requestAnimationFrame(() => group.classList.add("indicator-ready")));
  new ResizeObserver(placeIndicator).observe(group);
  group.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-lens]");
    if (button?.dataset.lens) switchTo(button.dataset.lens);
  });
}

export {};
