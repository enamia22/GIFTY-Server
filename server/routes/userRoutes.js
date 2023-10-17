const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();
router.post("/", userController.addUser);
router.post("/login", userController.loginUser);
router.get("/", (req, res) => {
    res.send("hello")
});

module.exports = router ;