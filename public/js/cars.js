document.addEventListener("DOMContentLoaded", async () => {
  const carsContainer = document.getElementById("carsContainer");
  const filterForm = document.getElementById("filterForm");
  const brandFilter = document.getElementById("brandFilter");
  const priceRange = document.getElementById("priceRange");
  const minPriceLabel = document.getElementById("minPrice");
  const maxPriceLabel = document.getElementById("maxPrice");

  const loadFilters = async () => {
    try {
      const response = await fetch("/api/cars/filters");
      const { brands, minPrice, maxPrice } = await response.json();

      // Заполняем выпадающий список марок
      brands.forEach((brand) => {
        const option = document.createElement("option");
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
      });

      // Инициализация noUiSlider
      noUiSlider.create(priceRange, {
        start: [minPrice, maxPrice], // Начальные значения
        connect: true,
        range: {
          min: minPrice,
          max: maxPrice,
        },
        step: 100,
        format: {
          to: (value) => Math.round(value),
          from: (value) => Math.round(value),
        },
      });

      // Обновление значений меток при изменении ползунка
      priceRange.noUiSlider.on("update", (values) => {
        minPriceLabel.textContent = values[0];
        maxPriceLabel.textContent = values[1];
      });
    } catch (error) {
      console.error("Ошибка загрузки фильтров:", error);
    }
  };

  const loadCars = async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/cars?${queryParams}`);
      const cars = await response.json();

      carsContainer.innerHTML = "";

      if (cars.length === 0) {
        carsContainer.innerHTML = `<p class="text-center text-muted">Нет доступных автомобилей по указанным параметрам.</p>`;
        return;
      }

      cars.forEach((car) => {
        const carCard = document.createElement("div");
        carCard.className = "col-md-4 mb-4";
        carCard.innerHTML = `
          <div class="card h-100 shadow-sm">
          <img src="${car.img || '/images/default-car.jpg'}" class="card-img-top" alt="${car.model}">
          <div class="card-body text-center">
            <h5 class="card-title">${car.brand} ${car.model}</h5>
            <p>Год: ${car.year}</p>
            <p>Двигатель: ${car.engine}</p>
            <p>Коробка передач: ${car.transmission}</p>
            <p>Привод: ${car.drive}</p>
            <p>Цена за сутки: <strong>${car.pricePerDay}₸</strong></p>
            <button class="btn btn-primary" onclick="redirectToBooking('${car._id}')">
              Арендовать
            </button>
          </div>
        </div>
        `;
        carsContainer.appendChild(carCard);
      });
    } catch (error) {
      console.error("Ошибка загрузки автомобилей:", error);
      carsContainer.innerHTML = `<p class="text-center text-danger">Произошла ошибка при загрузке автомобилей.</p>`;
    }
  };

  // Инициализация
  await loadFilters();
  await loadCars();

  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const filters = {
      brand: brandFilter.value || "",
      minPrice: priceRange.noUiSlider.get()[0],
      maxPrice: priceRange.noUiSlider.get()[1],
    };

    loadCars(filters);
  });
});

function redirectToBooking(carId) {
  const token = localStorage.getItem("token");

  if (!token) {
    localStorage.setItem("toastMessage", JSON.stringify({ message: "Пожалуйста, войдите в систему, чтобы арендовать машину.", type: "danger" }));
    window.location.href = "/login"; // Перенаправляем на страницу входа
    return;
  }

  // Если пользователь авторизован, перенаправляем на страницу бронирования
  window.location.href = `/bookings?carId=${carId}`;
}
