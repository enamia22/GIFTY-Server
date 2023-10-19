const jwt = require("jsonwebtoken");
const secretKey = "abracadabra";
const User = require("../models/User")

function verifyToken(req, res) {
  let token = req.headers["authorization"];
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
    req.userId = decoded.id;
    req.role = decoded.role;
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
  adminOnly,
  verifyToken
};

