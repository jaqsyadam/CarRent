module.exports = (req, res, next) => {
    res.sendNotification = (message, type = "success", data = null) => {
      res.status(200).json({ message, type, data });
    };
    next();
  };
  