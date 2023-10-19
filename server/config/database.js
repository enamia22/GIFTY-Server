
const mongoose = require("mongoose");

module.exports = async function mongoDBConnection() {
  await mongoose
    .connect("mongodb+srv://hajar:mB0PLuu1MWBFswwB@cluster0.nb8jicc.mongodb.net/GIFTY")
    .then(() => console.log("connected to db"));
  return mongoose;
};
