const RefreshToken = require("../models/RefreshToken");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();

const secretKey = process.env.SECRET;

const generateAccessToken = (userId, email, username, role) => {
  const accessToken = jwt.sign(
    { userId: userId, email: email, username: username, role: role },
    secretKey,
    {
      expiresIn: "1h",
    }
  );
  return accessToken;
};

//verifyAccessTokenValidation
const verifyAccessToken = (accessToken) => {
  const options = {
    ignoreExpiration: true,
  };
  try {
    const decoded = jwt.verify(accessToken, secretKey, options);
    return decoded;
  } catch (err) {
    return null;
  }
};

// Generate a random refresh token
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString("hex");
};

// Function to refresh the access token
const refreshAccessToken = async (refreshToken) => {
  // Verify the provided refresh token
  const refreshTokenDocument = await RefreshToken.findOne({
    value: refreshToken,
  });

  if (!refreshTokenDocument) {
    throw new Error("Invalid refresh token.");
  }

  // Check if the refresh token has been revoked
  if (refreshTokenDocument.revokedBy) {
    throw new Error("Refresh token has been revoked.");
  }

  // Check if the refresh token has expired
  if (refreshTokenDocument.expires < new Date()) {
    throw new Error("Refresh token has expired.");
  }
  const { userId, role, email, username } = refreshTokenDocument;
  // If the refresh token is valid, generate a new access token
  return generateAccessToken(userId, email, username, role);
};

// Function to verify if the access token has expired
const isAccessTokenExpired = (accessToken) => {
  try {
    const decoded = verifyAccessToken(accessToken);
    const currentTime = Date.now() / 1000; // Convert to seconds
    if (decoded.exp < currentTime || decoded.exp - currentTime <= 300) {
      return { ...decoded, expired: true };
    } else {
      return { ...decoded, expired: false };
    }
  } catch (error) {
    return true;
  }
};

// Implement functionality to revoke a refresh token if needed. For example, when a user logs out from a specific device.
const revokeRefreshToken = async (tokenId, revokedByIp) => {
  const refreshToken = await RefreshToken.findOne({ value: tokenId });
  if (refreshToken) {
    refreshToken.revokedByIp = revokedByIp;
    refreshToken.revokedBy = new Date();
    await refreshToken.save();
  }
};

const createRefreshToken = async (
  userId,
  email,
  username,
  role,
  createdByIp
) => {
  const existRefreshToken = await RefreshToken.findOne({ email });
  if (existRefreshToken) {
    return updateRefreshToken(
      existRefreshToken._id,
      userId,
      email,
      username,
      role,
      createdByIp
    );
  } else {
    const value = generateRefreshToken();
    const expires = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000); // Set expiration to 7 days
    const refreshToken = new RefreshToken({
      value,
      userId,
      email,
      role,
      expires,
      createdByIp,
      createdAt: new Date(),
    });
    await refreshToken.save();
    return refreshToken;
  }
};

const updateRefreshToken = async (
  refreshTokenId,
  userId,
  email,
  username,
  role,
  createdByIp
) => {
  // const value = generateRefreshToken();
  const expires = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000); // Set expiration to 7 days
  const updatedRefreshToken = {
    userId,
    email,
    username,
    role,
    expires,
    createdByIp,
    createdAt: new Date(),
  };
  const refreshToken = await RefreshToken.findByIdAndUpdate(
    refreshTokenId,
    updatedRefreshToken,
    {
      new: true,
    }
  );
  return refreshToken;
};

const isTokenExpired = async (req, res, next) => {
  const token = req.cookies.token;
  const refreshToken = req.cookies.refreshToken;
  const decodedWithValue = isAccessTokenExpired(token);
  req.validateToken = decodedWithValue;

  // Check if access token is expired
  if (decodedWithValue.expired) {
    try {
      // Use the refresh token to get a new access token
      const newAccessToken = await refreshAccessToken(refreshToken);
      res.cookie("token", newAccessToken, { httpOnly: true });

      // Update the access token in your Postman environment or application's state
      // Make your request with the new access token

      // Continue to the next middleware or route handler
      return next();
    } catch (error) {
      // Handle errors (e.g., invalid refresh token, expired refresh token)
      console.error("Token refresh failed:", error.message);

      // Respond to the request immediately (e.g., with a 401 status)
      return res.status(401).json({ message: "Unauthorized" });
    }
  }

  // If the token is not expired, continue to the next middleware or route handler
  next();
};

module.exports = {
  createRefreshToken,
  isAccessTokenExpired,
  revokeRefreshToken,
  refreshAccessToken,
  isTokenExpired,
  generateAccessToken,
  updateRefreshToken,
};
