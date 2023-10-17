const jwt = require("jsonwebtoken");
const secretKey = "abracadabra";

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

module.exports = verifyToken;
