const jwt = require("jsonwebtoken");
const secretKey = "abracadabra";

function verifyToken(req, res, next) {
  let token = req.headers["x-access-token"] || req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ auth: false, message: "No token provided." });
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ auth: false, message: "Failed to authenticate token." });
    }

    // If authentication is successful, store the user ID in the request object
    req.userId = decoded.id;

    // Continue with the next middleware or route handler
    next();
  });
}

module.exports = verifyToken;