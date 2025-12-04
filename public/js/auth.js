// Регистрация
document.getElementById("registerForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value.trim();

  // Проверка email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showToast("Введите корректный email.", "danger");
    return;
  }

  // Проверка номера телефона (только цифры)
  const phoneRegex = /^\d+$/;
  if (!phoneRegex.test(phone)) {
    showToast("Номер телефона должен содержать только цифры.", "danger");
    return;
  }

  // Проверка пароля (например, минимум 6 символов)
  if (password.length < 6) {
    showToast("Пароль должен быть не менее 6 символов.", "danger");
    return;
  }

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    });

    const data = await response.json();

    if (response.ok) {
      showToast("Регистрация успешна! Теперь войдите в свой аккаунт.", "success", true);
      window.location.href = "/login"; // Переход на страницу логина
    } else {
      showToast(data.message || "Ошибка регистрации", "danger");
    }
  } catch (error) {
    console.error("Ошибка:", error);
    showToast("Произошла ошибка", "danger");
  }
});

// 🔹 Авторизация
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("https://your-backend.onrender.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }
    window.location.href = `/verify-otp.html?email=${email}`;

  } catch (error) {
    console.error("Ошибка:", error);
    alert("Ошибка сервера");
  }
});

// 🔹 Проверка OTP-кода
document.getElementById("otpForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = localStorage.getItem("emailForOTP");
  const otp = document.getElementById("otp").value.trim();

  try {
    const response = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      showToast("Авторизация успешна!", "success", true);
      window.location.href = "/profile"; // Переход в профиль
    } else {
      showToast(data.message || "Ошибка подтверждения OTP", "danger");
    }
  } catch (error) {
    console.error("Ошибка:", error);
    showToast("Ошибка сервера", "danger");
  }
});

  
  // 🔹 Запрос на сброс пароля
  document.getElementById("forgotPasswordForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
  
    const email = document.getElementById("email").value;
  
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        showToast("Ссылка для сброса пароля отправлена на email", "success", true);
        window.location.href = "/login"; // Переход на страницу логина
      } else {
        showToast(data.message || "Ошибка", "danger");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      showToast("Ошибка сервера", "danger");
    }
  });
  
  // 🔹 Сброс пароля
  document.getElementById("resetPasswordForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
  
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const password = document.getElementById("newPassword").value;
  
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        showToast("Пароль успешно изменен! Войдите в систему.", "success", true);
        window.location.href = "/login";
      } else {
        showToast(data.message || "Ошибка", "danger");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      showToast("Ошибка сервера", "danger");
    }
  });
  

