const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
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
