const jwt = require("jsonwebtoken");
const config = require('../config/env')
const User = require("../models/User");

const secretKey = config.SECRET;

function verifyToken(req, res) {
  const token = req.headers["authorization"];
  let user;
  if (!token) {
    return res.status(403).json({ auth: false, message: "No token provided." });
  }

  jwt.verify(token, secretKey, (err, decoded) => {

    if (err) {
      return res
        .status(401)
        .json({ auth: false, message: "Failed to authenticate token." });
    }
    user = decoded  
  });
  return user
}

const adminOrManager = async (req, res) =>{

  const decodedUser = await verifyToken(req, res);
  if (!decodedUser) {
    return res.status(403).json({ message: "Unauthorized user" });
  }
  const user = await User.findById(decodedUser.id);
  if (user.role !== "admin" && user.role !== "manager") {
    return res.status(403).json({ message: "Unauthorized role" });
  }
 
}

const adminOnly = async (req, res) =>{

  const decodedUser = await verifyToken(req, res);
  if (!decodedUser) {
    return res.status(403).json({ message: "Unauthorized user" });
  }
  const user = await User.findById(decodedUser.id);
  if (user.role !== "admin") {
    return res.status(403).json({ message: "Unauthorized role" });
  }
 
}
module.exports = {
  adminOrManager,
  adminOnly
};
