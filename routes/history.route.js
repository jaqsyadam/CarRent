const express = require("express");
const router = express.Router();
const historyController = require("../controllers/history.controller");
const { verifyToken } = require("../middleware/auth.middleware"); // Исправленный импорт

// Получение всех бронирований
router.get("/", verifyToken, historyController.getBookings);

// Отмена бронирования
router.delete("/:id", verifyToken, historyController.cancelBooking);

module.exports = router;
