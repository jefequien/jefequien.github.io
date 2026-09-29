const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const gsplat = document.querySelector(".project-featured");
const logo = gsplat.querySelector(":scope > .project-media");
const citation = gsplat.querySelector(":scope > .project-content");
const contributionsSummary = gsplat.querySelector("summary");

// Center against the citation and collapsed dropdown, even when it is open.
const positionLogo = () => {
  const top = citation.getBoundingClientRect().top;
  const bottom = contributionsSummary.getBoundingClientRect().bottom;
  const offset =
    (top + bottom - logo.getBoundingClientRect().height) / 2 - gsplat.getBoundingClientRect().top;
  gsplat.style.setProperty("--logo-offset", `${offset}px`);
};
const logoLayout = new ResizeObserver(positionLogo);
logoLayout.observe(citation);
logoLayout.observe(logo);
window.addEventListener("resize", positionLogo);
document.fonts.ready.then(positionLogo);

let activePreview = null;
const stopActivePreview = () => activePreview?.stop();
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopActivePreview();
});
window.addEventListener("pagehide", stopActivePreview);

document.querySelectorAll("[data-preview]").forEach((preview) => {
  const video = preview.querySelector("video");
  const sources = Array.from(video?.querySelectorAll("source") || []);
  if (!sources.length) return;

  const url = sources[0].getAttribute("src");
  // Attach media only on intent; pause alone can retain downloads and decoders.
  sources.forEach((source) => source.remove());
  video.load();
  video.muted = true;
  const contributions = preview.closest("details");
  const label = preview.getAttribute("aria-label") || preview.querySelector("img").alt;
  let hovered = false;
  let focused = false;
  let timer;
  let timeout;
  let request = 0;

  const stop = () => {
    request++;
    clearTimeout(timer);
    clearTimeout(timeout);
    preview.classList.remove("is-previewing");
    if (preview.getAttribute("role") === "button") preview.setAttribute("aria-pressed", "false");
    video.pause();
    if (sources[0].parentNode === video) {
      sources.forEach((source) => source.remove());
      video.load();
    }
    if (activePreview === controller) activePreview = null;
  };
  const controller = { stop };
  const updateAccessibility = () => {
    stop();
    hovered = false;
    focused = false;
    if (reducedMotion.matches) {
      if (document.activeElement === preview) preview.blur();
      for (const attribute of ["role", "tabindex", "aria-label", "aria-pressed"]) {
        preview.removeAttribute(attribute);
      }
    } else {
      preview.setAttribute("role", "button");
      preview.setAttribute("tabindex", "0");
      preview.setAttribute("aria-label", `${label}. Play or pause preview`);
      preview.setAttribute("aria-pressed", "false");
    }
  };
  reducedMotion.addEventListener("change", updateAccessibility);
  updateAccessibility();
  const start = () => {
    clearTimeout(timer);
    if (reducedMotion.matches || document.hidden || (contributions && !contributions.open)) return;
    if (activePreview === controller) return;
    stopActivePreview();
    activePreview = controller;
    const current = ++request;
    video.append(...sources);
    video.load();
    // A stalled connection must not hold media resources indefinitely.
    timeout = setTimeout(stop, 15000);
    video
      .play()
      .then(() => {
        if (current !== request) return;
        clearTimeout(timeout);
        preview.classList.add("is-previewing");
        preview.setAttribute("aria-pressed", "true");
      })
      .catch((error) => {
        if (current !== request) return;
        stop();
        if (error.name !== "AbortError") console.warn(`Preview unavailable: ${url}`, error.name);
      });
  };
  preview.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "touch") return;
    hovered = true;
    // Avoid downloading clips while the pointer merely crosses the page.
    timer = setTimeout(start, 150);
  });
  preview.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "touch") return;
    hovered = false;
    if (!focused) stop();
  });
  preview.addEventListener("focus", () => {
    focused = preview.matches(":focus-visible");
    if (focused) start();
  });
  preview.addEventListener("blur", () => {
    focused = false;
    if (!hovered) stop();
  });
  preview.addEventListener("click", () => {
    if (activePreview === controller) stop();
    else start();
  });
  preview.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (activePreview === controller) stop();
      else start();
    }
    if (event.key === "Escape") stop();
  });
  contributions?.addEventListener("toggle", () => {
    if (!contributions.open) {
      hovered = false;
      focused = false;
      stop();
    }
  });
  video.addEventListener("error", stop);
  if ("IntersectionObserver" in window) {
    const visibility = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) stop();
    });
    visibility.observe(preview);
  }
});
