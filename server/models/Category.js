const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const userModel = require("./User.js");
const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: userModel,
  },
  active: {
    type: Boolean,
    default: false,
  },
  lastUpdate: {
    type: Date,
  },
  creationDate: {
    type: Date,
  },
});

categorySchema.plugin(mongoosePaginate);

const Category = mongoose.model("category", categorySchema);

module.exports = Category;
