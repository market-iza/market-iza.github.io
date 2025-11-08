// modalContent.js
// ---------- Функція відкриття картки товару ----------

function openProductModal(id) {
  const item = window.goodsData?.find(i => i.goods_id === id);
  if (!item) return;

  const modal = document.getElementById("product-modal");
  const modalContent = modal.querySelector(".modal-content");

  // Генеруємо розмітку модалки
  modalContent.innerHTML = `
    <button class="modal-close" title="Закрити">×</button>
    <div class="modal-body">
      <div class="modal-body_header">
        <img src="${item.images}" alt="${item.name}">
        <div class="modal-body_title">
          <h2>${item.name}</h2>
          <p class="modal-short">${item.content}</p>
          <div class="modal-footer">
            <span class="price">${item.price} грн</span>
            <button class="btn-buy"
              data-id="${item.goods_id}"
              data-name="${escapeQuotes(item.name)}" 
              data-price="${item.price}">
            </button>
          </div>
        </div>
      </div>
      <div class="modal-info">
        <p class="modal-desc">${item.description}</p>
      </div>
    </div>
  `;

  // 🔒 Блокуємо прокрутку сторінки
  document.body.style.overflow = "hidden";
  modal.classList.add("show");

  // ======= Додавання слухачів подій =======

  // Закрити по кнопці "×"
  const closeBtn = modal.querySelector(".modal-close");
  closeBtn?.addEventListener("click", closeModal);

  // Закрити при кліку поза контентом
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Обробка кліку на кнопку "додати в кошик"
  const buyButton = modal.querySelector(".btn-buy");
  if (buyButton) {
    buyButton.addEventListener("click", (e) => {
      e.stopPropagation(); // щоб не закрилась модалка
      const id = parseInt(buyButton.dataset.id);
      const name = buyButton.dataset.name;
      const price = parseFloat(buyButton.dataset.price);
      addToCart(id, name, price, item.images);
    });
  }

  // ======= Внутрішня функція закриття =======
  function closeModal() {
    modal.classList.remove("show");
    document.body.style.overflow = ""; // 🔓 Відновлюємо прокрутку
  }
}