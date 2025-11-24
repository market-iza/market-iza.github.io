// === Глобальні змінні ===
let goodsData = [];
let currentSort = localStorage.getItem("sortOption") || "default";
let searchQuery = "";
let currentPage = 1;       // поточна сторінка
let itemsPerPage = 10;     // кількість товарів на сторінці (буде уточнена динамічно)

const container = document.getElementById("goods-container");
const sortSelect = document.getElementById("sort-select");
const searchInput = document.getElementById("search-input");

// === Контейнер пагінації ===
const paginationContainer = document.createElement("div");
paginationContainer.className = "pagination";
container?.after(paginationContainer); // вставляємо після товарів

// 🔧 Універсальна функція нормалізації тексту
function normalize(s = "") {
  return String(s)
    .replace(/&nbsp;/gi, " ")   // HTML нерозривні пробіли
    .replace(/\u00A0/g, " ")    // реальні нерозривні пробіли
    .replace(/\s+/g, " ")       // кілька пробілів -> один
    .trim()
    .toLowerCase();
}

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
  const q = searchQuery;
  const qNoSpaces = q.replace(/\s+/g, ""); // 🔹 версія без пробілів

  const filtered = goodsData.filter(item => {
    const name = normalize(item.name);
    const content = normalize(item.content);
    const description = normalize(item.description || "");
    const combined = `${name} ${content} ${description}`;

    // 🔸 також створюємо версію без пробілів для порівняння
    const combinedNoSpaces = combined.replace(/\s+/g, "");

    // 🔍 знаходимо або з пробілами, або без
    return (
      !q ||
      combined.includes(q) ||
      combinedNoSpaces.includes(qNoSpaces)
    );
  });
  
  const sorted = getSortedGoods(filtered, currentSort);

  // 🔹 Динамічний перерахунок кількості товарів
  // (залежно від висоти екрана і кількості стовпців)
  if (container.querySelector(".goods-card")) {
    itemsPerPage = calculateItemsPerPage();
  }

  // 🔹 Розрахунок кількості сторінок
  const totalPages = Math.ceil(sorted.length / itemsPerPage);

  // 🔹 Коригуємо поточну сторінку (щоб не виходила за межі)
  if (currentPage > totalPages) currentPage = totalPages || 1;

  // 🔹 Вибір елементів для поточної сторінки
  const start = (currentPage - 1) * itemsPerPage;
  const paginated = sorted.slice(start, start + itemsPerPage);

  renderGoods(paginated);
  renderPagination(totalPages);
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
        <button class="btn-buy" data-id="${item.goods_id}" data-name="${escapeQuotes(item.name)}" data-price="${item.price}"></button>
      </div>
    `;

    // 📦 відкриття модалки при кліку на картку
    card.addEventListener("click", () => openProductModal(item.goods_id));

    // 🛒 кнопка “купити” (зупиняє відкриття модалки)
    const buyBtn = card.querySelector(".btn-buy");
    buyBtn.addEventListener("click", e => {
      e.stopPropagation();
      addToCart(item.goods_id, item.name, item.price, item.images);
    });

    container.appendChild(card);
  });

  // 🔹 Після рендеру уточнюємо кількість карток на сторінці
  updateItemsPerPageAfterRender();
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
    // 🔸 Додаємо сортування за рейтингом як варіант "default"
    case "default":
    default:
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
  }
  return sorted;
}

// ===== Автоматичне визначення кількості товарів на сторінці =====
function calculateItemsPerPage() {
  const grid = document.querySelector(".goods-grid");
  if (!grid) return itemsPerPage;

  const card = grid.querySelector(".goods-card");
  if (!card) return itemsPerPage;

  const style = getComputedStyle(card);
  const cardWidth = card.offsetWidth + parseFloat(style.marginLeft) + parseFloat(style.marginRight);
  const cardHeight = card.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);

  const gridWidth = grid.clientWidth;
  const visibleHeight = window.innerHeight * 0.8; // Висота видимої області (80% екрана)

  // 🔸 Розрахунок скільки карток поміщається в один ряд і по висоті
  const cols = Math.max(1, Math.floor(gridWidth / cardWidth));
  const rows = Math.max(1, Math.floor(visibleHeight / cardHeight))+1;

  const total = Math.max(1, cols * rows);

       return Math.min(10, Math.max(6, total));
 }

// 🔹 Після рендеру — перевірка та оновлення itemsPerPage
function updateItemsPerPageAfterRender() {
  setTimeout(() => {
    const newCount = calculateItemsPerPage();
    if (newCount !== itemsPerPage) {
      itemsPerPage = newCount;
      renderFilteredAndSortedGoods();
    }
  }, 300); // затримка, щоб DOM встиг промалюватись
}

// 🔹 Перерахунок при зміні розміру екрана
window.addEventListener("resize", () => {
  const newCount = calculateItemsPerPage();
  if (newCount !== itemsPerPage) {
    itemsPerPage = newCount;
    renderFilteredAndSortedGoods();
  }
});

// ===== Функція рендеру пагінації =====
function renderPagination(totalPages) {
  paginationContainer.innerHTML = "";

  if (totalPages <= 1) return; // якщо тільки одна сторінка — не показуємо

  // 🔸 Кнопка "Назад"
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

  // 🔸 Номери сторінок
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

  // 🔸 Кнопка "Вперед"
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

// ===== Прокрутка догори =====
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===== Зміна сортування =====
if (sortSelect) {
  sortSelect.value = currentSort;
  sortSelect.addEventListener("change", () => {
    currentSort = sortSelect.value;
    localStorage.setItem("sortOption", currentSort);
    renderFilteredAndSortedGoods();
  });
}

// ===== Пошук у реальному часі =====
if (searchInput) {
  searchInput.addEventListener("input", () => {
    // нормалізуємо введення користувача
    searchQuery = normalize(searchInput.value);
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