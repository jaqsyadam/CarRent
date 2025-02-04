const Car = require("../models/car.model");


// Уменьшить количество автомобилей
exports.decreaseCarQuantity = async (carId) => {
  try {
    const car = await Car.findById(carId);
    if (!car) {
      throw new Error("Автомобиль не найден");
    }

    if (car.quantity > 0) {
      car.quantity -= 1;
    }

    if (car.quantity === 0) {
      car.available = false;
    }

    await car.save();
    return car;
  } catch (err) {
    throw new Error(err.message);
  }
};




// Получить все автомобили
exports.getAllCars = async (req, res) => {
  try {
    const { brand, engine, transmission, drive, minPrice, maxPrice } = req.query;

    // Фильтры для поиска
    const filter = {};
    if (brand) filter.brand = brand;
    if (engine) filter.engine = engine;
    if (transmission) filter.transmission = transmission;
    if (drive) filter.drive = drive;
    if (minPrice && maxPrice) {
      filter.pricePerDay = { $gte: Number(minPrice), $lte: Number(maxPrice) };
    }

    // Получаем все машины, соответствующие фильтрам
    const cars = await Car.find(filter);

    // Удаление дублирующихся машин по ключевым полям
    const uniqueCars = cars.filter((car, index, self) =>
      index === self.findIndex((c) =>
        c.brand === car.brand &&
        c.model === car.model &&
        c.year === car.year &&
        c.engine === car.engine &&
        c.transmission === car.transmission &&
        c.drive === car.drive &&
        c.pricePerDay === car.pricePerDay
      )
    );

    res.json(uniqueCars);
  } catch (error) {
    console.error("Ошибка при получении автомобилей:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};


// Получить автомобиль по ID
exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: "Автомобиль не найден" });
    }
    res.status(200).json(car);
  } catch (err) {
    console.error("Ошибка получения автомобиля:", err);
    res.status(500).json({ message: "Ошибка сервера", error: err.message });
  }
};


// Удаление машины
exports.deleteCar = async (req, res) => {
  try {
    const carId = req.params.id;
    const car = await Car.findByIdAndDelete(carId);

    if (!car) {
      return res.status(404).json({ message: "Машина не найдена" });
    }

    res.status(200).json({ message: "Машина успешно удалена" });
  } catch (error) {
    console.error("Ошибка при удалении машины:", error);
    res.status(500).json({ message: "Ошибка сервера при удалении машины" });
  }
};

// Обновление атрибута машины
exports.updateCarAttribute = async (req, res) => {
  try {
    const carId = req.params.id;
    const { field, value } = req.body;

    const allowedFields = ["brand", "model", "year", "pricePerDay", "quantity"];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({ message: "Недопустимое поле для обновления" });
    }

    const updatedCar = await Car.findByIdAndUpdate(
      carId,
      { [field]: value },
      { new: true, runValidators: true }
    );

    if (!updatedCar) {
      return res.status(404).json({ message: "Машина не найдена" });
    }

    res.status(200).json({ message: `Поле ${field} успешно обновлено`, car: updatedCar });
  } catch (error) {
    console.error("Ошибка при обновлении машины:", error);
    res.status(500).json({ message: "Ошибка сервера при обновлении машины" });
  }
};

// Добавление машины
exports.addCar = async (req, res) => {
  try {
    const { brand, model, year, pricePerDay, quantity } = req.body;
    const img = req.file ? `/uploads/${req.file.filename}` : null;

    const newCar = new Car({ brand, model, year, pricePerDay, quantity, img });
    await newCar.save();

    res.status(201).json({ message: "Машина успешно добавлена", car: newCar });
  } catch (error) {
    console.error("Ошибка при добавлении машины:", error);
    res.status(500).json({ message: "Ошибка сервера при добавлении машины" });
  }
};



exports.getFilters = async (req, res) => {
  try {
    const brands = await Car.distinct("brand"); // Уникальные марки автомобилей
    const minPrice = await Car.findOne().sort({ pricePerDay: 1 }).select("pricePerDay");
    const maxPrice = await Car.findOne().sort({ pricePerDay: -1 }).select("pricePerDay");

    res.status(200).json({
      brands,
      minPrice: minPrice?.pricePerDay || 0,
      maxPrice: maxPrice?.pricePerDay || 10000,
    });
  } catch (err) {
    console.error("Ошибка получения фильтров:", err.message);
    res.status(500).json({ message: "Ошибка сервера." });
  }
};

exports.updateCarImage = async (req, res) => {
  try {
    const carId = req.params.id;

    // Проверяем, был ли загружен файл
    if (!req.file) {
      return res.status(400).json({ message: "Файл не загружен" });
    }

    // Проверяем, существует ли автомобиль
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: "Автомобиль не найден" });
    }

    // Обновляем путь к изображению
    car.img = `/uploads/${req.file.filename}`;
    await car.save();

    res.status(200).json({ message: "Изображение автомобиля успешно обновлено", car });
  } catch (error) {
    console.error("Ошибка при обновлении изображения автомобиля:", error);
    res.status(500).json({ message: "Ошибка сервера при обновлении изображения автомобиля" });
  }
};
