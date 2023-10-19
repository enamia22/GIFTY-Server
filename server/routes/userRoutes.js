const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();
router.post("/", userController.addUser);
router.post("/login", userController.loginUser);
router.get("/", userController.getAllUsers);
router.get("/search", userController.findUserByQuery);
router.get("/:id", userController.findUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router ;