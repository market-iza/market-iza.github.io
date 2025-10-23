// ======== index.js ========

// Глобальні змінні
let goodsData = [];
let currentSort = localStorage.getItem("sortOption") || "default";
let searchQuery = "";

const container = document.getElementById("goods-container");
const sortSelect = document.getElementById("sort-select");
const searchInput = document.getElementById("search-input");

// ===== Завантаження товарів =====
if (container) {
  fetch("goods.json")
    .then(res => res.json())
    .then(data => {
      goodsData = data.filter(item => item.visible);
      renderFilteredAndSortedGoods();
      window.goodsData = goodsData;
    })
    .catch(err => console.error("Помилка завантаження goods.json:", err));
}

// ===== Основна функція рендеру =====
function renderFilteredAndSortedGoods() {
  const filtered = goodsData.filter(item =>
    item.name.toLowerCase().includes(searchQuery) ||
    item.content.toLowerCase().includes(searchQuery)
  );

  const sorted = getSortedGoods(filtered, currentSort);
  renderGoods(sorted);
}

// ===== Функція відображення товарів =====
function renderGoods(data) {
  if (!container) return;
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = `<p class="no-results">Нічого не знайдено...</p>`;
    return;
  }

  data.forEach(item => {
    const card = document.createElement("div");
    card.className = "goods-card";
    card.innerHTML = `
      <img src="${item.images}" alt="${item.name}">
      <h3>${item.name}</h3>
      <p class="goods_content">${item.content}</p>
      <div class="good_price" data-id="${item.goods_id}">
        <p class="price">${item.price} грн</p>
        <button class="btn-buy" 
                data-id="${item.goods_id}" 
                data-name="${escapeQuotes(item.name)}" 
                data-price="${item.price}">
        </button>
      </div>
    `;

    // 📦 відкриття модалки при кліку на картку
    card.addEventListener("click", () => openProductModal(item.goods_id));

    // 🛒 кнопка “купити” (зупиняє відкриття модалки)
    const buyBtn = card.querySelector(".btn-buy");
    buyBtn.addEventListener("click", e => {
      e.stopPropagation();
      addToCart(item.goods_id, item.name, item.price);
    });

    container.appendChild(card);
  });
}

// ===== Функція сортування =====
function getSortedGoods(data, criteria) {
  const sorted = [...data];
  switch (criteria) {
    case "new":
      sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case "priceAsc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "priceDesc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name, "uk"));
      break;
    default:
      break;
  }
  return sorted;
}

// ===== Параметри пагінації =====
let currentPage = 1;
const itemsPerPage = 8; // кількість товарів на сторінці
const paginationContainer = document.createElement("div");
paginationContainer.className = "pagination";
container?.after(paginationContainer); // вставляємо під сітку товарів

// ===== Основна функція рендеру (оновлена) =====
function renderFilteredAndSortedGoods() {
  const filtered = goodsData.filter(item =>
    item.name.toLowerCase().includes(searchQuery) ||
    item.content.toLowerCase().includes(searchQuery)
  );

  const sorted = getSortedGoods(filtered, currentSort);

  // 🔹 Розрахунок кількості сторінок
  const totalPages = Math.ceil(sorted.length / itemsPerPage);

  // 🔹 Коригуємо сторінку (щоб не виходила за межі)
  if (currentPage > totalPages) currentPage = totalPages || 1;

  // 🔹 Вибираємо елементи для поточної сторінки
  const start = (currentPage - 1) * itemsPerPage;
  const paginated = sorted.slice(start, start + itemsPerPage);

  renderGoods(paginated);
  renderPagination(totalPages);
}

// ===== Функція рендеру пагінації =====
function renderPagination(totalPages) {
  paginationContainer.innerHTML = "";

  if (totalPages <= 1) return; // якщо тільки одна сторінка — не показуємо

  // Кнопка "Назад"
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "⟨";
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderFilteredAndSortedGoods();
      scrollToTop();
    }
  });
  paginationContainer.appendChild(prevBtn);

  // Номери сторінок
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === currentPage ? "active" : "";
    btn.addEventListener("click", () => {
      currentPage = i;
      renderFilteredAndSortedGoods();
      scrollToTop();
    });
    paginationContainer.appendChild(btn);
  }

  // Кнопка "Вперед"
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "⟩";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderFilteredAndSortedGoods();
      scrollToTop();
    }
  });
  paginationContainer.appendChild(nextBtn);
}

// ===== Прокрутка догори після перемикання =====
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}


// ===== Подія зміни сортування =====
if (sortSelect) {
  sortSelect.value = currentSort;
  sortSelect.addEventListener("change", () => {
    currentSort = sortSelect.value;
    localStorage.setItem("sortOption", currentSort);
    renderFilteredAndSortedGoods();
  });
}

// ===== Пошук у режимі реального часу =====
if (searchInput) {
  searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value.trim().toLowerCase();
    renderFilteredAndSortedGoods();
  });
}

// ===== Реактивність при зміні глобальних даних =====
Object.defineProperty(window, "goodsData", {
  get() {
    return goodsData;
  },
  set(newValue) {
    goodsData = Array.isArray(newValue) ? newValue : [];
    renderFilteredAndSortedGoods();
  }
});