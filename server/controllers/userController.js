const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const bcrypt = require("bcrypt");
const { adminOrManager, adminOnly } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");
const crypto = require("crypto");
const {generateAccessToken, verifyAccessToken} = require("../middleware/authMiddleware");

// ==================== refresh token test =====================

const jwt = require('jsonwebtoken');


// Function to refresh the access token
const refreshAccessToken = async (refreshToken) => {
  // Verify the provided refresh token
  const refreshTokenDocument = await RefreshToken.findOne({ value: refreshToken });

  if (!refreshTokenDocument) {
    throw new Error('Invalid refresh token.');
  }

  // Check if the refresh token has been revoked
  if (refreshTokenDocument.revokedBy) {
    throw new Error('Refresh token has been revoked.');
  }

  // Check if the refresh token has expired
  if (refreshTokenDocument.expires < new Date()) {
    throw new Error('Refresh token has expired.');
  }
  const {userId, role, email} = refreshTokenDocument;
  // If the refresh token is valid, generate a new access token
  return generateAccessToken(userId, email, role);
};


// Function to verify if the access token has expired
const isAccessTokenExpired = (accessToken) => {
  try {
    const decoded = jwt.decode(accessToken);
    const currentTime = Date.now() / 1000; // Convert to seconds
    if(decoded.exp < currentTime || currentTime-5 <= decoded.exp <= currentTime){
      return true;
    }else{
      return false;
    }
  } catch (error) {
    return true; // Token decoding failed
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


// Generate a random refresh token
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

// Create and save a refresh token to the database
const createRefreshToken = async (userId, email, role, createdByIp) => {
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
};

// ==================== refresh token test =====================
//Add User
const addUser = async (req, res) => {
    try {
      let { 
        firstName, 
        lastName, 
        username, 
        email, 
        password, 
        role, 
        active } = req.body;

      if (!firstName || !lastName || !email || !password || !role || !username ) {
        res.status(200).send({ message: "missing field" });
      }
 
      const existingUser = await User.findOne({ email });
      if (existingUser){
        return res.status(400).json({ error: "User already exits" });
      }
      const currentDate = new Date();

      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      const newUser = new User({
        firstName,
        lastName,
        username,
        email,
        password,
        role,
        active,
        creationDate: currentDate, // Set the creationDate field to the current timestamp
      });

      const token = await newUser.generateAuthToken();
      await newUser.save();

      res.json({ message: "success", token: token });

    } catch (error) {
      console.log("Error in registration: " + error);
      res.status(500).send(error.message);
    }
  };

//Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const valid = await User.findOne({ email });
    if (!valid) res.status(404).json({ message: "User doesn't exist" });
    const status = valid.active;
    if(!status) res.status(404).json({ message: "User not active" });
   
    const validPassword = await bcrypt.compare(password, valid.password);

    if (!validPassword) {
      res.status(400).json({ message: "Invalid Credentials" });
    } else {
      const currentDate = new Date();
      await User.findByIdAndUpdate(valid._id, { lastLogin: currentDate}, {
        new: false,
      });

      const token = await valid.generateAuthToken();
      const refreshToken = await createRefreshToken(valid._id, valid.email, valid.role, 'MustaphaIpAddress');
      res.status(200).json({ token: token, refreshToken: refreshToken.value, status: 200 });
    }
  } catch (error) {
    console.log("Error with login: " + error);
    res.status(500).json({ error: error.message });
  }
};

//get users 
const getAllUsers = async (req, res) => {
  try {
    adminOrManager(req, res);
    
    const { page = 1, sort = 'ASC' } = req.query;
    const limit = 10;
    const sortOption = sort === 'DESC' ? '-_id' : '_id';

    try {
      const options = {
      page: page,
      limit: limit,
      sort: sortOption,
      };

      const result = await User.paginate({}, options);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: 'Error retrieving data' });
    }
  } catch (error) {
    console.log("Error retrieving data: " + error);
    res.status(500).json({ error: error.message });
  }
}

const findUserById = async (req, res) => {
  
  const token = req.headers["authorization"];
  const refreshToken = req.headers["refreshtoken"];
// Check if access token is expired
if (isAccessTokenExpired(token)) {
  try {
    // Use the refresh token to get a new access token
    const newAccessToken = await refreshAccessToken(refreshToken);
    console.log('the access token has expired or is about to expire soon and this is the new access token: ' + newAccessToken)
    // Update the access token in your Postman environment or application's state
    // Make your request with the new access token
  } catch (error) {
    // Handle errors (e.g., invalid refresh token, expired refresh token)
    console.error('Token refresh failed:', error.message);
    // You may need to redirect to a login page or perform other actions
  }
}

  try {
    adminOrManager(req, res);

    const userId = req.params.id;
    const check = mongoose.Types.ObjectId.isValid(userId);
    if (check) {
      const user = await User.findById(userId).select("-password");
      if (user) {
        res.json(user);
      } else {
        res.send("not found");
      }
    } else {
      res.send("not an objectID");
    }
  } catch (error) {
    console.log("Error while looking for the user by id: " + error);
    res.status(500).json({ error: error.message });
  }
};

const findUserByQuery = async (req, res) => {
  try {
    adminOrManager(req, res);

    const query = req.query.query; 

    const results = await User.find({ username: { $regex: query, $options: 'i' } });

    res.json(results);
  } catch (error) {
    console.log("Error with query: " + error);
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    adminOnly(req, res);

    const userId = req.params.id;
    const userUpdated = req.body;

    userUpdated.lastUpdate = new Date();

    const check = mongoose.Types.ObjectId.isValid(userId);
    if (check) {
      const user = await User.findById(userId).select("-password");
      if (user) {
        const existingUser = await User.findOne({
          $and: [
            { $or: [{ email: userUpdated.email }, { username: userUpdated.username }] },
            { _id: { $ne: userId } } // search in all users except the current one
          ]
        });
        
        if (existingUser)
        return res.status(400).json({ error: "User already exits" });
        const user = await User.findByIdAndUpdate(userId, userUpdated, {
          new: true,
        });
        res.json({"user updated successfuly": user});
      } else {
        res.send("not found");
      }
    } else {
      res.send("not an objectID");
    }
  } catch (error){
    console.log("Error while updating the user: " + error);
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    adminOnly(req, res);
    
    const userId = req.params.id;

    const check = mongoose.Types.ObjectId.isValid(userId);
    if (check) {
      const user = await User.findByIdAndDelete(userId);
      if (user) {
        res.send("user deleted successfully");
      } else {
        res.send("not found");
      }
    } else {
      res.send("not an objectID");
    }
  } catch (error) {
    console.log("Error while deleting the user: " + error);
    res.status(500).json({ error: error.message });
  }
}; 

  module.exports = {
    addUser,
    loginUser,
    getAllUsers,
    findUserById,
    findUserByQuery,
    updateUser,
    deleteUser
  };