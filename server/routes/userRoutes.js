const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();
router.post("/", userController.addUser);
router.get("/", (req, res) => {
    res.send("hello")
});

module.exports = router ;