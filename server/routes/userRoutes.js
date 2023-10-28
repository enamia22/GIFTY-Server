const express = require("express");
const userController = require("../controllers/userController");
const { isTokenExpired } = require("../controllers/refreshTokenController");

const router = express.Router();
router.post("/", isTokenExpired, userController.addUser);
router.post("/login", userController.loginUser);
router.get("/auth/check-auth", isTokenExpired, userController.checkAuth);
router.get("/auth/logout", isTokenExpired, userController.logout);
router.get("/", isTokenExpired, userController.getAllUsers);
router.get("/search", isTokenExpired, userController.findUserByQuery);
router.get("/:id", isTokenExpired, userController.findUserById);
router.put("/:id", isTokenExpired, userController.updateUser);
router.delete("/:id", isTokenExpired, userController.deleteUser);
  
module.exports = router;
