const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "manager",
  },
  active: {
    type: Boolean,
    default: true,
  },
  lastUpdate: {
    type: Date,
  },
  address: {
    type: String,
  },
  phone: {
    type: Number,
  },
  creationDate: {
    type: Date,
  },
  lastLogin: {
    type: Date,
  },
});

userSchema.plugin(mongoosePaginate);

const User = mongoose.model("users", userSchema);

module.exports = User;
