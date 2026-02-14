const PERFUMES = [
  {
    id: "billionaire",
    file: "billionaire.jpeg",
    profile: "Woody Amber",
    mood: "Bold evenings and sharp impressions",
    longevity: "8-10 hours",
    notes: "Bergamot, cedarwood and warm amber",
    description: "A power scent with deep woody character and a smooth amber finish for statement wear."
  },
  {
    id: "coldwar",
    file: "coldwar.jpeg",
    profile: "Fresh Spicy",
    mood: "Cool daytime confidence",
    longevity: "6-8 hours",
    notes: "Mint, pepper and clean musk",
    description: "Crisp and energetic with icy freshness, designed for active mornings and sharp office hours."
  },
  {
    id: "heavenly",
    file: "heavenly.jpeg",
    profile: "Floral Musk",
    mood: "Soft elegance for daily wear",
    longevity: "7-9 hours",
    notes: "White florals, powdery iris and soft musk",
    description: "Balanced floral warmth with a gentle musk base that stays refined from day to evening."
  },
  {
    id: "old-love",
    file: "old love.jpeg",
    profile: "Sweet Oriental",
    mood: "Warm nostalgic date nights",
    longevity: "8-9 hours",
    notes: "Vanilla, saffron and sweet resin",
    description: "A comforting sweet oriental blend with rich depth, ideal for romantic nights and cooler weather."
  }
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
      <article class="col-12 col-sm-6 col-lg-4 col-xl-3 d-flex">
        <div class="card h-100 w-100">
        <div class="product-media">
          <img src="${getImageSrc(p.file)}" alt="${name}" loading="lazy" />
        </div>
        <div class="card-body d-flex flex-column p-3 p-md-4">
          <h4 class="card-title">${name}</h4>
          <div class="size-picker" data-product="${p.id}">
            <button type="button" class="size-chip" data-size="50ml">50 ml</button>
            <button type="button" class="size-chip" data-size="100ml">100 ml</button>
          </div>
          <p class="price" data-price-for="${p.id}">Select size to reveal price</p>
          <div class="product-details">
            <p><strong>Profile:</strong> ${p.profile}</p>
            <p><strong>Longevity:</strong> ${p.longevity}</p>
            <p><strong>Best for:</strong> ${p.mood}</p>
          </div>
          <a class="btn btn-dark mt-auto rounded-pill px-3" href="product.html?id=${p.id}">View Product</a>
        </div>
        </div>
      </article>
    `;
  }).join("");

  [...products.querySelectorAll(".size-picker")].forEach((picker) => {
    const productId = picker.getAttribute("data-product");
    if (!productId) return;
    const priceEl = products.querySelector(`[data-price-for="${productId}"]`);
    if (!priceEl) return;

    const chips = [...picker.querySelectorAll(".size-chip")];
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((item) => item.classList.remove("active"));
        chip.classList.add("active");
        const size = chip.getAttribute("data-size") || "50ml";
        const value = PRICE_BY_SIZE[size];
        priceEl.textContent = `${size.replace("ml", " ml")} : INR ${value}`;
      });
    });
  });

  slides.innerHTML = PERFUMES.map((p) => {
    const name = toTitleFromFile(p.file);
    const src = getImageSrc(p.file);
    return `
      <article class="slide">
        <div class="slide-bg" style="background-image: url('${src}')"></div>
        <div class="hero-image-wrap">
          <img src="${src}" alt="${name}" />
        </div>
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
  const profile = document.getElementById("product-profile");
  const description = document.getElementById("product-description");
  const mood = document.getElementById("product-mood");
  const longevity = document.getElementById("product-longevity");
  const notes = document.getElementById("product-notes");
  const selectedPrice = document.getElementById("selected-price");
  const addButton = document.getElementById("add-to-cart");
  const status = document.getElementById("status");
  if (!image || !title || !addButton || !status) return;

  image.src = getImageSrc(perfume.file);
  image.alt = name;
  title.textContent = name;
  if (profile) profile.textContent = perfume.profile || "Premium Perfume";
  if (description) description.textContent = perfume.description || "Crafted for daily confidence and lasting freshness.";
  if (mood) mood.textContent = perfume.mood || "Any occasion";
  if (longevity) longevity.textContent = perfume.longevity || "Long lasting";
  if (notes) notes.textContent = perfume.notes || "Balanced aromatic blend";

  function updateSelectedPrice() {
    const selected = document.querySelector('input[name="size"]:checked');
    const size = selected ? selected.value : "50ml";
    const unitPrice = PRICE_BY_SIZE[size];
    if (selectedPrice) {
      selectedPrice.textContent = `${size.replace("ml", " ml")} - INR ${unitPrice}`;
    }
  }
  updateSelectedPrice();
  [...document.querySelectorAll('input[name="size"]')].forEach((radio) => {
    radio.addEventListener("change", updateSelectedPrice);
  });

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
