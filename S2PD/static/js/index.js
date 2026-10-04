"use strict";

function setupCitationCopy() {
  const button = document.querySelector("[data-copy-citation]");
  const citation = document.querySelector("#bibtex");
  if (!button || !citation || !navigator.clipboard) {
    return;
  }

  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(citation.textContent.trim());
      button.textContent = "Copied";
      window.setTimeout(() => {
        button.textContent = "Copy";
      }, 1600);
    } catch {
      button.textContent = "Select text to copy";
    }
  });
}

function setupTeaserCarousel() {
  const carousel = document.querySelector("[data-teaser-carousel]");
  if (!carousel) {
    return;
  }

  const viewport = carousel.querySelector(".teaser-viewport");
  const previous = carousel.querySelector("[data-carousel-previous]");
  const next = carousel.querySelector("[data-carousel-next]");
  const navigation = carousel.querySelector("[data-carousel-navigation]");
  if (!viewport || !previous || !next || !navigation) {
    return;
  }

  const slides = Array.from(viewport.querySelectorAll(".teaser-slide")).sort(
    (left, right) => Number(left.dataset.carouselIndex) - Number(right.dataset.carouselIndex),
  );
  if (slides.length === 0) {
    return;
  }

  let activeIndex = -1;
  let pointerStartX;

  const dots = slides.map((slide) => {
    const dot = document.createElement("button");
    dot.className = "carousel-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Show ${slide.getAttribute("aria-label")}`);
    navigation.append(dot);
    return dot;
  });

  const updateVisibleVideos = () => {
    const visibleIndexes = new Set([
      (activeIndex - 1 + slides.length) % slides.length,
      activeIndex,
      (activeIndex + 1) % slides.length,
    ]);
    slides.forEach((slide, index) => {
      const video = slide.querySelector("video");
      if (!video) {
        return;
      }
      video.controls = visibleIndexes.has(index);
      if (visibleIndexes.has(index)) {
        if (!video.getAttribute("src")) video.src = video.dataset.src;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  };

  const setActiveIndex = (index) => {
    if (index === activeIndex) {
      return;
    }
    activeIndex = index;
    const previousIndex = (activeIndex - 1 + slides.length) % slides.length;
    const nextIndex = (activeIndex + 1) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const wrappedOffset = (slideIndex - activeIndex + slides.length) % slides.length;
      const offset =
        wrappedOffset > slides.length / 2 ? wrappedOffset - slides.length : wrappedOffset;
      slide.style.left = `${50 + offset * 33}%`;
      slide.classList.toggle("is-previous", slideIndex === previousIndex);
      slide.classList.toggle("is-active", slideIndex === activeIndex);
      slide.classList.toggle("is-next", slideIndex === nextIndex);
    });
    dots.forEach((dot, dotIndex) => {
      if (dotIndex === activeIndex) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
    updateVisibleVideos();
  };

  const showSlide = (index) => {
    const wrappedIndex = (index + slides.length) % slides.length;
    setActiveIndex(wrappedIndex);
  };

  previous.addEventListener("click", () => showSlide(activeIndex - 1));
  next.addEventListener("click", () => showSlide(activeIndex + 1));
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => showSlide(index));
  });

  viewport.addEventListener("pointerdown", (event) => {
    pointerStartX = event.target.closest("video") ? undefined : event.clientX;
  });
  viewport.addEventListener("pointerup", (event) => {
    if (pointerStartX === undefined) {
      return;
    }
    const distance = event.clientX - pointerStartX;
    pointerStartX = undefined;
    if (Math.abs(distance) > 40) {
      showSlide(activeIndex + (distance < 0 ? 1 : -1));
    }
  });

  setActiveIndex(0);
}

function setupGalleryDiagnostics() {
  const toggle = document.querySelector("[data-gallery-diagnostics]");
  if (!toggle) return;
  toggle.checked = true;
  document.querySelectorAll(".gallery-video-track").forEach((track) => {
    const videos = Array.from(track.querySelectorAll("video"));
    let resumeAfterSwitch = false;
    const preload = (video) => {
      video.preload = "auto";
      if (!video.getAttribute("src")) {
        video.src = video.dataset.src;
        video.load();
      }
    };
    toggle.addEventListener("change", () => {
      videos.forEach((video) => {
        video.onloadeddata = null;
        video.onseeked = null;
      });
      const outgoing = videos.find((video) => !video.inert);
      const incoming = videos[toggle.checked ? 1 : 0];
      if (!track.closest("details").open) {
        videos.forEach((video) => {
          video.pause();
          video.inert = video !== incoming;
        });
        track.classList.toggle("show-diagnostics", incoming === videos[1]);
        resumeAfterSwitch = false;
        return;
      }
      // Freeze the captured frame while loading/seeking its counterpart.
      // Keep playback intent when another toggle cancels an unfinished switch.
      resumeAfterSwitch ||= !outgoing.paused;
      outgoing.pause();
      if (incoming === outgoing) {
        if (resumeAfterSwitch) outgoing.play().catch(() => {});
        resumeAfterSwitch = false;
        return;
      }
      const time = outgoing.currentTime;
      const reveal = () => {
        outgoing.inert = true;
        incoming.inert = false;
        track.classList.toggle("show-diagnostics", incoming === videos[1]);
        if (resumeAfterSwitch && track.closest("details").open) incoming.play().catch(() => {});
        resumeAfterSwitch = false;
      };
      const align = () => {
        const target = Math.min(time, incoming.duration);
        if (!incoming.seeking && Math.abs(incoming.currentTime - target) < 0.001) {
          reveal();
        } else {
          incoming.onseeked = () => {
            incoming.onseeked = null;
            reveal();
          };
          incoming.currentTime = target;
        }
      };
      if (incoming.readyState >= 2) {
        align();
      } else {
        incoming.onloadeddata = () => {
          incoming.onloadeddata = null;
          align();
        };
        preload(incoming);
      }
    });
  });
}

function setupVoicePicker() {
  const picker = document.querySelector(".voice-picker");
  const video = document.querySelector(".presentation-video");
  if (!picker || !video) {
    return;
  }

  picker.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.getAttribute("aria-pressed") === "true") {
        return;
      }
      picker.querySelectorAll("button").forEach((other) => {
        other.setAttribute("aria-pressed", String(other === button));
      });
      // Voices pace the slides differently, so resume at the same fraction.
      const fraction = video.duration ? video.currentTime / video.duration : 0;
      const playing = !video.paused;
      const track = video.querySelector("track");
      const replacement = track.cloneNode();
      replacement.src = button.dataset.subtitles;
      track.replaceWith(replacement);
      video.querySelector("source").src = button.dataset.video;
      video.load();
      video.addEventListener(
        "loadedmetadata",
        () => {
          video.currentTime = fraction * video.duration;
          if (playing) {
            video.play();
          }
        },
        { once: true },
      );
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-dataset] video").forEach((video) => {
    const rate = Number(video.closest("[data-dataset]").dataset.playbackRate ?? 1);
    video.defaultPlaybackRate = rate;
    video.playbackRate = rate;
  });
  setupCitationCopy();
  setupTeaserCarousel();
  setupGalleryDiagnostics();
  setupVoicePicker();
  document.querySelectorAll(".evaluation-gallery-group").forEach((group) => {
    const update = () => {
      group.querySelectorAll("video").forEach((video) => {
        if (!group.open) {
          video.pause();
        } else if (!video.inert && !video.getAttribute("src")) {
          video.preload = "metadata";
          video.src = video.dataset.src;
          video.load();
        }
      });
    };
    group.addEventListener("toggle", update);
    update();
  });
});
