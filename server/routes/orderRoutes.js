const express = require("express");
const orderController = require("../controllers/orderController");

const router = express.Router();
router.post("/", orderController.addOrder);
router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrderById);
router.put("/:id", orderController.updateOrder);


module.exports = router;