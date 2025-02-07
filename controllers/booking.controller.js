const Booking = require("../models/booking.model");
const Car = require("../models/car.model");
const Payment = require("../models/payment.model");

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("car")
      .sort({ createdAt: -1 }); // Сортируем по времени создания (новые сначала)

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ message: "Бронирования не найдены." });
    }

    res.status(200).json(bookings);
  } catch (err) {
    console.error("Ошибка при получении бронирований:", err.message);
    res.status(500).json({ message: "Ошибка сервера.", error: err.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("car user", "brand model name email");
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Ошибка при получении бронирований:", error);
    res.status(500).json({ message: "Ошибка сервера при получении бронирований" });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Бронирование не найдено." });
    }

    // Проверяем, принадлежит ли бронирование текущему пользователю
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Вы не можете удалить это бронирование." });
    }

    // Разрешаем удаление только для статусов completed и cancelled
    if (booking.status !== "completed" && booking.status !== "cancelled") {
      return res
        .status(400)
        .json({ message: "Можно удалять только завершенные или отмененные бронирования." });
    }

    await booking.deleteOne();

    res.status(200).json({ message: "Бронирование успешно удалено." });
  } catch (err) {
    console.error("Ошибка при удалении бронирования:", err.message);
    res.status(500).json({ message: "Ошибка сервера.", error: err.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.body;

    const startTime = new Date(startDate);
    startTime.setUTCHours(0, 0, 0, 0); // Устанавливаем начало дня
    const endTime = new Date(endDate);
    endTime.setUTCHours(23, 59, 59, 999); // Устанавливаем конец дня

    // Проверяем, существует ли машина
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: "Автомобиль не найден." });
    }

    // Проверяем пересечения бронирований для выбранных дат
    const overlappingBookings = await Booking.find({
      car: carId,
      status: { $in: ["pending", "active"] },
      $or: [
        { startTime: { $lte: endTime }, endTime: { $gte: startTime } },
      ],
    });

    const availableQuantity = car.quantity - overlappingBookings.length;

    if (availableQuantity <= 0) {
      return res.status(400).json({
        message: "Нет доступных машин на выбранное время. Попробуйте другие даты.",
      });
    }

    // Уменьшаем количество машин, если бронирование начинается "сегодня"
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (startTime.toISOString() === today.toISOString()) {
      car.quantity -= 1;
      await car.save();
    }

    // Создаем бронирование
    const booking = new Booking({
      user: req.user.id,
      car: carId,
      startTime,
      endTime,
      totalPrice: car.pricePerDay * ((endTime - startTime) / (1000 * 60 * 60 * 24 + 1)),
      status: "pending", // По умолчанию "в ожидании оплаты"
    });

    await booking.save();

    res.status(201).json({ message: "Бронирование успешно создано.", booking });
  } catch (err) {
    console.error("Ошибка при создании бронирования:", err.message);
    res.status(500).json({ message: "Ошибка сервера.", error: err.message });
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

    if (booking.status === "active") {
      return res.status(400).json({ message: "Оплаченные бронирования нельзя отменить." });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Бронирование уже отменено." });
    }

    const car = await Car.findById(booking.car);
    if (car) {
      car.quantity += 1;

      // Проверка поля createdAt перед сохранением
      if (!car.createdAt || typeof car.createdAt !== 'object' || Object.keys(car.createdAt).length === 0) {
        car.createdAt = new Date();  // Установка текущей даты
      }

      await car.save();
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({ message: "Бронирование успешно отменено.", booking });
  } catch (err) {
    console.error("Ошибка при отмене бронирования:", err.message);
    res.status(500).json({ message: "Ошибка сервера.", error: err.message });
  }
};



// Оплата бронирования
exports.payBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Бронирование не найдено." });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ message: "Оплата невозможна для этого статуса." });
    }

    booking.status = "active";
    await booking.save();

    res.status(200).json({ message: "Бронирование успешно оплачено.", booking });
  } catch (err) {
    console.error("Ошибка при оплате бронирования:", err.message);
    res.status(500).json({ message: "Ошибка сервера.", error: err.message });
  }
};


exports.updateBookingTime = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { startTime, endTime } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Бронирование не найдено." });
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ message: "Дата окончания должна быть позже даты начала." });
    }

    booking.startTime = new Date(startTime);
    booking.endTime = new Date(endTime);
    await booking.save();

    res.status(200).json({ message: "Время бронирования успешно обновлено.", booking });
  } catch (err) {
    console.error("Ошибка при обновлении времени бронирования:", err.message);
    res.status(500).json({ message: "Ошибка сервера.", error: err.message });
  }
};

exports.handleBookingEnd = async () => {
  try {
    const currentTime = new Date();

    // Находим активные бронирования, которые закончились
    const expiredBookings = await Booking.find({
      endTime: { $lte: currentTime },
      status: "active",
    });

    for (const booking of expiredBookings) {
      const car = await Car.findById(booking.car);
      if (car) {
        car.quantity += 1; // Увеличиваем количество доступных машин
        await car.save();
      }

      booking.status = "completed"; // Меняем статус на завершенный
      await booking.save();
    }

    console.log("Обработка завершенных бронирований завершена.");
  } catch (err) {
    console.error("Ошибка обработки завершенных бронирований:", err.message);
  }
};



exports.cancelUnpaidBookings = async () => {
  try {
    const currentTime = new Date();
    const thirtyMinutesAgo = new Date(currentTime.getTime() - 30 * 60 * 1000);

    const unpaidBookings = await Booking.find({
      status: "pending",
      createdAt: { $lte: thirtyMinutesAgo },
    });

    for (const booking of unpaidBookings) {
      const car = await Car.findById(booking.car);
      if (car) {
        car.quantity += 1; // Восстанавливаем количество машин
        await car.save();
      }

      booking.status = "cancelled";
      await booking.save();
    }

    console.log("Обработка неоплаченных бронирований завершена.");
  } catch (err) {
    console.error("Ошибка обработки неоплаченных бронирований:", err.message);
  }
};

// Новый метод для получения недоступных дат
exports.getUnavailableDays = async (req, res) => {
  try {
    const { carId } = req.params;

    // Проверяем, существует ли автомобиль
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: "Автомобиль не найден." });
    }

    // Получаем все бронирования для данного автомобиля, исключая "cancelled" и "completed"
    const bookings = await Booking.find({
      car: carId,
      status: { $nin: ["cancelled", "completed"] },
    });

    const unavailableDays = {};

    bookings.forEach((booking) => {
      let currentDate = new Date(booking.startTime);
      currentDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(booking.endTime);
      endDate.setUTCHours(0, 0, 0, 0);

      while (currentDate <= endDate) {
        const formattedDate = currentDate.toISOString().split("T")[0];

        if (!unavailableDays[formattedDate]) {
          unavailableDays[formattedDate] = 0;
        }
        unavailableDays[formattedDate]++;
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    // Определяем полностью забронированные дни
    const fullyBookedDays = Object.keys(unavailableDays).filter(
      (date) => unavailableDays[date] >= car.quantity
    );

    res.status(200).json({ fullyBookedDays });
  } catch (err) {
    console.error("Ошибка при получении недоступных дней:", err.message);
    res.status(500).json({ message: "Ошибка сервера.", error: err.message });
  }
};

exports.getEditableDays = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    console.log("Получен bookingId:", bookingId);

    // Проверяем, существует ли бронирование
    const booking = await Booking.findById(bookingId);
    console.log("Результат поиска бронирования:", booking);

    if (!bookingId || bookingId.length !== 24) {
      console.error("Некорректный ID бронирования:", bookingId);
      return res.status(400).json({ message: "Некорректный ID бронирования." });
    }

    if (!booking) {
      console.error("Бронирование не найдено:", bookingId);
      return res.status(404).json({ message: "Бронирование не найдено." });
    }

    // Извлекаем carId из бронирования
    const carId = booking.car;
    console.log("Получен carId из бронирования:", carId);

    // Проверяем, существует ли автомобиль
    const car = await Car.findById(carId);
    console.log("Результат поиска автомобиля:", car);

    if (!car) {
      console.error("Автомобиль не найден:", carId);
      return res.status(404).json({ message: "Автомобиль не найден." });
    }

    // Получаем все бронирования для данного автомобиля
    const bookings = await Booking.find({
      car: carId,
      status: { $nin: ["cancelled", "completed"] },
    });

    console.log("Найденные бронирования для автомобиля:", bookings);

    const unavailableDays = {};
    const userDays = [];

    bookings.forEach((booking) => {
      let currentDate = new Date(booking.startTime);
      currentDate.setUTCHours(0, 0, 0, 0);
      const endDate = new Date(booking.endTime);
      endDate.setUTCHours(0, 0, 0, 0);

      while (currentDate <= endDate) {
        const formattedDate = currentDate.toISOString().split("T")[0];

        // Если дата брони принадлежит текущему пользователю
        if (booking.user.toString() === userId) {
          userDays.push(formattedDate);
        } else {
          // Увеличиваем счетчик занятых дат
          if (!unavailableDays[formattedDate]) {
            unavailableDays[formattedDate] = 0;
          }
          unavailableDays[formattedDate]++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    // Определяем полностью занятые дни, исключая дни текущего пользователя
    const fullyBookedDays = Object.keys(unavailableDays).filter(
      (date) => unavailableDays[date] >= car.quantity
    );

    console.log("Недоступные дни:", fullyBookedDays);
    console.log("Дни пользователя:", userDays);

    res.status(200).json({ fullyBookedDays, userDays });
  } catch (err) {
    console.error("Ошибка при получении редактируемых дней:", err.message);
    res.status(500).json({ message: "Ошибка сервера.", error: err.message });
  }
};

exports.updateBookingAttribute = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { field, value } = req.body;

    console.log("Данные для обновления:", { bookingId, field, value });

    const allowedFields = ["startTime", "endTime", "status", "totalPrice"];

    if (!allowedFields.includes(field)) {
      console.warn("Попытка обновить недопустимое поле:", field); // 🚩 Лог для диагностики
      return res.status(400).json({ message: "Недопустимое поле для обновления" });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { [field]: value },
      { new: true, runValidators: true }
    );

    if (!updatedBooking) {
      console.warn("Бронирование не найдено:", bookingId);
      return res.status(404).json({ message: "Бронирование не найдено" });
    }

    res.status(200).json({ message: "Бронирование обновлено", updatedBooking });
  } catch (error) {
    console.error("Ошибка при обновлении бронирования:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
};



exports.getBookingSummary = async (req, res) => {
  try {
    // Аналитика для бронирований
    const bookingStats = await Booking.aggregate([
      {
        $group: {
          _id: "$status",
          totalBookings: { $sum: 1 }
        }
      },
      { $sort: { totalBookings: -1 } }
    ]);

    // Самая популярная и наименее популярная машина
    const carDemand = await Booking.aggregate([
      {
        $group: {
          _id: "$car",
          bookingCount: { $sum: 1 }
        }
      },
      { $sort: { bookingCount: -1 } }
    ]);

    const mostPopularCarData = carDemand[0];
    const leastPopularCarData = carDemand[carDemand.length - 1];

    const mostPopularCar = mostPopularCarData
      ? await Car.findById(mostPopularCarData._id).select("brand model")
      : null;

    const leastPopularCar = leastPopularCarData
      ? await Car.findById(leastPopularCarData._id).select("brand model")
      : null;

    res.status(200).json({
      bookingStats,
      mostPopularCar: mostPopularCar
        ? {
            name: `${mostPopularCar.brand} ${mostPopularCar.model}`,
            bookings: mostPopularCarData.bookingCount
          }
        : { name: "Нет данных", bookings: 0 },

      leastPopularCar: leastPopularCar
        ? {
            name: `${leastPopularCar.brand} ${leastPopularCar.model}`,
            bookings: leastPopularCarData.bookingCount
          }
        : { name: "Нет данных", bookings: 0 },
    });
  } catch (err) {
    console.error("Ошибка при получении аналитики бронирований:", err);
    res.status(500).json({ message: "Ошибка сервера", error: err.message });
  }
};




exports.deleteCompletedOrCancelledBookings = async (req, res) => {
  try {
    const result = await Booking.deleteMany({
      status: { $in: ["completed", "cancelled"] }
    });

    res.status(200).json({
      message: "Все завершенные и отмененные бронирования успешно удалены.",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Ошибка при массовом удалении бронирований:", error);
    res.status(500).json({ message: "Ошибка сервера.", error: error.message });
  }
};
