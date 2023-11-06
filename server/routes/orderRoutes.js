const express = require("express");
const orderController = require("../controllers/orderController");
const { isTokenExpired } = require("../controllers/refreshTokenController");

const router = express.Router();
router.post("/", isTokenExpired, orderController.addOrder);
router.get("/", isTokenExpired, orderController.getAllOrders);
router.get('/order-count', isTokenExpired,orderController.orderCount);
router.get('/total-revenue',isTokenExpired, orderController.totalRevenueCount);
router.get("/:id", isTokenExpired, orderController.getOrderById);
router.put("/:id", isTokenExpired, orderController.updateOrder);


module.exports = router;