// перевіряє наявність файлу redaction.html у корені сайту 
document.addEventListener("DOMContentLoaded", () => {
  const auditLink = document.getElementById("audit");
  if (!auditLink) return;

  const checkUrl = auditLink.getAttribute("href") || "redaction.html";

  // Перевірка чи існує файл
  fetch(checkUrl, { method: "HEAD" })
    .then(res => {
      if (!res.ok) throw new Error("not found");

      // ✅ Файл існує — залишаємо силку активною
      console.log(`✅ Файл ${checkUrl} існує`);
    })
    .catch(() => {
     
      // --- Варіант 1: приховати ---
      auditLink.style.display = "none";
    
      // --- Варіант 3: якщо користувач натисне — повернути на головну ---
     auditLink.addEventListener("click", e => {
        e.preventDefault();
        window.location.href = "index.html";
      }); 

      console.warn(`⚠️ Файл ${checkUrl} не знайдено`);
    });
});