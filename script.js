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

const COMBOS = [
  {
    id: "luxury-combo",
    file: "combo-pack.png",
    name: "The Royal Duo",
    profile: "Mixed Bundle",
    mood: "Perfect for gifting",
    longevity: "Variable",
    notes: "A curated mix of our best sellers",
    description: "Experience the best of both worlds. The Royal Duo includes a bold woody scent for evenings and a fresh spicy scent for the day.",
    isCombo: true
  }
]

const PRICE_BY_SIZE = {
  "50ml": 799,
  "100ml": 1299,
  "Combo Pack": 1999 // Fixed price for combo
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

// ============== CART LOGIC =================

function getCart() {
  try { return JSON.parse(localStorage.getItem("cart_items") || "[]"); } 
  catch { return []; }
}

function setCart(items) {
  localStorage.setItem("cart_items", JSON.stringify(items));
  updateCartCount();
}

/**
 * BOGO Logic: Buy 1 Get 1 Free on all items.
 * We flatten the cart into individual items, sort by price descending,
 * and every 2nd item in the sorted list is free.
 */
function calculateCartTotals(cart) {
  let flattened = [];
  cart.forEach((item, index) => {
    for (let i = 0; i < (item.qty || 1); i++) {
       flattened.push({ ...item, originalIndex: index });
    }
  });

  // Sort descending by price
  flattened.sort((a, b) => b.unitPrice - a.unitPrice);

  let subtotal = 0;
  let discount = 0;
  
  flattened.forEach((item, i) => {
    subtotal += item.unitPrice;
    if (i % 2 !== 0) {
      item.isFree = true;
      discount += item.unitPrice;
    } else {
      item.isFree = false;
    }
  });

  return { flattened, subtotal, discount, total: subtotal - discount };
}

function showToast(msg) {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<ion-icon name="checkmark-circle" style="color: #b38550; font-size: 20px;"></ion-icon> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "slideDown 0.4s ease-in forwards";
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

function updateCartCount() {
  const el = document.getElementById("cart-count");
  if (!el) return;
  const cart = getCart();
  const totalItems = cart.reduce((acc, item) => acc + (item.qty || 1), 0);
  el.textContent = totalItems.toString();
}

// ============== HOME PAGE RENDERING =================

function renderHomePage() {
  const productsContainer = document.getElementById("products");
  const combosContainer = document.getElementById("combos");
  const slides = document.getElementById("slides");
  const dots = document.getElementById("dots");

  if (combosContainer) {
    combosContainer.innerHTML = COMBOS.map((p) => {
      const src = getImageSrc(p.file);
      return `
        <article class="product-card">
          <div class="badge-combo">Best Value</div>
          <div class="product-media">
            <img src="${src}" alt="${p.name}" loading="lazy" />
          </div>
          <div class="product-body">
            <h4 class="product-title">${p.name}</h4>
            <div class="product-profile">${p.profile}</div>
            <div class="price-box">
              <span class="current-price">INR ${PRICE_BY_SIZE["Combo Pack"]}</span>
              <span class="original-price">INR 2598</span>
            </div>
            <a class="btn-primary" style="display:block; text-align:center;" href="product.html?id=${p.id}&type=combo">View Combo</a>
          </div>
        </article>
      `;
    }).join("");
  }

  if (productsContainer) {
    productsContainer.innerHTML = PERFUMES.map((p) => {
      const name = toTitleFromFile(p.file);
      return `
        <article class="product-card">
          <div class="badge-bogo">BOGO Eligible</div>
          <div class="product-media">
            <img src="${getImageSrc(p.file)}" alt="${name}" loading="lazy" />
          </div>
          <div class="product-body">
            <h4 class="product-title">${name}</h4>
            <div class="product-profile">${p.profile}</div>
            
            <div class="size-selector" data-product="${p.id}">
              <button class="size-btn active" data-size="50ml">50 ML</button>
              <button class="size-btn" data-size="100ml">100 ML</button>
            </div>
            
            <div class="price-box">
              <span class="current-price" data-price-for="${p.id}">INR ${PRICE_BY_SIZE["50ml"]}</span>
            </div>
            
            <a class="btn-primary" style="display:block; text-align:center;" href="product.html?id=${p.id}">View Details</a>
          </div>
        </article>
      `;
    }).join("");

    // Setup Size Selection listeners
    [...productsContainer.querySelectorAll(".size-selector")].forEach((picker) => {
      const productId = picker.getAttribute("data-product");
      const priceEl = productsContainer.querySelector(`[data-price-for="${productId}"]`);
      if (!priceEl) return;
      const btns = [...picker.querySelectorAll(".size-btn")];
      btns.forEach((btn) => {
        btn.addEventListener("click", () => {
          btns.forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          const size = btn.getAttribute("data-size");
          priceEl.textContent = `INR ${PRICE_BY_SIZE[size]}`;
        });
      });
    });
  }

  if (slides && dots) {
    slides.innerHTML = PERFUMES.map((p, i) => {
      const name = toTitleFromFile(p.file);
      const src = getImageSrc(p.file);
      return `
        <article class="slide ${i === 0 ? "active" : ""}">
          <div class="slide-bg-blur" style="background-image: url('${src}')"></div>
          <div class="slide-img-wrapper">
            <img src="${src}" alt="${name}" />
          </div>
          <div class="overlay">
            <h2>${name}</h2>
            <p>Elevate your presence.</p>
          </div>
        </article>
      `;
    }).join("");

    let index = 0;
    dots.innerHTML = PERFUMES.map((_, i) => `<button class="dot ${i === 0 ? "active" : ""}" aria-label="slide ${i + 1}"></button>`).join("");
    const dotEls = [...dots.querySelectorAll(".dot")];
    const slideEls = [...slides.querySelectorAll(".slide")];

    function goTo(next) {
      index = next;
      slides.style.transform = `translateX(-${index * 100}%)`;
      dotEls.forEach((dot, i) => dot.classList.toggle("active", i === index));
      slideEls.forEach((slide, i) => slide.classList.toggle("active", i === index));
    }

    dotEls.forEach((dot, i) => dot.addEventListener("click", () => goTo(i)));
    setInterval(() => goTo((index + 1) % PERFUMES.length), 4000);
  }
}

// ============== PRODUCT PAGE RENDERING =================

function renderProductPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const type = params.get("type");
  
  let itemData;
  if(type === 'combo') {
    itemData = COMBOS.find(c => c.id === id) || COMBOS[0];
  } else {
    itemData = PERFUMES.find(p => p.id === id) || PERFUMES[0];
  }

  const name = itemData.name || toTitleFromFile(itemData.file);
  const isCombo = itemData.isCombo;

  document.getElementById("product-image").src = getImageSrc(itemData.file);
  document.getElementById("product-name").textContent = name;
  document.getElementById("product-profile").textContent = itemData.profile;
  document.getElementById("product-description").textContent = itemData.description;
  document.getElementById("product-longevity").textContent = itemData.longevity;
  document.getElementById("product-mood").textContent = itemData.mood;
  document.getElementById("product-notes").textContent = itemData.notes;

  const sizeContainer = document.getElementById("size-options");
  const priceDisplay = document.getElementById("selected-price");
  const btnAdd = document.getElementById("add-to-cart");

  let currentSize = isCombo ? "Combo Pack" : "50ml";

  if (isCombo) {
    sizeContainer.innerHTML = `<button class="size-btn active">Combo Pack</button>`;
    priceDisplay.textContent = `INR ${PRICE_BY_SIZE["Combo Pack"]}`;
  } else {
    sizeContainer.innerHTML = `
      <button class="size-btn active" data-size="50ml">50 ML</button>
      <button class="size-btn" data-size="100ml">100 ML</button>
    `;
    priceDisplay.textContent = `INR ${PRICE_BY_SIZE["50ml"]}`;

    const btns = [...sizeContainer.querySelectorAll(".size-btn")];
    btns.forEach(btn => {
      btn.addEventListener("click", () => {
        btns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentSize = btn.getAttribute("data-size");
        priceDisplay.textContent = `INR ${PRICE_BY_SIZE[currentSize]}`;
      });
    });
  }

  btnAdd.addEventListener("click", () => {
    const cart = getCart();
    
    // Check if identical item exists to just increment qty
    const existingIndex = cart.findIndex(c => c.itemId === itemData.id && c.size === currentSize);
    if(existingIndex >= 0) {
      cart[existingIndex].qty += 1;
    } else {
      cart.push({
        itemId: itemData.id,
        name: name,
        file: itemData.file,
        size: currentSize,
        unitPrice: PRICE_BY_SIZE[currentSize],
        qty: 1,
        isCombo: isCombo || false
      });
    }

    setCart(cart);
    showToast(`Added ${name} to cart.`);
  });
}

// ============== CART PAGE RENDERING =================

function renderCartPage() {
  const container = document.getElementById("cart-items");
  const summaryBox = document.getElementById("cart-summary");
  const subtotalEl = document.getElementById("subtotal-display");
  const discountEl = document.getElementById("discount-display");
  const totalEl = document.getElementById("total-display");
  if (!container) return;

  const cart = getCart();
  
  if (cart.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding: 40px; color:#999;">Your cart is empty.</div>`;
    summaryBox.style.display = "none";
    return;
  }

  summaryBox.style.display = "flex";

  const { flattened, subtotal, discount, total } = calculateCartTotals(cart);

  // Group flattened back for display to show exactly which ones are free
  let html = "";
  flattened.forEach((item, idx) => {
    html += `
      <div class="cart-item ${item.isFree ? 'free-item' : ''}">
        <div class="cart-item-img">
          <img src="${getImageSrc(item.file)}" alt="${item.name}" />
        </div>
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>${item.size} ${item.isFree ? '<b style="color:#b38550;">(FREE BOGO)</b>' : ''}</p>
        </div>
        <div class="cart-item-price ${item.isFree ? 'discounted' : ''}">
          ${item.isFree ? `
            <span class="strikethrough">INR ${item.unitPrice}</span>
            FREE
          ` : `INR ${item.unitPrice}`}
        </div>
        <button class="cart-item-remove" data-flat-idx="${idx}" title="Remove item">
          <ion-icon name="trash-outline" style="font-size:20px;"></ion-icon>
        </button>
      </div>
    `;
  });

  container.innerHTML = html;
  
  subtotalEl.textContent = `INR ${subtotal}`;
  discountEl.textContent = `- INR ${discount}`;
  totalEl.textContent = `INR ${total}`;

  [...container.querySelectorAll(".cart-item-remove")].forEach(btn => {
    btn.addEventListener("click", () => {
      const flatIdx = Number(btn.getAttribute("data-flat-idx"));
      const targetOriginalIndex = flattened[flatIdx].originalIndex;
      
      const currentCart = getCart();
      if(currentCart[targetOriginalIndex].qty > 1) {
         currentCart[targetOriginalIndex].qty -= 1;
      } else {
         currentCart.splice(targetOriginalIndex, 1);
      }
      setCart(currentCart);
      renderCartPage(); // re-render
    });
  });
}

// Router
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.getAttribute("data-page");
  updateCartCount();

  if (page === "home") renderHomePage();
  if (page === "product") renderProductPage();
  if (page === "cart") renderCartPage();
});
