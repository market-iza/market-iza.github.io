document.addEventListener("DOMContentLoaded", () => {
  const npRadio = document.getElementById("deliveryNewPost");
  const anotherRadio = document.getElementById("anotherPost");
  const novaPostSection = document.getElementById("nova-post-section");
  const hiddenAddress = document.getElementById("address"); 
  const addressLabel = document.getElementById("address-label");

  const searchInput = document.getElementById("search");
  const resultsList = document.getElementById("search-results");
  const descriptionSelect = document.getElementById("Description");

  let npData = [];
  let selectedCity = "";

  // Завантаження бази Нової пошти
  fetch("data_np.json")
    .then(res => res.json())
    .then(data => npData = data || [])
    .catch(err => console.error("Помилка завантаження data_np.json:", err));

  // Функція: показати/сховати блок Нової пошти
  function showNovaPost(show) {
    novaPostSection.classList.toggle("hidden", !show);

    if (show) {
      addressLabel.textContent = "Адреса (заповниться автоматично):";
      hiddenAddress.value = "";
      hiddenAddress.readOnly = true;
      hiddenAddress.placeholder = "Буде підставлено після вибору відділення";
    } else {
      addressLabel.textContent = "Вкажіть адресу вручну:";
      hiddenAddress.readOnly = false;
      hiddenAddress.placeholder = "Введіть адресу вручну";
      hiddenAddress.value = "";
    }
  }

  // Перемикання радіо
  npRadio.addEventListener("change", () => showNovaPost(true));
  anotherRadio.addEventListener("change", () => showNovaPost(false));

  // Пошук населеного пункту
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    resultsList.innerHTML = "";

    if (query.length < 2) return;

    const results = [...new Set(
      npData
        .filter(item => item.CityDescription && item.CityDescription.toLowerCase().includes(query))
        .map(item => item.CityDescription)
    )].slice(0, 20);

    results.forEach(city => {
      const li = document.createElement("li");
      li.textContent = city;
      li.addEventListener("click", () => {
        searchInput.value = city;
        selectedCity = city;
        resultsList.innerHTML = "";
        updateDepartments(city);
      });
      resultsList.appendChild(li);
    });
  });

  // Заповнює список відділень
  function updateDepartments(city) {
    descriptionSelect.innerHTML = `<option value="">Виберіть відділення</option>`;
    const deps = npData.filter(item => item.CityDescription === city);
    deps.forEach(dep => {
      const opt = document.createElement("option");
      opt.value = dep.Description;
      opt.textContent = dep.Description;
      descriptionSelect.appendChild(opt);
    });
  }

  // При виборі відділення — оновлюємо адресу
  descriptionSelect.addEventListener("change", () => {
    const selectedDep = descriptionSelect.value;
    if (selectedDep && selectedCity) {
      hiddenAddress.value = `${selectedCity}, ${selectedDep}`;
    } else {
      hiddenAddress.value = "";
    }
  });

  // Закриває підказки при кліку поза пошуком
  document.addEventListener("click", (e) => {
    if (!resultsList.contains(e.target) && e.target !== searchInput) {
      resultsList.innerHTML = "";
    }
  });

  // Ініціалізація
  if (npRadio.checked) showNovaPost(true);
  else showNovaPost(false);
});