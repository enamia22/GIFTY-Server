const express = require("express");
const categoryController = require("../controllers/categoryController");
const { isTokenExpired } = require("../controllers/refreshTokenController");

const router = express.Router();
router.post("/", isTokenExpired, categoryController.addCategory);
router.get("/", isTokenExpired, categoryController.getAllCategories);
router.get("/dataDropDown", isTokenExpired, categoryController.getDataDropDown);
router.get("/search", isTokenExpired, categoryController.findCategoryByQuery);
router.get("/:id", isTokenExpired, categoryController.findCategoryById);
router.put("/:id", isTokenExpired, categoryController.updateCategory);
router.delete("/:id", isTokenExpired, categoryController.deleteCategory);

module.exports = router;