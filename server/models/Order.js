const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const customerModel = require("./User.js");
const productModel = require("./Product.js");

const orderSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: customerModel, 
  },
  order_items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: productModel,
  }],
  orderDate: {
    type: Date,
  },
  cart_total_price: {
    type: Number,
  },
  status: {
    type: String,
    default: "open"
  },
});

orderSchema.plugin(mongoosePaginate);

const Order = mongoose.model("order", orderSchema);

module.exports = Order;
