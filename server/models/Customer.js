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
  },
  address: {
    type: String,
  },
  phone: {
    type: Number,
  },
  role : {
    type: String,
    default:'customer'
  }
});

customerSchema.plugin(mongoosePaginate);

  const Customer = mongoose.model("customers", customerSchema);
  
  module.exports = Customer;