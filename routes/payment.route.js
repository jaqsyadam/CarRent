const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const { verifyToken } = require("../middleware/auth.middleware"); // Проверка авторизации

// Провести оплату
router.post("/", verifyToken, paymentController.processPayment);



module.exports = router;
