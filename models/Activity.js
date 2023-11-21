const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const userModel = require("./User.js");

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: userModel, 
    required: true
  },
  activities: {
    type: Array,
    default: [],
  }
});

activitySchema.plugin(mongoosePaginate);

const Activity = mongoose.model("activities", activitySchema);

module.exports = Activity;
