const express = require("express");
const productsController = require("../controllers/productsController");
const multer = require('multer');

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
router.post("/", upload.single('productImage'), productsController.addProduct);
router.get("/", productsController.getAllProducts);
router.get("/search", productsController.findProductByQuery);
router.get("/:id", productsController.findProductById);
router.patch("/:id", upload.single('productImage'), productsController.updateProduct);
router.delete("/:id", productsController.deleteProduct);

module.exports = router ;