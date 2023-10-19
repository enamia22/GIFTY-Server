const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const mongoosePaginate = require('mongoose-paginate-v2');

const customerSchema = new mongoose.Schema({
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

  active: {
    type: Boolean,
    default: true
  },
  lastUpdate: {
    type: String,
  },
  confirmed: {
    type: Boolean,
    default: 'false'
  },
  confirmationToken : {
    type: String,
  }
});

customerSchema.plugin(mongoosePaginate);

customerSchema.methods.generateAuthToken = async function () {
    try {
      let token = jwt.sign({ id: this._id, email: this.email}, "abracadabra", {
        expiresIn: "40h",
      });
  
      return token;
    } catch (error) {
      console.log("error while generating token");
    }
  };

  
  const Customer = mongoose.model("customers", customerSchema);
  
  module.exports = Customer;