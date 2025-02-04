const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");
const { verifyToken } = require("../middleware/auth.middleware");
// Создание бронирования
router.post("/", verifyToken, bookingController.createBooking);

module.exports = router;

router.get("/:carId/unavailable-days", bookingController.getUnavailableDays);

// Для редактируемых дней (используется в history)
router.get(
  "/:carId/editable-days",
  verifyToken,
  bookingController.getEditableDays
);


router.get("/", verifyToken, bookingController.getBookings);
// Создание нового бронирования
router.post("/", verifyToken, bookingController.createBooking);

router.delete("/:id", verifyToken, bookingController.deleteBooking);


// Оплатить бронирование
router.post("/:id/pay", verifyToken, bookingController.payBooking);

// Отменить бронирование
router.delete("/:id/cancel", verifyToken, bookingController.cancelBooking);

// Обновить время бронирования
router.put("/:id", verifyToken, bookingController.updateBookingTime);

module.exports = router;
