const express = require("express");
const router = express.Router();

const carController = require("../controllers/carController");
const auth = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/requireAdmin");
const upload = require("../middleware/upload");
// PUBLIC
router.get("/", carController.getCars);
router.post("/:id/images", auth, requireAdmin, upload.array("images", 5), carController.uploadCarImages);
router.get("/:id", carController.getCarById);

// ADMIN ONLY
router.post("/", auth, requireAdmin, carController.createCar);
router.put("/:id", auth, requireAdmin, carController.updateCar);
router.delete("/:id", auth, requireAdmin, carController.deleteCar);

module.exports = router;