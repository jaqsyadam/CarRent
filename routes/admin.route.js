const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const { verifyAdmin } = require("../middleware/admin.middleware");
const upload = require("../middleware/upload.middleware");

const authController = require("../controllers/auth.controller");
const bookingController = require("../controllers/booking.controller");
const carController = require("../controllers/car.controller");
const paymentController = require("../controllers/payment.controller")

router.get("/bookings/summary", verifyToken, verifyAdmin, bookingController.getBookingSummary);
router.get("/payments/summary", verifyToken, verifyAdmin, paymentController.getPaymentSummary);


// Управление пользователями
router.get("/users", verifyToken, verifyAdmin, authController.getAllUsers);
router.delete("/users/:id", verifyToken, verifyAdmin, authController.deleteUser);
router.put("/users/:id", verifyToken, verifyAdmin, authController.updateUserAttribute);

// Управление бронированиями
router.get("/bookings", verifyToken, verifyAdmin, bookingController.getAllBookings);
router.delete("/bookings/delete-completed-cancelled", verifyToken, verifyAdmin, bookingController.deleteCompletedOrCancelledBookings);
router.delete("/bookings/:id", verifyToken, verifyAdmin, bookingController.deleteBooking);
router.put("/bookings/:id", verifyToken, verifyAdmin, bookingController.updateBookingAttribute);

// Управление машинами
router.get("/cars", verifyToken, verifyAdmin, carController.getAllCars);
router.get("/cars/:id", verifyToken, verifyAdmin, carController.getCarById);
router.delete("/cars/:id", verifyToken, verifyAdmin, carController.deleteCar);
router.put("/cars/:id", verifyToken, verifyAdmin, carController.updateCarAttribute);

// Добавление машины с изображением
router.post(
  "/cars/add",
  verifyToken,
  verifyAdmin,
  upload.single("img"), // Middleware загрузки изображения
  carController.addCar
);

// Обновление изображения машины
router.put(
  "/cars/:id/image",
  verifyToken,
  verifyAdmin,
  upload.single("img"), // Middleware загрузки изображения
  carController.updateCarImage
);




module.exports = router;
