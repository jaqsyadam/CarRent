document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    localStorage.setItem("toastMessage", JSON.stringify({ message: "Пожалуйста, войдите в систему.", type: "danger" }));
    window.location.href = "/login";
    return;
  }

  try {
    // Получаем историю бронирований
    const response = await fetch("/api/bookings", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const bookings = await response.json();

    if (response.ok) {
      const bookingsContainer = document.getElementById("bookingsContainer");
      bookingsContainer.innerHTML = "";

      if (bookings.length === 0) {
        bookingsContainer.innerHTML = `<p class="text-center text-muted">У вас пока нет бронирований.</p>`;
        return;
      }

      bookings.forEach((booking) => {
        const isInactive = booking.status === "completed" || booking.status === "cancelled";

        const bookingCard = document.createElement("div");
        bookingCard.className = `col-md-6 mb-4`;
        bookingCard.id = `booking-${booking._id}`;

        bookingCard.innerHTML = `
          <div class="card h-100 bg-light ${isInactive ? "inactive-card" : ""}">
            <div class="card-body position-relative">
              ${
                isInactive
                  ? `<button class="btn-close position-absolute top-0 end-0 m-2" aria-label="Удалить" onclick="deleteBooking('${booking._id}')"></button>`
                  : ""
              }
              <h5 class="card-title text-primary">${booking.car?.brand || "Неизвестно"} ${booking.car?.model || ""}</h5>
              <p class="card-text">
                <strong>Год:</strong> ${booking.car?.year || "Неизвестно"}<br>
                <strong>Время начала:</strong> ${new Date(booking.startTime).toLocaleDateString()}<br>
                <strong>Время окончания:</strong> ${new Date(booking.endTime).toLocaleDateString()}<br>
                <strong>Статус:</strong> ${
                  booking.status === "active"
                    ? '<span class="text-success">Оплачено</span>'
                    : booking.status === "cancelled"
                    ? '<span class="text-danger">Отменено</span>'
                    : booking.status === "completed"
                    ? '<span class="text-secondary">Завершено</span>'
                    : '<span class="text-warning">В ожидании</span>'
                }<br>
                <strong>Общая стоимость:</strong> ${booking.totalPrice ? `<span class="text-primary">${booking.totalPrice.toFixed(2)}₸</span>` : "Не указана"}
                <div class="d-flex gap-2">
                  <button class="btn btn-success btn-sm" onclick="redirectToPayment('${booking._id}')" ${booking.status !== "pending" ? "disabled" : ""}>Оплатить</button>
                  <button class="btn btn-danger btn-sm" onclick="cancelBooking('${booking._id}')" ${booking.status !== "pending" ? "disabled" : ""}>Отменить</button>
                </div>
              </p>
            </div>
          </div>
        `;
        bookingsContainer.appendChild(bookingCard);
      });
    } else {
      showToast(bookings.message || "Ошибка при загрузке бронирований.", "danger");
    }
  } catch (error) {
    console.error("Ошибка загрузки истории бронирований:", error);
    showToast("Произошла ошибка при загрузке истории бронирований.", "danger");
  }
});

// Функция для удаления бронирования
async function deleteBooking(bookingId) {
  const token = localStorage.getItem("token");

  if (!token) {
    showToast("Пожалуйста, войдите в систему.", "danger", true);
    window.location.href = "/login";
    return;
  }

  try {
    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      document.getElementById(`booking-${bookingId}`)?.remove();
      showToast("Бронирование успешно удалено.", "success");
    } else {
      showToast(data.message || "Ошибка при удалении бронирования.", "danger");
    }
  } catch (error) {
    console.error("Ошибка при удалении бронирования:", error);
    showToast("Произошла ошибка при удалении бронирования.", "danger");
  }
}

// Открытие модального окна для изменения даты
let currentBookingId = null;

function openUpdateModal(bookingId) {
  currentBookingId = bookingId;
  loadUnavailableDays(bookingId);
  const modal = new bootstrap.Modal(document.getElementById("updateModal"));
  modal.show();
}

// Загрузка недоступных и редактируемых дней
async function loadUnavailableDays(bookingId) {
  try {
    const response = await fetch(`/api/bookings/${bookingId}/editable-days`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      const { fullyBookedDays, userDays } = data;
      initializeFlatpickr([...new Set([...fullyBookedDays, ...userDays])], userDays);
    } else {
      showToast(data.message || "Ошибка при загрузке данных календаря.", "danger");
    }
  } catch (error) {
    console.error("Ошибка загрузки недоступных дней:", error);
    showToast("Произошла ошибка при загрузке календаря.", "danger");
  }
}

// Инициализация Flatpickr
function initializeFlatpickr(disabledDates, userDays) {
  flatpickr("#datePicker", {
    mode: "range",
    dateFormat: "Y-m-d",
    disable: disabledDates,
    defaultDate: userDays,
    onChange: (selectedDates) => {
      console.log("Выбранные даты:", selectedDates);
    },
  });
}

// Изменение дат бронирования
document.getElementById("updateForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const [newStartTime, newEndTime] = document.getElementById("datePicker").value.split(" to ");

  if (!newStartTime || !newEndTime) {
    showToast("Пожалуйста, выберите диапазон дат.", "danger");
    return;
  }

  try {
    const response = await fetch(`/api/bookings/${currentBookingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ startTime: newStartTime, endTime: newEndTime }),
    });

    const data = await response.json();
    if (response.ok) {
      showToast("Дата бронирования успешно изменена!", "success", true);
      const modal = bootstrap.Modal.getInstance(document.getElementById("updateModal"));
      modal.hide();
      location.reload();
    } else {
      showToast(data.message || "Ошибка при изменении даты.", "danger");
    }
  } catch (error) {
    console.error("Ошибка при изменении даты бронирования:", error);
    showToast("Произошла ошибка при изменении даты бронирования.", "danger");
  }
});

// Перенаправление на страницу оплаты
function redirectToPayment(bookingId) {
  window.location.href = `/payment?bookingId=${bookingId}`;
}

// Отмена бронирования
async function cancelBooking(bookingId) {
  try {
    const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.ok) {
      showToast("Бронирование успешно отменено!", "success", true);
      location.reload();
    } else {
      showToast("Ошибка при отмене бронирования.", "danger");
    }
  } catch (error) {
    console.error("Ошибка отмены бронирования:", error);
    showToast("Произошла ошибка при отмене бронирования.", "danger");
  }
}
