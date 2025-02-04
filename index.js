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


// Делаем папку `uploads` доступной для клиента
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


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
