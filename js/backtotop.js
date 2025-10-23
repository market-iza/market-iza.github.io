// backtotop.js — автономний, створює кнопку якщо її немає і робить її робочою
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    try {
      const ID = "back-to-top";
      let btn = document.getElementById(ID);

      // Якщо кнопки немає — створюємо її автоматично
      if (!btn) {
        btn = document.createElement("button");
        btn.id = ID;
        btn.className = "back-to-top";
        btn.setAttribute("aria-label", "Повернутися вгору");
        btn.title = "Повернутися вгору";

        // Додаємо простий SVG як вміст
        btn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M12 4l-8 8h5v8h6v-8h5z"></path>
          </svg>
        `;
        document.body.appendChild(btn);
      }

      // --- гарантований мінімальний fallback-стиль (щоб кнопка була видима навіть якщо CSS не підключено) ---
      // (якщо у вас є styles.css з правилами .back-to-top — цей блок не завадить)
      const computed = window.getComputedStyle(btn);
      if (computed.display === "inline" || computed.display === "none") {
        // додаємо тільки якщо немає явної видимості (не перезаписуємо, якщо вже налаштовано)
        btn.style.position = btn.style.position || "fixed";
        btn.style.right = btn.style.right || "20px";
        btn.style.bottom = btn.style.bottom || "28px";
        btn.style.width = btn.style.width || "48px";
        btn.style.height = btn.style.height || "48px";
        btn.style.borderRadius = btn.style.borderRadius || "50%";
        btn.style.display = btn.style.display || "inline-grid";
        btn.style.placeItems = btn.style.placeItems || "center";
        btn.style.background = btn.style.background || "linear-gradient(135deg,#333,#111)";
        btn.style.color = btn.style.color || "#fff";
        btn.style.border = btn.style.border || "none";
        btn.style.boxShadow = btn.style.boxShadow || "0 6px 18px rgba(0,0,0,0.35)";
        btn.style.cursor = btn.style.cursor || "pointer";
        btn.style.opacity = "0";
        btn.style.transform = "translateY(10px) scale(0.95)";
        btn.style.transition = "opacity 260ms ease, transform 260ms cubic-bezier(.2,.9,.3,1)";
        btn.style.zIndex = "1200";
      }

      // Показ/прихов кнопки — add/remove класу .show
      const SHOW_AFTER = 250; // px
      let ticking = false;

      function onScroll() {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const sc = window.scrollY || window.pageYOffset;
            if (sc > SHOW_AFTER) {
              btn.classList.add("show");
              // якщо є інлайн fallback, вручну керуємо стилями теж
              btn.style.opacity = "1";
              btn.style.transform = "translateY(0) scale(1)";
            } else {
              btn.classList.remove("show");
              btn.style.opacity = "0";
              btn.style.transform = "translateY(10px) scale(0.95)";
            }
            ticking = false;
          });
          ticking = true;
        }
      }

      // Плавний скрол — враховує prefers-reduced-motion
      function scrollToTop() {
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!prefersReduced && "scrollBehavior" in document.documentElement.style) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          // простий fallback
          let c = document.documentElement.scrollTop || document.body.scrollTop;
          if (c > 0) {
            window.requestAnimationFrame(scrollToTop);
            window.scrollTo(0, c - c / 8);
          }
        }
      }

      // Клік і клавіші
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        scrollToTop();
        btn.blur();
      });

      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          scrollToTop();
        }
      });

      // Підключаємо скрол подію пасивно
      window.addEventListener("scroll", onScroll, { passive: true });

      // Ініціалізуємо видимість (на випадок, якщо сторінка відразу прокручена)
      onScroll();

      // --- додаткове: якщо хочеш ховати кнопку при моб. меню / попапах — експортуємо об'єкт ---
      window._backToTop = {
        show: () => { btn.classList.add("show"); btn.style.opacity = "1"; btn.style.transform = "translateY(0) scale(1)"; },
        hide: () => { btn.classList.remove("show"); btn.style.opacity = "0"; btn.style.transform = "translateY(10px) scale(0.95)"; },
        element: btn
      };

    } catch (err) {
      console.error("backtotop.js error:", err);
    }
  });
})();