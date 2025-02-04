const Booking = require("../models/booking.model");
const Payment = require("../models/payment.model");

exports.processPayment = async (req, res) => {
  const { bookingId, cardNumber, cardHolder, expiryDate, cvv } = req.body;

  // Проверяем наличие всех обязательных полей
  if (!bookingId || !cardNumber || !cardHolder || !expiryDate || !cvv) {
    return res.status(400).json({ message: "Все поля обязательны для заполнения." });
  }

  // Валидация полей карты
  if (!/^\d{16}$/.test(cardNumber)) {
    return res.status(400).json({ message: "Некорректный номер карты." });
  }
  if (!/^[a-zA-Z\s]+$/.test(cardHolder)) {
    return res.status(400).json({ message: "Некорректное имя владельца." });
  }
  if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
    return res.status(400).json({ message: "Некорректный срок действия карты." });
  }
  if (!/^\d{3}$/.test(cvv)) {
    return res.status(400).json({ message: "Некорректный CVV код." });
  }

  try {
    // Проверяем существование бронирования
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Бронирование не найдено." });
    }

    // Проверяем статус бронирования
    if (booking.status === "cancelled" || booking.status === "completed") {
      return res.status(400).json({ message: "Это бронирование не может быть оплачено." });
    }

    // Создаем запись об оплате
    const payment = new Payment({
      booking: bookingId,
      user: req.user.id,
      amount: booking.totalPrice,
      method: "card",
      status: "completed",
    });

    await payment.save();

    // Обновляем статус бронирования на "active"
    booking.status = "active";
    await booking.save();

    res.status(200).json({ message: "Оплата успешно завершена", payment });
  } catch (err) {
    console.error("Ошибка при обработке оплаты:", err.message);
    res.status(500).json({ message: "Ошибка сервера.", error: err.message });
  }
};
