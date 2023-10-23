const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const ProductModel = require("./Product");
const CustomerModel = require("./Customer");


const reviewSchema = new mongoose.Schema({


        reviewerName: {
          type: String,
          required: true,
        },
        productId : {
            type: mongoose.Schema.Types.ObjectId,
            ref: ProductModel,
        },
        customerId : {
            type: mongoose.Schema.Types.ObjectId,
            ref: CustomerModel,
        },
        text: {
          type: String,
          required: true,
        },

        rating: {
          type: Number,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      });
      
      // Rest of your schema and methods...
      

reviewSchema.plugin(mongoosePaginate);

const Review = mongoose.model("review", reviewSchema);

module.exports = Review;
