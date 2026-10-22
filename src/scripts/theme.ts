// Theme toggle: follows the system until the reader picks a theme, then remembers it.
// The saved choice is applied before first paint by the inline script in BaseLayout.

const root = document.documentElement;
const media = matchMedia("(prefers-color-scheme: dark)");

function current(): "light" | "dark" {
  const set = root.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return media.matches ? "dark" : "light";
}

function label(button: HTMLButtonElement) {
  button.setAttribute("aria-label", current() === "dark" ? "Switch to light theme" : "Switch to dark theme");
}

function setTheme(next: "light" | "dark") {
  root.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {
    // Storage blocked: the choice lasts for this page only.
  }
}

for (const button of document.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]")) {
  label(button);
  button.addEventListener("click", () => {
    const next = current() === "dark" ? "light" : "dark";
    const apply = () => {
      setTheme(next);
      label(button);
    };
    if (!document.startViewTransition) return apply();
    root.classList.add("theme-switching");
    const transition = document.startViewTransition(apply);
    transition.finished.finally(() => root.classList.remove("theme-switching"));
  });
  media.addEventListener("change", () => label(button));
}
