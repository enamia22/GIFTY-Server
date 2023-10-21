const express = require("express");
const categoryController = require("../controllers/categoryController");
const { isTokenExpired } = require("../controllers/refreshTokenController");

const router = express.Router();
router.post("/", isTokenExpired, categoryController.addCategory);
router.get("/", categoryController.getAllCategories);
router.get("/search", categoryController.findCategoryByQuery);
router.get("/:id", categoryController.findCategoryById);
router.put("/:id", isTokenExpired, categoryController.updateCategory);
router.delete("/:id", isTokenExpired, categoryController.deleteCategory);

module.exports = router;