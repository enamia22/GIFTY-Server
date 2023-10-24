const express = require("express");
const reviewController = require("../controllers/reviewController");
const { isTokenExpired } = require("../controllers/refreshTokenController");


const router = express.Router();


// Express Route for submitting a review for a specific product
router.post("/", isTokenExpired, reviewController.submitProductReview);
router.get("/:productId", isTokenExpired, reviewController.getAllReviews)




module.exports = router ;

