// Scroll reveal: [data-reveal] blocks fade up 16px once, when 20% visible.
// Blocks already on screen at load wait for the hero sequence to start first.

const root = document.documentElement;
const blocks = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
const LOAD_DELAY = 160;

if (blocks.length && "IntersectionObserver" in window) {
  const loadedAt = performance.now();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        if (performance.now() - loadedAt < 100) el.style.setProperty("--reveal-delay", `${LOAD_DELAY}ms`);
        el.classList.add("is-in");
        observer.unobserve(el);
      }
    },
    { threshold: 0.2 },
  );
  for (const el of blocks) observer.observe(el);
} else {
  for (const el of blocks) el.classList.add("is-in");
}

root.dataset.motionReady = "";
