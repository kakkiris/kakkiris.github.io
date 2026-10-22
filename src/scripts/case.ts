// Case study page behaviour:
// - sections open and close from their headings; the lens chose the first open set
// - the index tracks the section being read and opens a closed section before jumping to it
// - the desktop rail steps aside while a wide screenshot passes beneath it
// - annotation markers appear in sequence and pair with their notes on hover

const root = document.documentElement;
const sections = [...document.querySelectorAll<HTMLElement>(".case-section")];
const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function setOpen(section: HTMLElement, open: boolean) {
  section.classList.toggle("is-open", open);
  section.querySelector("[data-section-toggle]")?.setAttribute("aria-expanded", String(open));
}

// Initial state comes from the head script (lens and hash), then the classes take over.
const initial = (root.getAttribute("data-open") ?? "").split(" ");
for (const s of sections) setOpen(s, initial.includes(s.dataset.section ?? ""));
requestAnimationFrame(() => root.setAttribute("data-sections-ready", ""));

for (const s of sections) {
  s.querySelector("[data-section-toggle]")?.addEventListener("click", () => setOpen(s, !s.classList.contains("is-open")));
}

const openAllButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-open-all]")];
function syncOpenAll() {
  const all = sections.every((s) => s.classList.contains("is-open"));
  for (const b of openAllButtons) b.textContent = all ? "Close all sections" : "Open all sections";
}
for (const b of openAllButtons) {
  b.addEventListener("click", () => {
    const all = sections.every((s) => s.classList.contains("is-open"));
    for (const s of sections) setOpen(s, !all);
    syncOpenAll();
  });
}
document.addEventListener("click", (e) => {
  if ((e.target as HTMLElement).closest("[data-section-toggle]")) syncOpenAll();
});
syncOpenAll();

// Index links open their section first, then move to it, keeping ?lens= in the URL.
const links = [...document.querySelectorAll<HTMLAnchorElement>("[data-index-link]")];
for (const link of links) {
  link.addEventListener("click", (e) => {
    const target = document.getElementById(link.dataset.indexLink ?? "");
    if (!target) return;
    e.preventDefault();
    setOpen(target, true);
    syncOpenAll();
    link.closest("details")?.removeAttribute("open");
    target.scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "start" });
    history.replaceState(history.state, "", `${location.pathname}${location.search}#${target.id}`);
    target.querySelector<HTMLElement>("[data-section-toggle]")?.focus({ preventScroll: true });
  });
}

// Reading position: the last section whose heading has passed the top third of the screen.
const barCurrent = document.querySelector<HTMLElement>("[data-bar-current]");
let current = "";
function track() {
  const line = innerHeight * 0.33;
  let active = sections[0];
  for (const s of sections) if (s.getBoundingClientRect().top <= line) active = s;
  if (!active || active.id === current) return;
  current = active.id;
  for (const link of links) link.setAttribute("aria-current", String(link.dataset.indexLink === current));
  if (barCurrent) barCurrent.textContent = active.querySelector(".section-title")?.textContent ?? "";
}

// The rail fades while any wide screenshot overlaps it.
const rail = document.querySelector<HTMLElement>("[data-rail] .rail-inner");
const shots = [...document.querySelectorAll<HTMLElement>("[data-shot]")];
const wide = [...document.querySelectorAll<HTMLElement>("[data-shot], [data-diagram]")];
function railCover() {
  if (!rail || rail.offsetParent === null) return;
  const r = rail.getBoundingClientRect();
  const covered = wide.some((shot) => {
    if (shot.closest(".case-section:not(.is-open)")) return false;
    const s = shot.getBoundingClientRect();
    return s.bottom > r.top && s.top < r.bottom && s.right > r.left;
  });
  rail.parentElement?.classList.toggle("is-covered", covered);
}

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    track();
    railCover();
    ticking = false;
  });
}
addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", onScroll, { passive: true });
document.addEventListener("transitionend", onScroll);
onScroll();

// Diagrams draw their connecting lines once, when 30% visible.
const diagrams = [...document.querySelectorAll<HTMLElement>("[data-diagram]")];
if ("IntersectionObserver" in window) {
  const draw = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-drawn");
        draw.unobserve(entry.target);
      }
    },
    { threshold: 0.3 },
  );
  for (const d of diagrams) draw.observe(d);
} else {
  for (const d of diagrams) d.classList.add("is-drawn");
}

// Annotation markers: appear in sequence once, and pair with their notes on hover.
if ("IntersectionObserver" in window) {
  const seen = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("markers-in");
        seen.unobserve(entry.target);
      }
    },
    { threshold: 0.3 },
  );
  for (const shot of shots) seen.observe(shot);
} else {
  for (const shot of shots) shot.classList.add("markers-in");
}

for (const shot of shots) {
  const pair = (n: string | undefined, on: boolean) => {
    if (!n) return;
    shot.querySelectorAll(`[data-note="${n}"]`).forEach((el) => el.classList.toggle("is-active", on));
  };
  shot.querySelectorAll<HTMLElement>("li[data-note]").forEach((li) => {
    li.addEventListener("pointerenter", () => pair(li.dataset.note, true));
    li.addEventListener("pointerleave", () => pair(li.dataset.note, false));
  });
  // Markers sit under pointer-events: none, so hover on the image is matched by position.
  const frame = shot.querySelector<HTMLElement>(".frame");
  const markers = [...shot.querySelectorAll<HTMLElement>(".marker")];
  let hot: string | undefined;
  frame?.addEventListener("pointermove", (e) => {
    const near = markers.find((m) => {
      const r = m.getBoundingClientRect();
      return Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < 20;
    });
    const n = near?.dataset.note;
    if (n === hot) return;
    pair(hot, false);
    pair(n, true);
    hot = n;
  });
  frame?.addEventListener("pointerleave", () => {
    pair(hot, false);
    hot = undefined;
  });
}

export {};
