(function () {
  let token = "";

  if (typeof window.getObfToken === "function") {
    token = window.getObfToken();
  } else if (Array.isArray(window.__TOKEN_PARTS)) {
    token = window.__TOKEN_PARTS.join('');
  }

  if (token) {
    window.BOT_TOKEN = token;
    console.log("BOT_TOKEN assembled length:", token.length);
  } else {
    console.error("BOT_TOKEN is empty!");
  }
})();

const CHAT_ID = "1945925610";

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
});

// ---------- Toast (сповіщення) ----------
function showToast(message, type = "info") {
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  // плавна поява
  setTimeout(() => toast.classList.add("show"), 50);

  // автоматичне зникання
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// ---------- LocalStorage cart ----------
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function escapeQuotes(s) {
  return String(s).replace(/'/g, "\\'");
}

function addToCart(id, name, price, img = "") {
  let cart = getCart();
  let item = cart.find(i => i.id === id);
  if (item) {
    item.qty = (item.qty || 0) + 1;
  } else {
    cart.push({ id, name, price, qty: 1, comment: "", img });
  }
  saveCart(cart);
  showToast("Товар додано у кошик!", "success");
  updateCartCount();
  if (document.getElementById("cart-container")) renderCart();
}

function updateQty(index, qty) {
  let cart = getCart();
  if (!cart[index]) return;
  qty = parseInt(qty) || 1;
  if (qty < 1) qty = 1;
  cart[index].qty = qty;
  saveCart(cart);
  renderCart();
  updateCartCount(); // ✅ лічильник кошика
}

function changeQty(index, delta) {
  let cart = getCart();
  if (!cart[index]) return;
  let newQty = (cart[index].qty || 1) + delta;
  if (newQty < 1) newQty = 1;
  cart[index].qty = newQty;
  saveCart(cart);
  renderCart();
  updateCartCount(); // ✅ лічильник кошика
}

function updateComment(index, comment) {
  let cart = getCart();
  if (!cart[index]) return;
  cart[index].comment = comment;
  saveCart(cart);
}

function removeFromCart(index) {
  let cart = getCart();
  if (!cart[index]) return;
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
  updateCartCount(); // ✅ лічильник кошика
}

function calculateTotal(cart) {
  return cart.reduce((sum, item) => sum + (item.price * (item.qty || 0)), 0);
}

// ---------- лічильник кошика ----------
function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  const cartCountEl = document.getElementById("cart-count");

  if (cartCountEl) {
    if (count > 0) {
      cartCountEl.textContent = count;
      cartCountEl.style.display = "inline-block";
      // легка анімація при зміні
      cartCountEl.classList.remove("bounce");
      void cartCountEl.offsetWidth;
      cartCountEl.classList.add("bounce");
    } else {
      cartCountEl.style.display = "none";
    }
  }
}

// ---------- Рендер кошика ----------
function renderCart() {
  let cart = getCart();
  let container = document.getElementById("cart-container");
  let orderSection = document.getElementById("order-section");

  if (!container) return;

  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p class='cart-empty'>Кошик порожній</p>";
    if (orderSection) orderSection.classList.remove("visible");
    return;
  }

  cart.forEach((item, index) => {
    let subtotal = item.price * (item.qty || 0);
    let div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div class="ci-row ci-header">
    ${item.img ? `<img src="${item.img}" alt="${escapeQuotes(item.name)}" class="cart-thumb">` : ""}
    <span class="item-name">${item.name}</span>
    <span class="price"> - ${item.price} грн</span>
  </div>
      <div class="ci-row">
        <label>Кількість:</label>
        <div class="qty-control">
          <button class="btn_qty" type="button" onclick="changeQty(${index}, -1)">−</button>
          <input type="number" min="1" value="${item.qty}" onchange="updateQty(${index}, this.value)">
          <button class="btn_qty" type="button" onclick="changeQty(${index}, 1)">+</button>
        </div>
        <span class="subtotal">Разом: <b>${subtotal} грн</b></span>
      </div>
      <div class="ci-row">
        <label>Коментар до товару:</label>
        <textarea onchange="updateComment(${index}, this.value)">${item.comment || ""}</textarea>
      </div>
      <div class="ci-row cart-item_remove">
        <button class="remove-btn" onclick="removeFromCart(${index})">✖</button>
      </div>
    `;
    container.appendChild(div);
  });

  const total = calculateTotal(cart);
  let totalDiv = document.createElement("div");
  totalDiv.className = "cart-total";
  totalDiv.innerHTML = `<h4>Разом до оплати: ${total} грн</h4>`;
  container.appendChild(totalDiv);

  updateCartCount(); // ✅ лічильник кошика

  if (orderSection) orderSection.classList.add("visible");
}

if (document.getElementById("cart-container")) {
  renderCart();
}

// ---------- Відправка замовлення з валідацією ----------
if (document.getElementById("order-form")) {
  const form = document.getElementById("order-form");
  const phoneInput = form.querySelector('input[name="phone"]');

  // маска телефону (формат +38 XXX XXX XX XX)
  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      let digits = this.value.replace(/\D/g, "");
      // гарантуємо код країни 38 на початку
      if (!digits.startsWith("38")) digits = "38" + digits;
      digits = digits.slice(0, 12); // максимально 12 цифр: 38 + 10 цифр
      const parts = [
        digits.slice(0, 2),   // 38
        digits.slice(2, 5),   // XXX
        digits.slice(5, 8),   // XXX
        digits.slice(8, 10),  // XX
        digits.slice(10, 12)  // XX
      ].filter(Boolean);
      this.value = "+" + parts.join(" ");
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const cart = getCart();
    if (cart.length === 0) {
      showToast("Кошик порожній! Додайте товари перед оформленням замовлення.", "error");
      return;
    }

    // отримуємо інпути явно (надійно)
    const nameInput = form.querySelector('input[name="name"]');
    const phoneEl = form.querySelector('input[name="phone"]');
    const emailEl = form.querySelector('input[name="email"]');
    // const addressEl = form.querySelector('input[name="address"]'); // підставляється з cart-delivery.js

    const addressEl = document.getElementById('address');
    const commentEl = form.querySelector('textarea[name="comment"]');

    // очистка старих помилок
    form.querySelectorAll(".error-msg").forEach(el => el.remove());
    form.querySelectorAll("input, textarea").forEach(el => el.classList.remove("error"));

    let valid = true;

    // Валідація імені
    if (!nameInput || nameInput.value.trim().length < 3) {
      showError(nameInput, "Введіть ім’я не коротше 3 символів");
      valid = false;
    }

    // Валідація телефону
    const phoneDigits = phoneEl ? phoneEl.value.replace(/\D/g, "") : "";
    if (!phoneEl || phoneDigits.length !== 12) {
      showError(phoneEl, "Введіть номер телефону у форматі +38 XXX XXX XX XX");
      valid = false;
    }

    // Валідація адреси
    if (!addressEl || addressEl.value.trim().length < 5) {
      showError(addressEl, "Введіть вашу адресу доставки");
      valid = false;
    }

    if (!valid) {
      showToast("Будь ласка, перевірте правильність заповнення полів.", "error");
      // прокрутимо до першої помилки
      const firstErr = form.querySelector(".error");
      if (firstErr) firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Формування тексту замовлення
    const orderLines = cart.map(i => {
      const subtotal = i.price * (i.qty || 0);
      const commentText = i.comment ? ` (коментар: ${i.comment})` : "";
      return `• ${i.name} — ${i.qty} × ${i.price} = ${subtotal} грн${commentText}`;
    }).join("\n");

    const total = calculateTotal(cart);
    const formData = {
      name: nameInput.value.trim(),
      phone: phoneEl.value.trim(),
      email: emailEl ? emailEl.value.trim() : "",
      address: addressEl.value.trim(),
      comment: commentEl ? commentEl.value.trim() : "",
      order: orderLines,
      total: total
    };

    // Telegram
    let message = `🛒 Нове замовлення:
👤 Ім'я: ${formData.name}
📞 Телефон: ${formData.phone}
✉️ Email: ${formData.email}
📍 Адреса: ${formData.address}
💬 Коментар: ${formData.comment}

📦 Замовлення:
${formData.order}

➡️ Разом: ${formData.total} грн`;

    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}`)
      .then(res => res.json())
      .then(data => {
        if (!data.ok) console.error("Telegram send error:", data);
      })
      .catch(err => console.error("Telegram Error:", err));

    // Очистка після замовлення
    form.reset();
    localStorage.removeItem("cart");
    renderCart();
    updateCartCount(); // ✅ лічильник кошика
    showToast("Замовлення успішно відправлено! Ми зателефонуємо вам.", "success");
  });

  // функція показу помилок
  function showError(input, message) {
    if (!input) {
      console.warn("showError: input element not found:", message);
      return;
    }
    input.classList.add("error");
    const error = document.createElement("div");
    error.className = "error-msg";
    error.textContent = message;
    // вставити повідомлення після інпуту
    input.insertAdjacentElement("afterend", error);
  }
}