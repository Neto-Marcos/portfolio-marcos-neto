const menuButton = document.querySelector(".menu-button");
const navLinks = document.querySelector(".nav-links");
const contactForm = document.querySelector(".contact-form");
const projectDialog = document.querySelector("#projectDialog");
const projectDialogButton = document.querySelector("[data-open-project]");
const projectDialogClose = document.querySelector(".dialog-close");
const pixelPet = document.querySelector(".pixel-orbit");
const tiltTargets = document.querySelectorAll(
  ".project-card, .product-media, .product-info, .skill-card, .timeline-card, .contact-form, .contact-card, .personal-card-grid article",
);
const revealTargets = document.querySelectorAll(
  ".section-heading, .section-copy, .pixel-orbit, .product-media, .product-info, .project-card, .skill-card, .timeline-item, .contact-form, .contact-card, .site-footer",
);

let pointerFrame = 0;
let scrollFrame = 0;
let petTapTimer = 0;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

window.addEventListener("pointermove", (event) => {
  if (pointerFrame) return;

  pointerFrame = requestAnimationFrame(() => {
    document.body.classList.add("is-pointer-active");
    document.documentElement.style.setProperty("--mouse-x", `${event.clientX}px`);
    document.documentElement.style.setProperty("--mouse-y", `${event.clientY}px`);

    if (pixelPet) {
      const rect = pixelPet.getBoundingClientRect();
      const petX = rect.left + rect.width / 2;
      const petY = rect.top + rect.height / 2;
      const deltaX = event.clientX - petX;
      const deltaY = event.clientY - petY;
      const distance = Math.hypot(deltaX, deltaY);
      const pull = Math.max(0, 1 - distance / 430);

      pixelPet.style.setProperty("--pet-x", `${clamp(deltaX * 0.055 * pull, -14, 14)}px`);
      pixelPet.style.setProperty("--pet-y", `${clamp(deltaY * 0.045 * pull, -10, 10)}px`);
      pixelPet.style.setProperty("--eye-x", `${clamp(deltaX * 0.025, -4, 4)}px`);
      pixelPet.style.setProperty("--eye-y", `${clamp(deltaY * 0.025, -3, 3)}px`);
      pixelPet.classList.toggle("is-pet-close", distance < 230);
    }

    pointerFrame = 0;
  });
});

window.addEventListener("pointerleave", () => {
  document.body.classList.remove("is-pointer-active");
  pixelPet?.classList.remove("is-pet-close");
  pixelPet?.style.removeProperty("--pet-x");
  pixelPet?.style.removeProperty("--pet-y");
  pixelPet?.style.removeProperty("--eye-x");
  pixelPet?.style.removeProperty("--eye-y");
});

pixelPet?.addEventListener("pointerdown", () => {
  if (window.innerWidth > 840) return;

  window.clearTimeout(petTapTimer);
  pixelPet.classList.add("is-pet-close");
  pixelPet.style.setProperty("--pet-x", "0px");
  pixelPet.style.setProperty("--pet-y", "-6px");
  pixelPet.style.setProperty("--eye-x", "3px");
  pixelPet.style.setProperty("--eye-y", "-2px");

  petTapTimer = window.setTimeout(() => {
    pixelPet.classList.remove("is-pet-close");
    pixelPet.style.removeProperty("--pet-x");
    pixelPet.style.removeProperty("--pet-y");
    pixelPet.style.removeProperty("--eye-x");
    pixelPet.style.removeProperty("--eye-y");
  }, 900);
});

const updateScrollProgress = () => {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
  document.documentElement.style.setProperty("--scroll-progress", `${progress}%`);
};

window.addEventListener("scroll", () => {
  if (scrollFrame) return;

  scrollFrame = requestAnimationFrame(() => {
    updateScrollProgress();
    scrollFrame = 0;
  });
});

revealTargets.forEach((target, index) => {
  target.classList.add("reveal", `reveal-delay-${index % 4}`);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
);

revealTargets.forEach((target) => revealObserver.observe(target));
updateScrollProgress();

tiltTargets.forEach((target) => {
  target.addEventListener("pointermove", (event) => {
    if (window.innerWidth < 841) return;

    const rect = target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    target.style.setProperty("--card-x", `${event.clientX - rect.left}px`);
    target.style.setProperty("--card-y", `${event.clientY - rect.top}px`);
    target.style.setProperty("--tilt-x", `${clamp(x * 3.2, -3.2, 3.2)}deg`);
    target.style.setProperty("--tilt-y", `${clamp(y * -3.2, -3.2, 3.2)}deg`);
  });

  target.addEventListener("pointerleave", () => {
    target.style.removeProperty("--card-x");
    target.style.removeProperty("--card-y");
    target.style.removeProperty("--tilt-x");
    target.style.removeProperty("--tilt-y");
  });
});

menuButton?.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

navLinks?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    navLinks.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
  }
});

projectDialogButton?.addEventListener("click", () => {
  projectDialog?.showModal();
});

projectDialogClose?.addEventListener("click", () => {
  projectDialog?.close();
});

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = contactForm.querySelector("button");
  if (!button) return;

  const formData = new FormData(contactForm);
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!name || !email || !message) {
    contactForm.reportValidity();
    return;
  }

  const subject = encodeURIComponent(`Contato pelo portfólio - ${name}`);
  const body = encodeURIComponent(
    `Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`,
  );

  const originalText = button.textContent;
  button.textContent = "Abrindo email...";
  window.location.href = `mailto:marcos.neto0706@gmail.com?subject=${subject}&body=${body}`;

  setTimeout(() => {
    button.textContent = originalText;
  }, 2200);
});
