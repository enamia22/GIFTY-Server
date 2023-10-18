const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const userModel = require('./User.js');
const categorySchema = new mongoose.Schema({
  subcategoryName: {
    type: String,
    required: true,
    unique: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: userModel
  },
  active: {
    type: Boolean,
    default: false
  },
  lastUpdate: {
    type: Date // Set the default value to the current timestamp
  },
  creationDate: {
    type: Date, // Set the default value to the current timestamp
  }
});

categorySchema.plugin(mongoosePaginate);

  
const Category = mongoose.model("subcategories", categorySchema);

module.exports = Category;