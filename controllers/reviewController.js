const Customer = require("../models/Customer");
const Product = require("../models/Product"); // Import your product model
const Review = require("../models/Review");
const mongoose = require("mongoose");

const submitProductReview = async (req, res) => {
  try {
    let { productId, customerId, text, rating } = req.body;

    // Validate if the product and customer exist
    const product = await Product.findById(productId);
    const customer = await Customer.findById(customerId);
    if (!product || !customer) {
      return res.status(404).json({ message: "Product or customer not found" });
    }
    const reviewerName = `${customer.firstName} ${customer.lastName}`;

    const newReview = new Review({
      reviewerName,
      productId,
      customerId,
      text,
      rating,
      timestamp: new Date(),
    });

    await newReview.save();
    return res.status(201).json({ message: "Review created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAllReviews = async (req, res) => {
  const { page = 1, sort = "ASC" } = req.query;
  const limit = 10;
  const sortOption = sort === "DESC" ? "-_id" : "_id";

  // Extract product ID from URL parameters
  const productId = req.params.productId;
  // Assuming the parameter name is 'productId' in the URL

  try {
    const options = {
      page: page,
      limit: limit,
      sort: sortOption,
    };

    // Modify the filter to include the product ID
    const result = await Review.paginate({ productId: productId }, options);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: "Error retrieving data from review" });
  }
};

//delete review
const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;

    const check = mongoose.Types.ObjectId.isValid(reviewId);
    if (check) {
      const existed = await Review.findByIdAndDelete(reviewId);
      if (existed) {
        return res.send("review deleted successfully");
      } else {
        return res.send("not found");
      }
    } else {
      return res.send("not an objectID");
    }
  } catch {
    console.log(err.message);
  }
};

module.exports = {
  submitProductReview,
  getAllReviews,
  deleteReview,
};
