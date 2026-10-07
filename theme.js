(() => {
  const root = document.documentElement;

  function apply(theme) {
    root.dataset.theme = theme;
    document.querySelector(".theme-toggle")?.setAttribute("aria-pressed", String(theme === "dark"));
  }

  apply("light");

  document.addEventListener("click", (event) => {
    if (!event.target.closest?.(".theme-toggle")) return;
    apply(root.dataset.theme === "dark" ? "light" : "dark");
  });

  document.addEventListener("DOMContentLoaded", () => apply(root.dataset.theme));
})();
