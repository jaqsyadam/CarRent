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

exports.getPaymentSummary = async (req, res) => {
  try {
    const today = new Date();
    const last30Days = new Date(today.setDate(today.getDate() - 30));
    const previous30Days = new Date(today.setDate(today.getDate() - 30));

    // Самый используемый метод оплаты
    const mostUsedMethod = await Payment.aggregate([
      { $group: { _id: "$method", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    // Прибыль за последние 30 дней
    const recentRevenue = await Payment.aggregate([
      { $match: { createdAt: { $gte: last30Days } } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
    ]);

    // Прибыль за предыдущие 30 дней
    const previousRevenue = await Payment.aggregate([
      { $match: { createdAt: { $gte: previous30Days, $lt: last30Days } } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
    ]);

    const recentTotal = recentRevenue[0]?.totalRevenue || 0;
    const previousTotal = previousRevenue[0]?.totalRevenue || 0;

    // Рассчитываем рост/снижение в процентах
    const growthRate = previousTotal
      ? (((recentTotal - previousTotal) / previousTotal) * 100).toFixed(2)
      : "Нет данных для сравнения";

    res.status(200).json({
      mostUsedMethod: mostUsedMethod[0]?._id || "Нет данных",
      recentRevenue: recentTotal,
      growthRate
    });
  } catch (err) {
    console.error("Ошибка при получении аналитики платежей:", err);
    res.status(500).json({ message: "Ошибка сервера", error: err.message });
  }
};

