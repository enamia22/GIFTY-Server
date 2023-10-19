
const mongoose = require("mongoose");
const config = require('./env')
module.exports = async function mongoDBConnection() {
  await mongoose
    .connect(config.DB_URI)
    .then(() => console.log("connected to db"));
  return mongoose;
};