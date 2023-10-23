const express = require("express");
const productsController = require("../controllers/productsController");
const multer = require('multer');
// const { body } = require('express-validator');
const { isTokenExpired } = require("../controllers/refreshTokenController");
// const app = express();

// app.use(express.json());

// const validateCreateProduct = () => [
//   [
//     body('productName').not().isEmpty().trim(),
//     body('shortDescription').not().isEmpty().trim(),
//     body('longDescription').not().isEmpty().trim(),
//     body('subcategoryId').isMongoId(), // Assuming subcategoryId is a valid MongoDB ObjectId
//     body('price').isFloat({ min: 0 }), // Assuming price is a positive float
//     body('discountPrice').isFloat({ min: 0 }), // Assuming discountPrice is a positive float
//     body('options').isArray(), // Assuming options is an array
//     // Add more validation rules as needed
//   ],
// ]
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