const projectDetails = {
  "mm-check": {
    title: "MM Check",
    status: "Em desenvolvimento",
    text: "Sistema operacional para expedição e contagem de estoque, com conferência por código, importação de PDF, dashboard, histórico e persistência em PostgreSQL.",
    stack: ["Java", "Spring Boot", "PostgreSQL", "PDFBox", "JavaScript"]
  },
  biblioteca: {
    title: "Sistema de Biblioteca",
    status: "Concluído",
    text: "Projeto em Java para treinar organização de acervo, empréstimos, devoluções, pesquisa e regras de negócio.",
    stack: ["Java", "POO", "Lógica de programação"]
  },
  ponto: {
    title: "Aplicativo de Ponto Inteligente",
    status: "Protótipo",
    text: "Ideia de sistema para registro de ponto, reconhecimento facial, cálculo de horas extras e apoio à folha de pagamento.",
    stack: ["Python", "IA", "Automação"]
  }
};

const sidebar = document.querySelector(".sidebar");
const menuToggle = document.querySelector(".menu-toggle");
const filterButtons = document.querySelectorAll("[data-filter]");
const projectCards = document.querySelectorAll(".project-card");
const navLinks = document.querySelectorAll("[data-nav], .mobile-nav a");
const sections = document.querySelectorAll("main section[id]");
const reveals = document.querySelectorAll(".reveal");
const dialog = document.querySelector("#projectDialog");
const dialogTitle = document.querySelector("#dialogTitle");
const dialogText = document.querySelector("#dialogText");
const dialogStatus = document.querySelector("#dialogStatus");
const dialogStack = document.querySelector("#dialogStack");
const closeDialog = document.querySelector(".dialog-close");
const copyEmail = document.querySelector("#copyEmail");

menuToggle?.addEventListener("click", () => {
  sidebar?.classList.toggle("open");
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    projectCards.forEach((card) => {
      const categories = card.dataset.category || "";
      card.hidden = filter !== "all" && !categories.includes(filter);
    });
  });
});

document.querySelectorAll("[data-detail]").forEach((button) => {
  button.addEventListener("click", () => {
    const detail = projectDetails[button.dataset.detail];
    if (!detail) return;
    dialogTitle.textContent = detail.title;
    dialogText.textContent = detail.text;
    dialogStatus.textContent = detail.status;
    dialogStatus.className = `status ${detail.status === "Concluído" ? "done" : detail.status === "Protótipo" ? "prototype" : "dev"}`;
    dialogStack.innerHTML = detail.stack.map((item) => `<span>${item}</span>`).join("");
    dialog.showModal();
  });
});

closeDialog?.addEventListener("click", () => dialog.close());
dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

copyEmail?.addEventListener("click", async () => {
  const email = "marcos.neto0706@gmail.com";
  try {
    await navigator.clipboard.writeText(email);
    copyEmail.textContent = "Email copiado";
    setTimeout(() => {
      copyEmail.textContent = "Copiar email";
    }, 1600);
  } catch {
    copyEmail.textContent = email;
  }
});

const setActiveNav = (id) => {
  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    const target = link.dataset.nav || href.replace("#", "");
    link.classList.toggle("active", target === id);
  });
};

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActiveNav(visible.target.id);
  },
  { threshold: [0.34, 0.55, 0.78] }
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

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") sidebar?.classList.remove("open");
});
