/* ---------- Mobile nav ---------- */
const burgerBtn = document.getElementById("burgerBtn");
const mainNav = document.getElementById("mainNav");
const navOverlay = document.getElementById("navOverlay");
const navClose = document.getElementById("navClose");
function closeNav() { mainNav.classList.remove("open"); navOverlay.classList.remove("open"); }
burgerBtn.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  navOverlay.classList.toggle("open", open);
});
navClose.addEventListener("click", closeNav);
navOverlay.addEventListener("click", closeNav);
mainNav.querySelectorAll("a").forEach(a => a.addEventListener("click", closeNav));

/* ---------- FAQ accordion ---------- */
document.querySelectorAll(".faq-item").forEach(item => {
  const question = item.querySelector(".faq-question");
  question.addEventListener("click", () => {
    const wasOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("open"));
    if (!wasOpen) item.classList.add("open");
  });
});

/* ---------- Waitlist forms (demo, no backend) ---------- */
function handleWaitlistSubmit(form, msgEl) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (msgEl) msgEl.textContent = t("waitlist_success");
    else alert(t("waitlist_success"));
    form.reset();
  });
}
handleWaitlistSubmit(document.getElementById("heroWaitlistForm"), null);
handleWaitlistSubmit(document.getElementById("waitlistForm"), document.getElementById("waitlistMsg"));

/* ---------- Reveal on scroll ---------- */
function observeReveals() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal:not(.visible)").forEach(el => io.observe(el));
}
observeReveals();

/* ---------- Header shadow on scroll ---------- */
const header = document.getElementById("header");
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 10);
});
