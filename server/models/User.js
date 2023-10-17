const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
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
    default: "manager"
  }
});
userSchema.methods.generateAuthToken = async function () {
    try {
      let token = jwt.sign({ id: this._id, email: this.email }, "abracadabra", {
        expiresIn: "40h",
      });
  
      return token;
    } catch (error) {
      console.log("error while generating token");
    }
  };
  
  const User = mongoose.model("users", userSchema);
  
  module.exports = User;