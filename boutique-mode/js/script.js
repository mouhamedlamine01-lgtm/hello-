const WHATSAPP_NUMBER = "14045631778";

const PRODUCTS = [
  { id: 1, name: { fr: "Robe élégante", en: "Elegant dress" }, category: "vetements", price: 25000, oldPrice: 35000, rating: 5, img: "images/product-1.svg" },
  { id: 2, name: { fr: "Ensemble tendance", en: "Trendy outfit" }, category: "vetements", price: 30000, oldPrice: null, rating: 4, img: "images/product-2.svg" },
  { id: 3, name: { fr: "Sac à main chic", en: "Chic handbag" }, category: "sacs", price: 22000, oldPrice: 28000, rating: 5, img: "images/product-3.svg" },
  { id: 4, name: { fr: "Sandales féminines", en: "Women's sandals" }, category: "chaussures", price: 15000, oldPrice: null, rating: 4, img: "images/product-4.svg" },
  { id: 5, name: { fr: "Escarpins", en: "Pumps" }, category: "chaussures", price: 18000, oldPrice: 24000, rating: 5, img: "images/product-5.svg" },
  { id: 6, name: { fr: "Collier doré", en: "Gold necklace" }, category: "accessoires", price: 9000, oldPrice: null, rating: 4, img: "images/product-6.svg" },
  { id: 7, name: { fr: "Lunettes tendance", en: "Trendy sunglasses" }, category: "accessoires", price: 12000, oldPrice: 16000, rating: 5, img: "images/product-7.svg" },
  { id: 8, name: { fr: "Montre femme", en: "Women's watch" }, category: "accessoires", price: 20000, oldPrice: null, rating: 4, img: "images/product-8.svg" },
];

const REVIEWS = [
  { name: "Aïssatou", avatar: "images/avatar-1.svg", rating: 5, text: { fr: "J'ai adoré ma robe ! La qualité est magnifique et la livraison a été rapide.", en: "I loved my dress! The quality is beautiful and delivery was fast." } },
  { name: "Fatou", avatar: "images/avatar-2.svg", rating: 5, text: { fr: "Le service client est top, ils m'ont aidée à choisir la bonne taille sur WhatsApp.", en: "Customer service is amazing, they helped me pick the right size on WhatsApp." } },
  { name: "Mariam", avatar: "images/avatar-3.svg", rating: 4, text: { fr: "Le sac est encore plus beau en vrai. Je recommande cette boutique les yeux fermés.", en: "The bag is even prettier in person. I'd recommend this shop with my eyes closed." } },
  { name: "Khady", avatar: "images/avatar-4.svg", rating: 5, text: { fr: "Des articles tendance et une qualité premium. Ma nouvelle boutique préférée !", en: "Trendy pieces and premium quality. My new favorite shop!" } },
  { name: "Ndeye", avatar: "images/avatar-5.svg", rating: 5, text: { fr: "Commande passée un soir, reçue deux jours après. Un vrai plaisir.", en: "Ordered one evening, received it two days later. A real pleasure." } },
  { name: "Bineta", avatar: "images/avatar-6.svg", rating: 4, text: { fr: "Superbe collection, j'ai craqué pour trois pièces d'un coup !", en: "Gorgeous collection, I fell for three pieces at once!" } },
];

const money = (n) => n.toLocaleString("fr-FR") + " FCFA";
const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

/* ---------- Render products ---------- */
const productGrid = document.getElementById("productGrid");
let currentFilter = "all";

function renderProducts(filter = currentFilter) {
  currentFilter = filter;
  const lang = getLang();
  const items = filter === "all" ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);
  productGrid.innerHTML = items.map(p => {
    const discount = p.oldPrice ? Math.round(100 - (p.price / p.oldPrice) * 100) : null;
    const name = p.name[lang];
    return `
      <div class="product-card" data-category="${p.category}" data-name="${name.toLowerCase()}">
        <div class="product-img" onclick="openModal(${p.id})">
          ${discount ? `<span class="discount-tag">-${discount}%</span>` : ""}
          <img src="${p.img}" alt="${name}" loading="lazy">
        </div>
        <div class="product-body">
          <h4>${name}</h4>
          <span class="stars">${stars(p.rating)}</span>
          <div class="price-row">
            <span class="price">${money(p.price)}</span>
            ${p.oldPrice ? `<span class="old-price">${money(p.oldPrice)}</span>` : ""}
          </div>
          <div class="product-actions">
            <button class="add-cart-btn" onclick="addToCart(${p.id})">${t("add_to_cart")}</button>
            <button class="buy-now-btn" onclick="buyNow(${p.id})">${t("buy_now")}</button>
          </div>
        </div>
      </div>`;
  }).join("");
  observeReveals();
}

/* ---------- Render reviews ---------- */
function renderReviews() {
  const lang = getLang();
  document.getElementById("reviewsGrid").innerHTML = REVIEWS.map(r => `
    <div class="review-card reveal">
      <div class="review-top">
        <img src="${r.avatar}" alt="${r.name}">
        <div>
          <div class="review-name">${r.name}</div>
          <span class="stars">${stars(r.rating)}</span>
        </div>
      </div>
      <p>"${r.text[lang]}"</p>
    </div>
  `).join("");
  observeReveals();
}
renderReviews();

/* ---------- Filters ---------- */
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderProducts(btn.dataset.filter);
  });
});
document.querySelectorAll(".filter-trigger").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.filter;
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.toggle("active", b.dataset.filter === target));
    renderProducts(target);
    document.getElementById("products").scrollIntoView({ behavior: "smooth" });
  });
});

renderProducts();

/* ---------- Cart (localStorage) ---------- */
let cart = [];
try {
  cart = JSON.parse(safeGetItem("madame_store_cart") || "[]");
} catch (e) {
  cart = [];
}

function saveCart() {
  safeSetItem("madame_store_cart", JSON.stringify(cart));
  renderCart();
}

function addToCart(id, size = "M", color = null, qty = 1) {
  color = color || t("color_black");
  const existing = cart.find(i => i.id === id && i.size === size && i.color === color);
  if (existing) {
    existing.qty += qty;
  } else {
    const product = PRODUCTS.find(p => p.id === id);
    cart.push({ id: product.id, price: product.price, img: product.img, size, color, qty });
  }
  saveCart();
  openCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  saveCart();
}

function renderCart() {
  const lang = getLang();
  const cartItems = document.getElementById("cartItems");
  const cartCount = document.getElementById("cartCount");
  const cartTotal = document.getElementById("cartTotal");
  const cartWhatsapp = document.getElementById("cartWhatsapp");

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.qty * i.price, 0);

  cartCount.textContent = totalQty;
  cartTotal.textContent = money(totalPrice);

  cartItems.innerHTML = cart.length ? cart.map((item, idx) => {
    const product = PRODUCTS.find(p => p.id === item.id);
    const name = product ? product.name[lang] : "";
    return `
    <div class="cart-item">
      <img src="${item.img}" alt="${name}">
      <div class="cart-item-info">
        <h5>${name}</h5>
        <small>${item.size} · ${item.color}</small>
        <div class="qty-control">
          <button onclick="changeQty(${idx}, -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${idx}, 1)">+</button>
        </div>
      </div>
      <div>
        <div>${money(item.price * item.qty)}</div>
        <button class="remove-item" onclick="removeFromCart(${idx})">${t("cart_remove")}</button>
      </div>
    </div>`;
  }).join("") : `<p class="cart-empty">${t("cart_empty")}</p>`;

  const message = cart.length
    ? `${t("wa_order_intro")}%0A` +
      cart.map(i => {
        const product = PRODUCTS.find(p => p.id === i.id);
        const name = product ? product.name[lang] : "";
        return `- ${name} (${i.size}, ${i.color}) x${i.qty} — ${money(i.price * i.qty)}`;
      }).join("%0A") +
      `%0A%0A${t("wa_order_total")} : ${money(totalPrice)}`
    : t("wa_order_intro_empty");
  cartWhatsapp.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message.replace(/%0A/g, "\n"))}`;
}
renderCart();

function buyNow(id) {
  addToCart(id);
}

/* ---------- Cart drawer open/close ---------- */
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
function openCart() { cartDrawer.classList.add("open"); cartOverlay.classList.add("open"); }
function closeCart() { cartDrawer.classList.remove("open"); cartOverlay.classList.remove("open"); }
document.getElementById("cartToggle").addEventListener("click", openCart);
document.getElementById("cartClose").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", () => { closeCart(); closeModal(); });

/* ---------- Product quick view modal ---------- */
const productModal = document.getElementById("productModal");
const modalBody = document.getElementById("modalBody");
let modalState = { id: null, size: "M", color: null, qty: 1 };

const CAT_LABEL_KEYS = {
  vetements: "cat_label_vetements",
  chaussures: "cat_label_chaussures",
  sacs: "cat_label_sacs",
  accessoires: "cat_label_accessoires",
};

function openModal(id) {
  const lang = getLang();
  const p = PRODUCTS.find(x => x.id === id);
  const colors = [t("color_black"), t("color_beige"), t("color_pink")];
  modalState = { id, size: "M", color: colors[0], qty: 1 };
  const name = p.name[lang];
  modalBody.innerHTML = `
    <img src="${p.img}" alt="${name}">
    <div class="modal-info">
      <h4 class="eyebrow">${t(CAT_LABEL_KEYS[p.category])}</h4>
      <h3>${name}</h3>
      <span class="stars">${stars(p.rating)}</span>
      <div class="price-row" style="margin-top:10px;">
        <span class="price">${money(p.price)}</span>
        ${p.oldPrice ? `<span class="old-price">${money(p.oldPrice)}</span>` : ""}
      </div>
      <div class="option-group">
        <label>${t("modal_size")}</label>
        <div class="option-pills" id="sizePills">
          ${["S", "M", "L", "XL"].map(s => `<button class="option-pill ${s === "M" ? "active" : ""}" data-size="${s}">${s}</button>`).join("")}
        </div>
      </div>
      <div class="option-group">
        <label>${t("modal_color")}</label>
        <div class="option-pills" id="colorPills">
          ${colors.map((c, i) => `<button class="option-pill ${i === 0 ? "active" : ""}" data-color="${c}">${c}</button>`).join("")}
        </div>
      </div>
      <div class="option-group">
        <label>${t("modal_qty")}</label>
        <div class="qty-control">
          <button id="modalQtyMinus">−</button>
          <span id="modalQtyVal">1</span>
          <button id="modalQtyPlus">+</button>
        </div>
      </div>
      <div class="product-actions">
        <button class="add-cart-btn" id="modalAddCart">${t("add_to_cart")}</button>
        <button class="buy-now-btn" id="modalBuyNow">${t("buy_now_modal")}</button>
      </div>
    </div>
  `;

  modalBody.querySelectorAll("#sizePills .option-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      modalBody.querySelectorAll("#sizePills .option-pill").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      modalState.size = btn.dataset.size;
    });
  });
  modalBody.querySelectorAll("#colorPills .option-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      modalBody.querySelectorAll("#colorPills .option-pill").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      modalState.color = btn.dataset.color;
    });
  });
  modalBody.querySelector("#modalQtyMinus").addEventListener("click", () => {
    modalState.qty = Math.max(1, modalState.qty - 1);
    modalBody.querySelector("#modalQtyVal").textContent = modalState.qty;
  });
  modalBody.querySelector("#modalQtyPlus").addEventListener("click", () => {
    modalState.qty += 1;
    modalBody.querySelector("#modalQtyVal").textContent = modalState.qty;
  });
  modalBody.querySelector("#modalAddCart").addEventListener("click", () => {
    addToCart(modalState.id, modalState.size, modalState.color, modalState.qty);
    closeModal();
  });
  modalBody.querySelector("#modalBuyNow").addEventListener("click", () => {
    addToCart(modalState.id, modalState.size, modalState.color, modalState.qty);
    closeModal();
  });

  productModal.classList.add("open");
  modalOverlay.classList.add("open");
}

const modalOverlay = document.getElementById("modalOverlay");
function closeModal() { productModal.classList.remove("open"); modalOverlay.classList.remove("open"); }
document.getElementById("modalClose").addEventListener("click", closeModal);
modalOverlay.addEventListener("click", closeModal);

/* ---------- Mobile nav ---------- */
const burgerBtn = document.getElementById("burgerBtn");
const mainNav = document.getElementById("mainNav");
burgerBtn.addEventListener("click", () => mainNav.classList.toggle("open"));
mainNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => mainNav.classList.remove("open")));

/* ---------- Search ---------- */
const searchBar = document.getElementById("searchBar");
const searchInput = document.getElementById("searchInput");
document.getElementById("searchToggle").addEventListener("click", () => {
  searchBar.classList.toggle("open");
  if (searchBar.classList.contains("open")) searchInput.focus();
});
document.getElementById("searchClose").addEventListener("click", () => searchBar.classList.remove("open"));
searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  document.querySelectorAll(".product-card").forEach(card => {
    card.style.display = card.dataset.name.includes(q) ? "" : "none";
  });
});

/* ---------- Countdown ---------- */
let remaining = 23 * 3600 + 45 * 60 + 12;
function tickCountdown() {
  remaining = remaining > 0 ? remaining - 1 : 23 * 3600 + 45 * 60 + 12;
  const h = String(Math.floor(remaining / 3600)).padStart(2, "0");
  const m = String(Math.floor((remaining % 3600) / 60)).padStart(2, "0");
  const s = String(remaining % 60).padStart(2, "0");
  document.getElementById("cdH").textContent = h;
  document.getElementById("cdM").textContent = m;
  document.getElementById("cdS").textContent = s;
}
tickCountdown();
setInterval(tickCountdown, 1000);

/* ---------- Newsletter & contact (demo, no backend) ---------- */
document.getElementById("newsletterForm").addEventListener("submit", (e) => {
  e.preventDefault();
  document.getElementById("newsletterMsg").textContent = t("newsletter_success");
  e.target.reset();
});
document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  alert(t("contact_success_alert"));
  e.target.reset();
});

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

/* ---------- Language change ---------- */
function onLanguageChange() {
  renderProducts(currentFilter);
  renderReviews();
  renderCart();
  closeModal();
}
