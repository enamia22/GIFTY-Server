const express = require("express");
const orderController = require("../controllers/orderController");
const { isTokenExpired } = require("../controllers/refreshTokenController");
const multer = require('multer');
// Set up storage for uploaded files (you can customize the destination and filename)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/giftCards'); // Set the upload directory
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
});
  
const upload = multer({ storage: storage });

const router = express.Router();
router.post("/", isTokenExpired, orderController.addOrder);
router.get("/", isTokenExpired, orderController.getAllOrders);
router.get("/customerCards", isTokenExpired, orderController.getCustomerCards);
router.get("/my-orders", isTokenExpired, orderController.getCustomerOrders);
router.post("/upload-gift-card", isTokenExpired, upload.single('giftCard'), orderController.uploadGiftCard);
router.get('/get-gift-card/:imageName', isTokenExpired, orderController.getCustomerCard);
router.get('/order-count', isTokenExpired,orderController.orderCount);
router.get('/total-revenue',isTokenExpired, orderController.totalRevenueCount);
router.get("/:id", isTokenExpired, orderController.getOrderById);
router.put("/:id", isTokenExpired, orderController.updateOrder);


module.exports = router;