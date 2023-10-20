const express = require("express");
const userController = require("../controllers/userController");
const RefreshToken = require("../models/RefreshToken");
// const {generateAccessToken, verifyAccessToken} = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/", userController.addUser);
router.post("/login", userController.loginUser);
router.get("/", userController.getAllUsers);
router.get("/search", userController.findUserByQuery);
router.get("/:id", userController.findUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
// Define your route for refreshing access tokens
// router.post('/refresh-token', async (req, res) => {
//     const { refreshToken } = req.body;
  
//     // Verify the provided refresh token
//     const refreshTokenDocument = await RefreshToken.findOne({ value: refreshToken });
  
//     if (!refreshTokenDocument) {
//       return res.status(401).json({ message: 'Invalid refresh token.' });
//     }
  
//     // Check if the refresh token has been revoked
//     if (refreshTokenDocument.revokedBy) {
//       return res.status(401).json({ message: 'Refresh token has been revoked.' });
//     }
  
//     // Check if the refresh token has expired
//     if (refreshTokenDocument.expires < new Date()) {
//       return res.status(401).json({ message: 'Refresh token has expired.' });
//     }
//   const {userId, role, email} = refreshTokenDocument;
//     // If the refresh token is valid, generate a new access token
//     const newAccessToken = generateAccessToken(userId, email, role);
  
//     res.json({ accessToken: newAccessToken, message: 'Access token refreshed successfully.' });
//   });
  
module.exports = router ;