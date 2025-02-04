document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    localStorage.setItem("toastMessage", JSON.stringify({ message: "Вы не авторизованы. Пожалуйста, войдите в аккаунт.", type: "danger" }));
    window.location.href = "/login";
    return;
  }

  try {
    const response = await fetch("/api/auth/profile", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const user = await response.json();

    if (response.ok) {
      // Заполняем информацию профиля
      document.getElementById("displayName").textContent = user.name;
      document.getElementById("displayEmail").textContent = user.email;
      document.getElementById("displayPhone").textContent = user.phone || "";

      // Заполняем поля формы
      document.getElementById("name").value = user.name;
      document.getElementById("email").value = user.email;
      document.getElementById("phone").value = user.phone || "";
    } else {
      localStorage.removeItem("token");
      localStorage.setItem("toastMessage", JSON.stringify({ message: user.message || "Ошибка загрузки профиля", type: "danger" }));
      window.location.href = "/login";
    }
  } catch (error) {
    console.error("Ошибка загрузки профиля:", error);
    showToast("Произошла ошибка при загрузке профиля.", "danger");
  }
});

// Обработка выхода
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.setItem("toastMessage", JSON.stringify({ message: "Вы вышли из аккаунта", type: "success" }));
  window.location.href = "/";
});

// Показываем форму изменения данных
document.getElementById("editProfileBtn")?.addEventListener("click", () => {
  document.getElementById("profileInfo").style.display = "none"; // Скрываем информацию
  document.getElementById("updateProfileForm").style.display = "block"; // Показываем форму
});

// Отмена изменения данных
document.getElementById("cancelEditBtn")?.addEventListener("click", () => {
  document.getElementById("updateProfileForm").style.display = "none"; // Скрываем форму
  document.getElementById("profileInfo").style.display = "block"; // Показываем информацию
});

// Обновление профиля
document.getElementById("updateProfileForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();

  // Проверка email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showToast("Введите корректный email.", "danger");
    return;
  }

  // Проверка номера телефона
  const phoneRegex = /^\d+$/; // Только цифры
  if (phone && !phoneRegex.test(phone)) {
    showToast("Номер телефона должен содержать только цифры.", "danger");
    return;
  }

  const token = localStorage.getItem("token");

  try {
    const response = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, email, phone }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("toastMessage", JSON.stringify({ message: "Профиль успешно обновлен!", type: "success" }));
      window.location.reload();
    } else {
      showToast(data.message || "Ошибка при обновлении профиля.", "danger");
    }
  } catch (error) {
    console.error("Ошибка при обновлении профиля:", error);
    showToast("Произошла ошибка при обновлении профиля.", "danger");
  }
});
