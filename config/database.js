const mongoose = require("mongoose");
require('dotenv').config()

const DB_URI = process.env.DB_URI;
module.exports = async function mongoDBConnection() {
  await mongoose
    .connect(DB_URI)
    .then(() => console.log("connected to db"));
  return mongoose;
};
