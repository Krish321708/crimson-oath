const laws = [
  {
    numeral: "I",
    line: "The soul serves only its word.",
    body: "A command ends when the throne falls silent. A promise begins precisely there—when no eye remains to praise the keeping of it.",
  },
  {
    numeral: "II",
    line: "It is strength that has mastered itself.",
    body: "Any sword can answer anger. The rarer courage is to hold power without becoming its prisoner, and to leave tomorrow more honourable than today.",
  },
  {
    numeral: "III",
    line: "Deeds remain in those they sheltered.",
    body: "Glory begs to be remembered. Duty asks for nothing. The finest legacy is a world made safer by hands history never learned to applaud.",
  },
];

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const scrollButtons = document.querySelectorAll("[data-scroll]");
const navButtons = document.querySelectorAll(".royal-header nav button");
const oathDialog = document.querySelector(".oath-overlay");
const sealButton = document.querySelector(".seal-button");
const seal = document.querySelector(".modal-seal");
const lawTabs = [...document.querySelectorAll(".law-tabs [role=tab]")];
const lawPanel = document.querySelector(".law-page");

function moveTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
}

function renderLaw(index) {
  const law = laws[index];
  lawPanel.innerHTML = `
    <article class="law-content">
      <span class="law-number">${law.numeral}</span>
      <p class="law-line">${law.line}</p>
      <p class="law-body">${law.body}</p>
      <div class="law-seal" aria-hidden="true">CO</div>
    </article>`;

  lawTabs.forEach((tab, tabIndex) => {
    const selected = tabIndex === index;
    tab.classList.toggle("active", selected);
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
}

scrollButtons.forEach((button) => button.addEventListener("click", () => moveTo(button.dataset.scroll)));

lawTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => renderLaw(index));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? lawTabs.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + lawTabs.length) % lawTabs.length;
    lawTabs[next].focus();
    renderLaw(next);
  });
});

document.querySelectorAll("[data-open-oath]").forEach((button) => {
  button.addEventListener("click", () => oathDialog.showModal());
});
document.querySelector("[data-close-oath]").addEventListener("click", () => oathDialog.close());
oathDialog.addEventListener("click", (event) => {
  if (event.target === oathDialog) oathDialog.close();
});

sealButton.addEventListener("click", () => {
  sealButton.disabled = true;
  sealButton.textContent = "The oath is sealed";
  sealButton.classList.add("done");
  seal.classList.add("sealed");
  sealButton.nextElementSibling.textContent = "Your word now stands without witness.";
});

const sections = [...navButtons]
  .map((button) => document.getElementById(button.dataset.scroll))
  .filter(Boolean);
const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navButtons.forEach((button) => button.classList.toggle("active", button.dataset.scroll === visible.target.id));
  },
  { rootMargin: "-38% 0px -50%", threshold: [0, 0.2, 0.5] },
);
sections.forEach((section) => sectionObserver.observe(section));

const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
  { threshold: 0.18 },
);
document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const dustField = document.querySelector(".dust-field");
for (let index = 0; index < 22; index += 1) {
  const particle = document.createElement("i");
  particle.style.setProperty("--x", `${(index * 41 + 7) % 100}%`);
  particle.style.setProperty("--y", `${(index * 29 + 13) % 100}%`);
  particle.style.setProperty("--delay", `${(index % 7) * 0.7}s`);
  particle.style.setProperty("--duration", `${7 + (index % 5) * 1.8}s`);
  particle.style.setProperty("--size", `${1 + (index % 3)}px`);
  dustField.append(particle);
}

let ticking = false;
function updateScrollEffects() {
  const scrollY = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  document.documentElement.style.setProperty("--scroll-progress", String(maxScroll > 0 ? scrollY / maxScroll : 0));
  document.documentElement.style.setProperty("--hero-offset", `${Math.min(scrollY * 0.16, 180)}px`);
  document.documentElement.style.setProperty("--hero-scale", String(1.03 + Math.min(scrollY / 12000, 0.11)));

  const realm = document.getElementById("realm").getBoundingClientRect();
  document.documentElement.style.setProperty("--realm-shift", `${Math.max(-3, Math.min(3, (window.innerHeight * 0.5 - realm.top) / 160))}%`);
  ticking = false;
}
window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(updateScrollEffects);
    ticking = true;
  }
}, { passive: true });
window.addEventListener("pointermove", (event) => {
  document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
  document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
}, { passive: true });

renderLaw(0);
updateScrollEffects();
