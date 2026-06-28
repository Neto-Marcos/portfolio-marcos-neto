const projectDetails = {
  "mn-check": {
    title: "MN Check",
    status: "Em desenvolvimento",
    text: "Sistema operacional para expedicao e contagem de estoque, com conferencia por codigo, importacao de PDF, dashboard, historico e persistencia em PostgreSQL.",
    stack: ["Java", "Spring Boot", "PostgreSQL", "PDFBox", "JavaScript"]
  }
};

const navLinks = document.querySelectorAll(".topbar nav a");
const sections = document.querySelectorAll("main section[id]");
const reveals = document.querySelectorAll(".reveal");
const dialog = document.querySelector("#projectDialog");
const dialogTitle = document.querySelector("#dialogTitle");
const dialogText = document.querySelector("#dialogText");
const dialogStatus = document.querySelector("#dialogStatus");
const dialogStack = document.querySelector("#dialogStack");
const closeDialog = document.querySelector(".dialog-close");

document.querySelectorAll("[data-detail]").forEach((button) => {
  button.addEventListener("click", () => {
    const detail = projectDetails[button.dataset.detail];
    if (!detail || !dialog) return;
    dialogTitle.textContent = detail.title;
    dialogText.textContent = detail.text;
    dialogStatus.textContent = detail.status;
    dialogStack.innerHTML = detail.stack.map((item) => `<span>${item}</span>`).join("");
    dialog.showModal();
  });
});

closeDialog?.addEventListener("click", () => dialog.close());
dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

const setActiveNav = (id) => {
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
  });
};

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActiveNav(visible.target.id);
  },
  { threshold: [0.35, 0.6] }
);

sections.forEach((section) => sectionObserver.observe(section));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.16 }
);

reveals.forEach((item) => revealObserver.observe(item));
