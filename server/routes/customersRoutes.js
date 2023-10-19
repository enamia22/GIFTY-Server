const express = require("express");
const customerController = require("../controllers/customerController");

const router = express.Router();

router.post("/", customerController.addCustomer);
router.post("/login", customerController.loginCustomer);
router.get("/", customerController.getAllCustomers);
router.get("/search", customerController.findCustomerByQuery);
router.get("/:id", customerController.findCustomerById);
router.put("/:id", customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomer);
router.get("/profile/:id", customerController.getCustomerProfile);
router.patch("/update/profile/:id", customerController.updateCustomerProfile);
router.put("/validate/:id/:token", customerController.validateProfile);
 







module.exports = router ;

