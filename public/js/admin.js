document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.setItem("toastMessage", JSON.stringify({ message: "Вы вышли из аккаунта", type: "success" }));
    window.location.href = "/index";
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return (window.location.href = "/404");
  }

  try {
    const response = await fetch("/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Ошибка проверки токена");
    }

    const user = await response.json();

    if (user.role !== "admin") {
      return (window.location.href = "/404");
    }

    // Загрузка контента только для администратора
    loadAdminContent();
  } catch (error) {
    console.error("Ошибка проверки роли:", error);
    window.location.href = "/404";
  }
});

function loadAdminContent() {
  const adminContent = document.getElementById("adminContent");
  adminContent.innerHTML = `
    <h2></h2>
  `;
}


// 🔹 Загрузка пользователей
async function loadUsers() {
  const adminContent = document.getElementById("adminContent");
  adminContent.innerHTML = "<h2>Загрузка пользователей...</h2>";

  try {
    const response = await fetch("/api/admin/users", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const users = await response.json();

    if (!response.ok) throw new Error(users.message || "Ошибка загрузки пользователей");

    adminContent.innerHTML = `
      <h2>Пользователи</h2>
      <ul class="list-group">
        ${users.map(user => `
          <li class="list-group-item">
            <div class="d-flex flex-column gap-2">
              ${createEditableField(user._id, "name", user.name)}
              ${createEditableField(user._id, "email", user.email)}
              ${createEditableField(user._id, "phone", user.phone || "Не указан")}
              ${createEditableField(user._id, "role", user.role)}
              <button class="btn btn-sm btn-danger mt-2" onclick="deleteUser('${user._id}')">Удалить</button>
            </div>
          </li>`).join("")}
      </ul>`;
  } catch (error) {
    showToast(error.message, "danger");
  }
}

// 🔹 Создание поля редактирования атрибута
function createEditableField(userId, field, value) {
  return `
    <div class="d-flex align-items-center">
      <strong class="me-2">${field.charAt(0).toUpperCase() + field.slice(1)}:</strong>
      <input type="text" class="form-control form-control-sm me-2" id="input-${field}-${userId}" value="${value}" disabled>
      <button class="btn btn-sm btn-info" id="edit-${field}-${userId}" onclick="toggleEdit('${userId}', '${field}')">Изменить</button>
      <button class="btn btn-sm btn-success d-none" id="save-${field}-${userId}" onclick="updateUserField('${userId}', '${field}')">Сохранить</button>
    </div>
  `;
}

// 🔹 Включение режима редактирования (скрывает "Изменить", показывает "Сохранить")
function toggleEdit(userId, field) {
  const input = document.getElementById(`input-${field}-${userId}`);
  const editBtn = document.getElementById(`edit-${field}-${userId}`);
  const saveBtn = document.getElementById(`save-${field}-${userId}`);

  input.disabled = false; // Разблокируем поле ввода
  editBtn.classList.add("d-none"); // Скрываем кнопку "Изменить"
  saveBtn.classList.remove("d-none"); // Показываем кнопку "Сохранить"
}

// 🔹 Обновление атрибута пользователя
async function updateUserField(userId, field) {
  const input = document.getElementById(`input-${field}-${userId}`);
  const newValue = input.value.trim();
  const editBtn = document.getElementById(`edit-${field}-${userId}`);
  const saveBtn = document.getElementById(`save-${field}-${userId}`);

  if (!newValue) {
    showToast("Поле не может быть пустым", "danger");
    return;
  }

  try {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ field, value: newValue }),
    });

    const data = await response.json();
    if (response.ok) {
      showToast(`Поле ${field} обновлено`, "success", true);
      input.disabled = true; // Блокируем поле обратно
      saveBtn.classList.add("d-none"); // Скрываем кнопку "Сохранить"
      editBtn.classList.remove("d-none"); // Показываем кнопку "Изменить"
    } else {
      showToast(data.message || "Ошибка при обновлении пользователя", "danger");
    }
  } catch (error) {
    showToast("Ошибка обновления", "danger");
  }
}

// 🔹 Удаление пользователя
async function deleteUser(userId) {

  try {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    const data = await response.json();
    if (response.ok) {
      showToast("Пользователь удален", "success", true);
      loadUsers();
    } else {
      showToast(data.message || "Ошибка удаления пользователя", "danger");
    }
  } catch (error) {
    showToast("Ошибка удаления", "danger");
  }
}



// 🔹 Загрузка бронирований
// 🔹 Загрузка бронирований
async function loadBookings() {
  const adminContent = document.getElementById("adminContent");
  adminContent.innerHTML = "<h2>Загрузка бронирований...</h2>";

  try {
    const response = await fetch("/api/admin/bookings", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    const bookings = await response.json();
    if (!response.ok) throw new Error(bookings.message || "Ошибка загрузки бронирований");

    adminContent.innerHTML = `
      <h2>Бронирования</h2>
      <ul class="list-group">
        ${bookings.map(booking => `
          <li class="list-group-item">
            <div class="d-flex flex-column gap-2">
              ${createEditableField(booking._id, "startTime", new Date(booking.startTime).toLocaleDateString())}
              ${createEditableField(booking._id, "endTime", new Date(booking.endTime).toLocaleDateString())}
              ${createEditableField(booking._id, "status", booking.status)}
              ${createEditableField(booking._id, "totalPrice", booking.totalPrice || "Не указана")}
              <button class="btn btn-sm btn-danger mt-2" onclick="deleteBooking('${booking._id}')">Удалить</button>
            </div>
          </li>`).join("")}
      </ul>`;
  } catch (error) {
    showToast(error.message, "danger");
  }
}

// 🔹 Создание поля редактирования атрибута
function createEditableField(bookingId, field, value) {
  return `
    <div class="d-flex align-items-center">
      <strong class="me-2">${field.charAt(0).toUpperCase() + field.slice(1)}:</strong>
      <input type="text" class="form-control form-control-sm me-2" id="input-${field}-${bookingId}" value="${value}" disabled>
      <button class="btn btn-sm btn-info" id="edit-${field}-${bookingId}" onclick="toggleEdit('${bookingId}', '${field}')">Изменить</button>
      <button class="btn btn-sm btn-success d-none" id="save-${field}-${bookingId}" onclick="updateBookingField('${bookingId}', '${field}')">Сохранить</button>
    </div>
  `;
}

// 🔹 Включение режима редактирования (скрывает "Изменить", показывает "Сохранить")
function toggleEdit(bookingId, field) {
  const input = document.getElementById(`input-${field}-${bookingId}`);
  const editBtn = document.getElementById(`edit-${field}-${bookingId}`);
  const saveBtn = document.getElementById(`save-${field}-${bookingId}`);

  input.disabled = false; // Разблокируем поле ввода
  editBtn.classList.add("d-none"); // Скрываем кнопку "Изменить"
  saveBtn.classList.remove("d-none"); // Показываем кнопку "Сохранить"
}

// 🔹 Обновление атрибута бронирования
async function updateBookingField(bookingId, field) {
  const input = document.getElementById(`input-${field}-${bookingId}`);
  const newValue = input.value.trim();
  const editBtn = document.getElementById(`edit-${field}-${bookingId}`);
  const saveBtn = document.getElementById(`save-${field}-${bookingId}`);

  if (!newValue) {
    showToast("Поле не может быть пустым", "danger");
    return;
  }

  try {
    const response = await fetch(`/api/admin/bookings/${bookingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ field, value: newValue }),
    });

    const data = await response.json();
    if (response.ok) {
      showToast(`Поле ${field} обновлено`, "success", true);
      input.disabled = true; // Блокируем поле обратно
      saveBtn.classList.add("d-none"); // Скрываем кнопку "Сохранить"
      editBtn.classList.remove("d-none"); // Показываем кнопку "Изменить"
    } else {
      showToast(data.message || "Ошибка при обновлении бронирования", "danger");
    }
  } catch (error) {
    showToast("Ошибка обновления", "danger");
  }
}

// 🔹 Удаление бронирования
async function deleteBooking(bookingId) {

  try {
    const response = await fetch(`/api/admin/bookings/${bookingId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    const data = await response.json();
    if (response.ok) {
      showToast("Бронирование удалено", "success", true);
      loadBookings();
    } else {
      showToast(data.message || "Ошибка удаления бронирования", "danger");
    }
  } catch (error) {
    showToast("Ошибка удаления", "danger");
  }
}


// 🔹 Загрузка машин
async function loadCars() {
  const adminContent = document.getElementById("adminContent");
  adminContent.innerHTML = `
    <h2>Список машин</h2>
    <button class="btn btn-primary mb-3" id="addCarBtn">Добавить новую машину</button>
    <div id="addCarFormContainer" class="d-none"></div> <!-- Форма скрыта -->
    <div id="carsContainer"></div>
  `;

  document.getElementById("addCarBtn").addEventListener("click", showAddCarForm);
  fetchCars();
}

// 🔹 Отображение формы добавления машины
function showAddCarForm() {
  const formContainer = document.getElementById("addCarFormContainer");
  formContainer.innerHTML = `
    <div class="card p-3">
      <h3>Добавление машины</h3>
      <form id="addCarForm" enctype="multipart/form-data">
        <input type="text" id="carBrand" class="form-control mb-2" placeholder="Марка" required>
        <input type="text" id="carModel" class="form-control mb-2" placeholder="Модель" required>
        <input type="number" id="carYear" class="form-control mb-2" placeholder="Год" required>
        <input type="number" id="carPrice" class="form-control mb-2" placeholder="Цена за день" required>
        <input type="number" id="carQuantity" class="form-control mb-2" placeholder="Количество" required>
        <input type="file" id="carImage" class="form-control mb-2" accept="image/*" required>
        <button type="submit" class="btn btn-success">Сохранить</button>
        <button type="button" class="btn btn-danger" onclick="hideAddCarForm()">Отмена</button>
      </form>
    </div>
  `;
  formContainer.classList.remove("d-none");

  document.getElementById("addCarForm").addEventListener("submit", addCar);
}

// 🔹 Скрытие формы добавления машины
function hideAddCarForm() {
  document.getElementById("addCarFormContainer").classList.add("d-none");
}

// 🔹 Добавление новой машины
async function addCar(event) {
  event.preventDefault();

  const formData = new FormData();
  formData.append("brand", document.getElementById("carBrand").value);
  formData.append("model", document.getElementById("carModel").value);
  formData.append("year", document.getElementById("carYear").value);
  formData.append("pricePerDay", document.getElementById("carPrice").value);
  formData.append("quantity", document.getElementById("carQuantity").value);
  formData.append("img", document.getElementById("carImage").files[0]);

  try {
    // 🛠️ Исправленный маршрут `/api/admin/cars/add`
    const response = await fetch("/api/admin/cars/add", {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      showToast("Машина добавлена", "success", true);
      hideAddCarForm();
      fetchCars();
    } else {
      showToast(data.message || "Ошибка при добавлении машины", "danger");
    }
  } catch (error) {
    showToast("Ошибка сервера", "danger");
  }
}

// 🔹 Загрузка машин в список
// 🔹 Загрузка списка машин
async function fetchCars() {
  const carsContainer = document.getElementById("carsContainer");
  carsContainer.innerHTML = "<h4>Загрузка...</h4>";

  try {
    const response = await fetch("/api/admin/cars", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    const cars = await response.json();
    if (!response.ok) throw new Error(cars.message || "Ошибка загрузки машин");

    carsContainer.innerHTML = `
      <ul class="list-group">
        ${cars.map(car => `
          <li class="list-group-item">
            <div class="d-flex flex-column gap-2">
              <img src="${car.img ? car.img : "/default-car.jpg"}" alt="Car Image" style="width: 150px;">
              ${createEditableField(car._id, "brand", car.brand)}
              ${createEditableField(car._id, "model", car.model)}
              ${createEditableField(car._id, "year", car.year)}
              ${createEditableField(car._id, "pricePerDay", car.pricePerDay)}
              ${createEditableField(car._id, "quantity", car.quantity)}
              
              <input type="file" id="carImage-${car._id}" class="form-control form-control-sm mb-2">
              <button class="btn btn-sm btn-warning" onclick="updateCarImage('${car._id}')">Обновить фото</button>
              <button class="btn btn-sm btn-danger" onclick="deleteCar('${car._id}')">Удалить</button>
            </div>
          </li>`).join("")}
      </ul>`;
  } catch (error) {
    showToast(error.message, "danger");
  }
}

// 🔹 Создание поля редактирования атрибута машины
function createEditableField(carId, field, value) {
  return `
    <div class="d-flex align-items-center">
      <strong class="me-2">${field.charAt(0).toUpperCase() + field.slice(1)}:</strong>
      <input type="text" class="form-control form-control-sm me-2" id="input-${field}-${carId}" value="${value}" disabled>
      <button class="btn btn-sm btn-info" id="edit-${field}-${carId}" onclick="toggleEdit('${carId}', '${field}')">Изменить</button>
      <button class="btn btn-sm btn-success d-none" id="save-${field}-${carId}" onclick="updateCarField('${carId}', '${field}')">Сохранить</button>
    </div>
  `;
}

// 🔹 Включение режима редактирования
function toggleEdit(carId, field) {
  const input = document.getElementById(`input-${field}-${carId}`);
  const editBtn = document.getElementById(`edit-${field}-${carId}`);
  const saveBtn = document.getElementById(`save-${field}-${carId}`);

  input.disabled = false;
  editBtn.classList.add("d-none");
  saveBtn.classList.remove("d-none");
}

// 🔹 Обновление атрибута машины
async function updateCarField(carId, field) {
  const input = document.getElementById(`input-${field}-${carId}`);
  const newValue = input.value.trim();
  const editBtn = document.getElementById(`edit-${field}-${carId}`);
  const saveBtn = document.getElementById(`save-${field}-${carId}`);

  if (!newValue) {
    showToast("Поле не может быть пустым", "danger");
    return;
  }

  try {
    const response = await fetch(`/api/admin/cars/${carId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ field, value: newValue }),
    });

    const data = await response.json();
    if (response.ok) {
      showToast(`Поле ${field} обновлено`, "success", true);
      input.disabled = true;
      saveBtn.classList.add("d-none");
      editBtn.classList.remove("d-none");
    } else {
      showToast(data.message || "Ошибка при обновлении автомобиля", "danger");
    }
  } catch (error) {
    showToast("Ошибка обновления", "danger");
  }
}


// 🔹 Обновление изображения автомобиля
async function updateCarImage(carId) {
  const fileInput = document.getElementById(`carImage-${carId}`);
  if (!fileInput.files.length) {
    showToast("Выберите изображение", "danger");
    return;
  }

  const formData = new FormData();
  formData.append("img", fileInput.files[0]);

  try {
    const response = await fetch(`/api/admin/cars/${carId}/image`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      showToast("Изображение обновлено", "success", true);
      fetchCars();
    } else {
      showToast(data.message || "Ошибка при обновлении изображения", "danger");
    }
  } catch (error) {
    showToast("Ошибка сервера", "danger");
  }
}

// 🔹 Удаление машины
async function deleteCar(carId) {

  try {
    const response = await fetch(`/api/admin/cars/${carId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    const data = await response.json();
    if (response.ok) {
      showToast("Машина удалена", "success", true);
      fetchCars();
    } else {
      showToast(data.message || "Ошибка удаления машины", "danger");
    }
  } catch (error) {
    showToast("Ошибка удаления", "danger");
  }
}
