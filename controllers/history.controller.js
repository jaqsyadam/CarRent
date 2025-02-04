const Booking = require("../models/booking.model");
const Car = require("../models/car.model");

// Получение всех бронирований пользователя
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }) // Используем req.user.id
      .populate("car") // Связываем с данными машины
      .exec();

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "Бронирования не найдены." });
    }

    res.status(200).json(bookings);
  } catch (err) {
    console.error("Ошибка при получении бронирований:", err.message);
    res.status(500).json({ message: "Ошибка сервера." });
  }
};

// Отмена бронирования
exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Бронирование не найдено." });
    }

    // Проверяем права пользователя
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Вы не можете отменить это бронирование." });
    }

    // Обновляем статус машины
    const car = await Car.findById(booking.car);
    if (car) {
      car.available = true; // Ставим машину в доступ
      await car.save();
    }

    // Удаляем бронирование
    await booking.remove();

    res.status(200).json({ message: "Бронирование успешно отменено." });
  } catch (err) {
    console.error("Ошибка при отмене бронирования:", err.message);
    res.status(500).json({ message: "Ошибка сервера." });
  }
};
