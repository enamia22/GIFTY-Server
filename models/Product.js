const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const categoryModel = require("./Category.js");

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    unique: true,
  },
  productName: {
    type: String,
    required: true,
    unique: true,
  },
  productImage: {
    type: String,
    required: true,
    default: "uploads/placeholder.jpg",
  },
  shortDescription: {
    type: String,
    required: true,
  },
  longDescription: {
    type: String,
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: categoryModel,
  },
  active: {
    type: Boolean,
    default: false,
  },
  price: {
    type: Number,
    required: true,
  },
  discountPrice: {
    type: Number,
    required: true,
  },
  options: {
    type: String,
  },
  pack: {
    type: Boolean,
    default: false,
  },
  lastUpdate: {
    type: Date, // Set the default value to the current timestamp
  },
  creationDate: {
    type: Date, // Set the default value to the current timestamp
  },
});

productSchema.plugin(mongoosePaginate);

const Product = mongoose.model("products", productSchema);

module.exports = Product;
