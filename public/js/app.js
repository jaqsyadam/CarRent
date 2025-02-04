document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  const navLogin = document.getElementById("navLogin");
  const navProfile = document.getElementById("navProfile");
  const navLogout = document.getElementById("navLogout");

  if (token) {
    // Пользователь авторизован
    navLogin.style.display = "none"; // Скрываем кнопку "Вход"
    navProfile.style.display = "block"; // Показываем кнопку "Профиль"
    navLogout.style.display = "block"; // Показываем кнопку "Выйти"
  } else {
    // Пользователь не авторизован
    navLogin.style.display = "block"; // Показываем кнопку "Вход"
    navProfile.style.display = "none"; // Скрываем кнопку "Профиль"
    navLogout.style.display = "none"; // Скрываем кнопку "Выйти"
  }

  // Обработка выхода
  navLogout?.addEventListener("click", () => {
    localStorage.removeItem("token"); // Удаляем токен
    localStorage.setItem("toastMessage", JSON.stringify({ message: "Вы вышли из аккаунта.", type: "success" }));
    window.location.href = "/index"; // Перенаправляем на главную страницу
  });
});
