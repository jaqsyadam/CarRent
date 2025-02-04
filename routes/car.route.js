const express = require("express");
const router = express.Router();
const carController = require("../controllers/car.controller"); 
const { verifyToken } = require("../middleware/auth.middleware"); 
const { verifyAdmin } = require("../middleware/admin.middleware"); 
const upload = require("../middleware/upload.middleware"); 


// Добавить новый автомобиль (только администратор)
router.post("/add", verifyToken, verifyAdmin, upload.single("img"), carController.addCar);

// Получить фильтры (марки, минимальная и максимальная цена)
router.get("/filters", carController.getFilters);

// Получить все автомобили
router.get("/", carController.getAllCars);

// Получить автомобиль по ID
router.get("/:id", carController.getCarById);


module.exports = router;
