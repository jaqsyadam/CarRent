require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("./cronTasks");
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Подключение маршрутов
const adminRoutes = require("./routes/admin.route");
app.use("/api/admin", adminRoutes);
app.use("/api/auth", require("./routes/auth.route"));
app.use("/api/cars", require("./routes/car.route"));
app.use("/api/bookings", require("./routes/booking.route"));
app.use("/api/payments", require("./routes/payment.route"));
app.use("/api/history", require("./routes/history.route"));

// Подключение статической папки
app.use(express.static(path.join(__dirname, "public")));

// Доступ к папке `uploads`
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Обработка маршрутов для страниц без расширения .html
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/cars", (req, res) => res.sendFile(path.join(__dirname, "public", "cars.html")));
app.get("/admin", (req, res) => res.sendFile(path.join(__dirname, "public", "admin.html")));
app.get("/bookings", (req, res) => res.sendFile(path.join(__dirname, "public", "bookings.html")));
app.get("/payment", (req, res) => res.sendFile(path.join(__dirname, "public", "payment.html")));
app.get("/404", (req, res) => res.sendFile(path.join(__dirname, "public", "404.html")));
app.get("/forgot-password", (req, res) => res.sendFile(path.join(__dirname, "public", "forgot-password.html")));
app.get("/history", (req, res) => res.sendFile(path.join(__dirname, "public", "history.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/profile", (req, res) => res.sendFile(path.join(__dirname, "public", "profile.html")));
app.get("/register", (req, res) => res.sendFile(path.join(__dirname, "public", "register.html")));
app.get("/reset-password", (req, res) => res.sendFile(path.join(__dirname, "public", "reset-password.html")));
app.get("/verify-otp", (req, res) => res.sendFile(path.join(__dirname, "public", "verify-otp.html")));


// Маршрут для любых неизвестных путей
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Подключение к MongoDB
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("База данных подключена"))
  .catch((err) => console.error("Ошибка подключения к базе данных:", err));

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
