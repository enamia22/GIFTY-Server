const express = require("express");
const categoryController = require("../controllers/categoryController");

const router = express.Router();
router.post("/", categoryController.addCategory);
router.get("/", categoryController.getAllCategories);
router.get("/search", categoryController.findCategoryByQuery);
router.get("/:id", categoryController.findCategoryById);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;