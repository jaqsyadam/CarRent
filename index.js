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

// Подключение маршрутов API
app.use("/api/admin", require("./routes/admin.route"));
app.use("/api/auth", require("./routes/auth.route"));
app.use("/api/cars", require("./routes/car.route"));
app.use("/api/bookings", require("./routes/booking.route"));
app.use("/api/payments", require("./routes/payment.route"));
app.use("/api/history", require("./routes/history.route"));

// Подключение статической папки
app.use(express.static(path.join(__dirname, "public")));

// Доступ к папке `uploads`
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Маршруты для страниц без расширения .html
const pages = [
  "index",
  "cars",
  "admin",
  "bookings",
  "payment",
  "404",
  "forgot-password",
  "history",
  "login",
  "profile",
  "register",
  "reset-password",
  "verify-otp"
];

pages.forEach((page) => {
  app.get(`/${page === "index" ? "" : page}`, (req, res) =>
    res.sendFile(path.join(__dirname, "public", `${page}.html`))
  );
});

// Обработка неизвестных маршрутов (404)
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

// Подключение к MongoDB
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(" База данных подключена"))
  .catch((err) => console.error(" Ошибка подключения к базе данных:", err));

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Сервер запущен на порту ${PORT}`);
});
