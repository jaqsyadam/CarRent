const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const dbErrorMiddleware = require("../middleware/dbError.middleware");

// Регистрация
router.post("/register", authController.register);

// Вход (отправка OTP-кода)
router.post("/login", authController.login);

// Проверка OTP-кода
router.post("/verify-otp", authController.verifyOTP);

// Запрос на сброс пароля
router.post("/forgot-password", authController.forgotPassword);

// Установка нового пароля
router.post("/reset-password", authController.resetPassword);

// Получение профиля
router.get("/profile", verifyToken, authController.getProfile);

// Обновление профиля
router.put("/profile/update", verifyToken, authController.updateProfile);

router.post("/get-otp-test", authController.getOtpForTest);

router.use(dbErrorMiddleware);

module.exports = router;
