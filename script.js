const menuButton = document.querySelector(".menu-button");
const navLinks = document.querySelector(".nav-links");
const navAnchors = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const revealTargets = document.querySelectorAll(".reveal");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const closeMenu = () => {
  navLinks?.classList.remove("is-open");
  menuButton?.setAttribute("aria-expanded", "false");
  menuButton?.setAttribute("aria-label", "Abrir menu");
};

menuButton?.addEventListener("click", () => {
  const open = navLinks?.classList.toggle("is-open") ?? false;
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
});

navLinks?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) closeMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menuButton.focus();
  }
});

document.addEventListener("click", (event) => {
  if (event.target instanceof Node && !navLinks?.contains(event.target) && !menuButton?.contains(event.target)) closeMenu();
});

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        if (entry.target.matches('.section-label,.about-heading,.section-intro,.skills-heading') && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          entry.target.animate(
            [{ opacity: 0.75, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
            { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' },
          );
        }
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -6%" },
  );
  revealTargets.forEach((target) => revealObserver.observe(target));
}

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navAnchors.forEach((anchor) => {
        const active = anchor.getAttribute("href") === `#${visible.target.id}`;
        anchor.classList.toggle("is-active", active);
        if (active) anchor.setAttribute("aria-current", "location");
        else anchor.removeAttribute("aria-current");
      });
    },
    { rootMargin: "-28% 0px -58%", threshold: [0, 0.2, 0.5] },
  );
  document.querySelectorAll("[data-section]").forEach((section) => sectionObserver.observe(section));
}

let scrollFrame = 0;
const updateScrollProgress = () => {
  const available = document.documentElement.scrollHeight - window.innerHeight;
  const progress = available > 0 ? (window.scrollY / available) * 100 : 0;
  document.documentElement.style.setProperty("--scroll-progress", `${progress}%`);
};

window.addEventListener(
  "scroll",
  () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      updateScrollProgress();
      scrollFrame = 0;
    });
  },
  { passive: true },
);

window.addEventListener("resize", () => {
  if (window.innerWidth > 780) closeMenu();
});

const yearTarget = document.querySelector("[data-year]");
if (yearTarget) yearTarget.textContent = new Date().getFullYear();
updateScrollProgress();

// Native scrolling provides touch swipe; buttons and keys share the same state.
const imageViewer = document.createElement('dialog');
imageViewer.className = 'image-viewer';
imageViewer.setAttribute('aria-label', 'Imagem ampliada do projeto');
imageViewer.innerHTML = '<header><p></p><button type="button" autofocus>Fechar ×</button></header><img alt="" />';
document.body.append(imageViewer);
imageViewer.querySelector('button').addEventListener('click', () => imageViewer.close());
imageViewer.addEventListener('click', (event) => {
  if (event.target === imageViewer) {
    const rect = imageViewer.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) imageViewer.close();
  }
});
imageViewer.addEventListener('close', () => document.documentElement.classList.remove('viewer-open'));

document.querySelectorAll('.project-gallery').forEach((gallery) => {
  const track = gallery.querySelector('.gallery-track');
  const slides = [...track.querySelectorAll('.gallery-slide')];
  const controls = gallery.querySelector('.gallery-controls');
  const position = gallery.querySelector('.gallery-position');
  let current = 0;
  const goTo = (index) => {
    const next = (index + slides.length) % slides.length;
    track.scrollTo({ left: next * track.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  const zoom = (slide) => {
    const img = slide.querySelector('img');
    imageViewer.querySelector('img').src = slide.href;
    imageViewer.querySelector('img').alt = img.alt;
    imageViewer.querySelector('p').textContent = img.alt;
    imageViewer.showModal();
    document.documentElement.classList.add('viewer-open');
  };
  track.addEventListener('scroll', () => {
    current = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
    position.textContent = `${current + 1} / ${slides.length}`;
  }, { passive: true });
  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  gallery.querySelector('[data-gallery-prev]').addEventListener('click', () => goTo(current - 1));
  gallery.querySelector('[data-gallery-next]').addEventListener('click', () => goTo(current + 1));
  gallery.querySelector('[data-gallery-zoom]').addEventListener('click', () => zoom(slides[current]));
  slides.forEach((slide) => slide.addEventListener('click', (event) => {
    event.preventDefault();
    zoom(slide);
  }));
  new ResizeObserver(() => track.scrollTo({ left: current * track.clientWidth, behavior: 'instant' })).observe(track);
  position.textContent = `1 / ${slides.length}`;
  controls.hidden = false;
});
