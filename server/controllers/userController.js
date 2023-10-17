const User = require("../models/User");
const bcrypt = require("bcrypt");
const { adminOrManager, adminOnly } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");


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
      res.status(200).json({ token: token, status: 200 });
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