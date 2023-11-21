const mongoose = require("mongoose");
const revenueSchema = new mongoose.Schema({
  total: {
    required: true,
    type: Number,
  }
});


const Revenue = mongoose.model("revenue", revenueSchema);

module.exports = Revenue;
