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
const generateAuthToken = async (id, email) => {
  try {
    let token = jwt.sign({ id: id, email: email }, "ef6576HJHB6T76VGgvytf8764jh6579uvç_98977687bvuvt", {
      expiresIn: "40h",
    });

    return token;
  } catch (error) {
    console.log("error while generating token");
  }
};

const User = mongoose.model("User", userSchema);

module.exports = {
    generateAuthToken,
    User
}