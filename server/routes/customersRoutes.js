const express = require("express");
const customerController = require("../controllers/customerController");
const { isTokenExpired } = require("../controllers/refreshTokenController");


const router = express.Router();

router.post("/", customerController.addCustomer);
router.post("/login", customerController.loginCustomer);
router.get("/", isTokenExpired, customerController.getAllCustomers);
router.get("/search", isTokenExpired, customerController.findCustomerByQuery);
router.get("/:id", isTokenExpired, customerController.findCustomerById);
router.put("/:id", isTokenExpired, customerController.updateCustomer);
router.delete("/:id", isTokenExpired, customerController.deleteCustomer);
router.get("/profile/:id", isTokenExpired, customerController.getCustomerProfile);
router.patch("/update/profile/:id", isTokenExpired, customerController.updateCustomerProfile);
router.put("/validate/:id/:token", isTokenExpired, customerController.validateProfile);


 







module.exports = router ;

