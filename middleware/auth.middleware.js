const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

exports.verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Нет токена, доступ запрещен." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден." });
    }

    // Проверяем, соответствует ли токен последнему выданному
    if (user.currentToken !== token) {
      return res.status(401).json({ message: "Сессия истекла. Войдите снова." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Ошибка проверки токена:", error.message);
    res.status(401).json({ message: "Неверный токен." });
  }
};