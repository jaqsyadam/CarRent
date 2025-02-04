const cron = require("node-cron");
const { handleBookingEnd } = require("./controllers/booking.controller");
const { cancelUnpaidBookings } = require("./controllers/booking.controller");

// Запуск задачи каждые 5 минут
cron.schedule("*/5 * * * *", async () => {
  console.log("Запуск обработки окончаний бронирований...");
  await cancelUnpaidBookings();
  try {
    await handleBookingEnd();
    console.log("Обработка окончаний завершена.");
  } catch (error) {
    console.error("Ошибка в CRON-задаче:", error.message);
  }
});

module.exports = cron;
