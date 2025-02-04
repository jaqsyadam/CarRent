exports.verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Неавторизованный доступ" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Недостаточно прав" });
  }

  next();
};
