const express = require("express");
const subcategoriesController = require("../controllers/subcategoriesController");
const { isTokenExpired } = require("../controllers/refreshTokenController");

const router = express.Router();
router.post("/", isTokenExpired, subcategoriesController.addSubcategory);
router.get("/", subcategoriesController.getAllSubcategories);
router.get("/search", subcategoriesController.findSubcategoryByQuery);
router.get("/:id", subcategoriesController.findSubcategoryById);
router.put("/:id", isTokenExpired, subcategoriesController.updateSubcategory);
router.delete("/:id", isTokenExpired, subcategoriesController.deleteSubcategory);

module.exports = router ;