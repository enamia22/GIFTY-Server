const express = require("express");
const productsController = require("../controllers/productsController");
const multer = require('multer');
const { isTokenExpired } = require("../controllers/refreshTokenController");

// Set up storage for uploaded files (you can customize the destination and filename)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Set the upload directory
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
});
  
const upload = multer({ storage: storage });

const router = express.Router();
router.post("/", isTokenExpired, upload.single('productImage'), productsController.addProduct);
router.get("/", isTokenExpired, productsController.getAllProducts);
router.get("/search", isTokenExpired, productsController.findProductByQuery);
router.get("/:id", isTokenExpired, productsController.findProductById);
router.patch("/:id", isTokenExpired, upload.single('productImage'), productsController.updateProduct);
router.delete("/:id", isTokenExpired, productsController.deleteProduct);

module.exports = router ;