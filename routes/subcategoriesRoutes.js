const express = require("express");
const subcategoriesController = require("../controllers/subcategoriesController");
const { isTokenExpired } = require("../controllers/refreshTokenController");

const router = express.Router();
router.post("/", isTokenExpired, subcategoriesController.addSubcategory);
router.get("/", isTokenExpired, subcategoriesController.getAllSubcategories);
router.get("/search", isTokenExpired, subcategoriesController.findSubcategoryByQuery);
router.get("/:id", isTokenExpired, subcategoriesController.findSubcategoryById);
router.put("/:id", isTokenExpired, subcategoriesController.updateSubcategory);
router.delete("/:id", isTokenExpired, subcategoriesController.deleteSubcategory);

module.exports = router ;