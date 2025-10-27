document.addEventListener("DOMContentLoaded", () => {
  const burger = document.getElementById("burger"),
        menu = document.getElementById("menu"),
        body = document.body,
        overlay = document.getElementById("overlay");

  const closeMenu = () => {
    burger.classList.remove("activ-menu");
    menu.classList.remove("show");
    body.classList.remove("lock");
    overlay.classList.remove("active");
  };

  const toggleMenu = () => {
    burger.classList.toggle("activ-menu");
    menu.classList.toggle("show");
    body.classList.toggle("lock");
    overlay.classList.toggle("active");
  };

  burger.addEventListener("click", e => {
    e.stopPropagation();
    toggleMenu();
  });

  menu.addEventListener("click", e => e.stopPropagation());
  overlay.addEventListener("click", closeMenu);

  document.addEventListener("click", e => {
    if (!menu.contains(e.target) && !burger.contains(e.target)) closeMenu();
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeMenu();
  });
});