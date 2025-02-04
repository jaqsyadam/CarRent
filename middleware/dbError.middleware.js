module.exports = (err, req, res, next) => {
    console.error("Ошибка базы данных:", err.message);
  
    // Если ошибка связана с MongoDB или Mongoose
    if (err.name === "MongoError" || err.name === "MongooseError" || err.name === "MongoServerError") {
      return res.status(500).json({
        message: "Ошибка базы данных. Попробуйте позже.",
      });
    }
  
    // Передаём ошибку дальше, если это не ошибка БД
    next(err);
  };
  