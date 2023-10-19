const express = require("express");
const subcategoriesController = require("../controllers/subcategoriesController");

const router = express.Router();
router.post("/", subcategoriesController.addSubcategory);
router.get("/", subcategoriesController.getAllSubcategories);
router.get("/search", subcategoriesController.findSubcategoryByQuery);
router.get("/:id", subcategoriesController.findSubcategoryById);
router.put("/:id", subcategoriesController.updateSubcategory);
router.delete("/:id", subcategoriesController.deleteSubcategory);

module.exports = router ;