let fullyBookedDays = [];

// Загрузка информации о машине
async function loadCarInfo(carId) {
  try {
    console.log("Загрузка информации о машине с ID:", carId);

    const response = await fetch(`/api/cars/${carId}`);
    if (!response.ok) {
      throw new Error("Ошибка при загрузке информации о машине.");
    }

    const car = await response.json();

    // Отображаем информацию о машине
    const carModel = document.getElementById("carModel");
    const carDetails = document.getElementById("carDetails");
    carModel.textContent = `${car.brand} ${car.model}`;
    carDetails.textContent = `Цена за день: ${car.pricePerDay}₸`;
  } catch (error) {
    console.error("Ошибка загрузки информации о машине:", error);
  }
}

// Загрузка недоступных дней
async function loadUnavailableDays(carId) {
  try {
    console.log("Загрузка недоступных дней для машины с ID:", carId);

    const response = await fetch(`/api/bookings/${carId}/unavailable-days`);
    if (!response.ok) {
      throw new Error(`Ошибка API: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Полученные данные о недоступных днях (от API):", data);

    // Преобразуем строки дат в объекты Date
    fullyBookedDays = Array.isArray(data.fullyBookedDays)
      ? data.fullyBookedDays.map((dateString) => {
          const parsedDate = new Date(dateString);
          if (isNaN(parsedDate.getTime())) {
            console.warn("Найдена невалидная дата в API ответе:", dateString);
            return null;
          }
          return parsedDate;
        }).filter((date) => date !== null) // Удаляем null-значения
      : [];

    console.log("Недоступные дни после преобразования в объекты Date:", fullyBookedDays);
  } catch (error) {
    console.error("Ошибка загрузки недоступных дней:", error);
    fullyBookedDays = [];
  }
}

// Инициализация Flatpickr
function initializeCalendar() {
  console.log("Инициализация Flatpickr...");
  console.log("Недоступные дни для календаря (до преобразования):", fullyBookedDays);

  // Проверяем, что каждый элемент — объект Date
  const validDates = fullyBookedDays.filter((date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.warn("Найден невалидный элемент в fullyBookedDays:", date);
      return false;
    }
    return true;
  });

  console.log("Недоступные дни для календаря (после проверки):", validDates);

  try {
    flatpickr("#datePicker", {
      mode: "range",
      dateFormat: "Y-m-d",
      minDate: "today",
      disable: validDates,
    });
  } catch (error) {
    console.error("Ошибка инициализации Flatpickr:", error);
  }
}

// Подтверждение бронирования
document.getElementById("confirmBookingButton")?.addEventListener("click", async () => {
  const dateRange = document.getElementById("datePicker").value;
  const carId = new URLSearchParams(window.location.search).get("carId");

  if (!dateRange) {
    showToast("Пожалуйста, выберите диапазон дат.", "danger");
    return;
  }

  try {
    const [startDate, endDate] = dateRange.split(" to ");
    console.log("Подтверждение бронирования с данными:", { carId, startDate, endDate });

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ carId, startDate, endDate }),
    });

    const data = await response.json();

    if (response.ok) {
      showToast("Бронирование успешно создано!", "success", true);
      localStorage.setItem("toastMessage", JSON.stringify({ message: "Бронирование успешно создано!", type: "success" }));
      window.location.href = "/history";
    } else {
      showToast(data.message || "Ошибка при создании бронирования.", "danger");
    }
  } catch (error) {
    console.error("Ошибка подтверждения бронирования:", error);
    showToast("Произошла ошибка при создании бронирования.", "danger");
  }
});

// Инициализация страницы
document.addEventListener("DOMContentLoaded", async () => {
  const carId = new URLSearchParams(window.location.search).get("carId");
  console.log("Полученный ID машины из URL:", carId);

  if (!carId) {
    showToast("Автомобиль не выбран!", "danger");
    window.location.href = "/cars";
    return;
  }

  try {
    await loadCarInfo(carId); // Загрузка информации о машине
    await loadUnavailableDays(carId); // Загрузка недоступных дней
    initializeCalendar(); // Инициализация календаря
  } catch (error) {
    console.error("Ошибка инициализации страницы:", error);
  }
});
