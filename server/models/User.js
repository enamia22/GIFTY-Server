const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const mongoosePaginate = require('mongoose-paginate-v2');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true
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
  },
  active: {
    type: Boolean,
    default: true
  },
  lastUpdate: {
    type: String,
  }
});

userSchema.plugin(mongoosePaginate);

userSchema.methods.generateAuthToken = async function () {
    try {
      let token = jwt.sign({ id: this._id, email: this.email, role: this.role }, "abracadabra", {
        expiresIn: "40h",
      });
  
      return token;
    } catch (error) {
      console.log("error while generating token");
    }
  };
  
  const User = mongoose.model("users", userSchema);
  
  module.exports = User;