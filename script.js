const PERFUMES = [
  { id: "billionaire", file: "billionaire.jpeg" },
  { id: "coldwar", file: "coldwar.jpeg" },
  { id: "heavenly", file: "heavenly.jpeg" },
  { id: "old-love", file: "old love.jpeg" }
];

const PRICE_BY_SIZE = {
  "50ml": 799,
  "100ml": 1299
};

function toTitleFromFile(fileName) {
  const base = fileName.replace(/\.[^/.]+$/, "");
  return base
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function getImageSrc(fileName) {
  return encodeURI(fileName);
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cart_items") || "[]");
  } catch {
    return [];
  }
}

function setCart(items) {
  localStorage.setItem("cart_items", JSON.stringify(items));
}

function getPerfumeById(id) {
  return PERFUMES.find((p) => p.id === id) || PERFUMES[0];
}

function updateCartCount() {
  const el = document.getElementById("cart-count");
  if (!el) return;
  el.textContent = String(getCart().length);
}

function renderHomePage() {
  const products = document.getElementById("products");
  const slides = document.getElementById("slides");
  const dots = document.getElementById("dots");
  if (!products || !slides || !dots) return;

  products.innerHTML = PERFUMES.map((p) => {
    const name = toTitleFromFile(p.file);
    return `
      <article class="card">
        <div class="media">
          <img src="${getImageSrc(p.file)}" alt="${name}" />
        </div>
        <div class="body">
          <h4>${name}</h4>
          <p class="price">50 ml: INR 799 | 100 ml: INR 1299</p>
          <a href="product.html?id=${p.id}">View Product</a>
        </div>
      </article>
    `;
  }).join("");

  slides.innerHTML = PERFUMES.map((p) => {
    const name = toTitleFromFile(p.file);
    return `
      <article class="slide">
        <img src="${getImageSrc(p.file)}" alt="${name}" />
        <div class="overlay">
          <div>
            <h2>${name}</h2>
            <p>Premium perfume in 50 ml and 100 ml options</p>
          </div>
        </div>
      </article>
    `;
  }).join("");

  let index = 0;
  dots.innerHTML = PERFUMES.map((_, i) => `<button class="dot${i === 0 ? " active" : ""}" aria-label="slide ${i + 1}"></button>`).join("");
  const dotEls = [...dots.querySelectorAll(".dot")];

  function goTo(next) {
    index = next;
    slides.style.transform = `translateX(-${index * 100}%)`;
    dotEls.forEach((dot, i) => dot.classList.toggle("active", i === index));
  }

  dotEls.forEach((dot, i) => {
    dot.addEventListener("click", () => goTo(i));
  });

  setInterval(() => {
    goTo((index + 1) % PERFUMES.length);
  }, 3200);
}

function renderProductPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || PERFUMES[0].id;
  const perfume = getPerfumeById(id);

  const name = toTitleFromFile(perfume.file);
  const image = document.getElementById("product-image");
  const title = document.getElementById("product-name");
  const addButton = document.getElementById("add-to-cart");
  const status = document.getElementById("status");
  if (!image || !title || !addButton || !status) return;

  image.src = getImageSrc(perfume.file);
  image.alt = name;
  title.textContent = name;

  addButton.addEventListener("click", () => {
    const selected = document.querySelector('input[name="size"]:checked');
    const size = selected ? selected.value : "50ml";
    const unitPrice = PRICE_BY_SIZE[size];
    const cart = getCart();
    cart.push({
      perfumeId: perfume.id,
      name,
      file: perfume.file,
      size,
      unitPrice,
      qty: 1
    });
    setCart(cart);
    status.textContent = `${name} (${size}) added to cart.`;
  });
}

function renderCartPage() {
  const list = document.getElementById("cart-items");
  const totalEl = document.getElementById("total");
  if (!list || !totalEl) return;

  const cart = getCart();
  if (!cart.length) {
    list.innerHTML = "<p>Your cart is empty.</p>";
    totalEl.textContent = "Total: INR 0";
    return;
  }

  list.innerHTML = cart.map((item, i) => `
    <article class="row">
      <img src="${getImageSrc(item.file)}" alt="${item.name}" />
      <div>
        <strong>${item.name}</strong>
        <p>${item.size}</p>
      </div>
      <div>INR ${item.unitPrice}</div>
      <button data-remove="${i}" type="button">Remove</button>
    </article>
  `).join("");

  const total = cart.reduce((sum, item) => sum + (item.unitPrice * (item.qty || 1)), 0);
  totalEl.textContent = `Total: INR ${total}`;

  [...list.querySelectorAll("button[data-remove]")].forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.getAttribute("data-remove"));
      const next = getCart().filter((_, i) => i !== idx);
      setCart(next);
      renderCartPage();
    });
  });
}

const page = document.body.getAttribute("data-page");
if (page === "home") renderHomePage();
if (page === "product") renderProductPage();
if (page === "cart") renderCartPage();
updateCartCount();
