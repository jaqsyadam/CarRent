document.getElementById("paymentForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const cardNumber = document.getElementById("cardNumber").value.trim();
  const cardHolder = document.getElementById("cardHolder").value.trim();
  const expiryDate = document.getElementById("expiryDate").value.trim();
  const cvv = document.getElementById("cvv").value.trim();

  // Проверка на заполнение полей
  if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
    showToast("Все поля обязательны для заполнения.", "danger");
    return;
  }

  // Получение ID бронирования из URL
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get("bookingId");

  if (!bookingId) {
    showToast("ID бронирования не найдено.", "danger");
    return;
  }

  try {
    const response = await fetch("/api/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        bookingId,
        cardNumber,
        cardHolder,
        expiryDate,
        cvv,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("toastMessage", JSON.stringify({ message: "Оплата успешно завершена!", type: "success" }));
      window.location.href = "/history.html"; // Перенаправление после успешной оплаты
    } else {
      showToast(data.message || "Ошибка при обработке оплаты.", "danger");
    }
  } catch (error) {
    console.error("Ошибка оплаты:", error);
    showToast("Произошла ошибка при оплате.", "danger");
  }
});
