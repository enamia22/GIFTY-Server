const User = require("../models/User");
const bcrypt = require("bcrypt");
const verifyToken = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

//Add User
const addUser = async (req, res) => {
    try {
      let { firstName, lastName, username, email, password, role, active } = req.body;
      if (!firstName || !lastName || !email || !password || !role || !username ) {
        res.status(200).send({ message: "missing field" });
      }
 
      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json({ error: "User already exits" });
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
      const newUser = new User({ firstName, lastName, username, email, password, role, active });
      const token = await newUser.generateAuthToken();
      await newUser.save();
      res.json({ message: "success", token: token });

    } catch (error) {
      console.log("Error in registration: " + error);
      res.status(500).send(error);
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
      const token = await valid.generateAuthToken();
      res.status(200).json({ token: token, status: 200 });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

//get users 
const getAllUsers = async (req, res) => {
  try {
    const decodedUser = await verifyToken(req);
    if (!decodedUser) {
      return res.status(401).json({ message: "Unauthorized user" });
    }
    const user = await User.findById(decodedUser.id);
    if (user.role !== "admin" && user.role !== "manager") {
      return res.status(401).json({ message: "Unauthorized role" });
    }
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
    res.status(500).json({ error: error.message });
  }
}

const findUserById = async (req, res) => {
  try {
    const decodedUser = await verifyToken(req);
    if (!decodedUser) {
      return res.status(401).json({ message: "Unauthorized user" });
    }
    const user = await User.findById(decodedUser.id);
    if (user.role !== "admin" && user.role !== "manager") {
      return res.status(401).json({ message: "Unauthorized role" });
    }
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
  } catch (err) {
    console.log(err.message);
  }
};
//search for a user By Id
const findUserByQuery = async (req, res) => {
  try {
    const decodedUser = await verifyToken(req);
    if (!decodedUser) {
      return res.status(401).json({ message: "Unauthorized user" });
    }
    const user = await User.findById(decodedUser.id);
    if (user.role !== "admin" && user.role !== "manager") {
      return res.status(401).json({ message: "Unauthorized role" });
    }

    const query = req.query.query; 

    const results = await User.find({ username: { $regex: query, $options: 'i' } });

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
};

const updateUser = async (req, res) => {
  try {
    const decodedUser = await verifyToken(req);
    if (!decodedUser) {
      return res.status(401).json({ message: "Unauthorized user" });
    }
    const user = await User.findById(decodedUser.id);
    if (user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized role" });
    }
    const userId = req.params.id;
    const userUpdated = req.body;
    const currentDate = new Date(); 

    const localDateTimeString = currentDate.toLocaleString();
    userUpdated.lastUpdate = localDateTimeString;

    const check = mongoose.Types.ObjectId.isValid(userId);
    if (check) {
      const user = await User.findById(userId).select("-password");
      if (user) {
        const existingUser = await User.findOne({
          $or: [
            { email: userUpdated.email },
            { username: userUpdated.username }
          ]
        });
        if (existingUser)
        return res.status(400).json({ error: "User already exits" });
        const user = await User.findByIdAndUpdate(userId, userUpdated, {
          new: true,
        });
        res.json(user);
      } else {
        res.send("not found");
      }
    } else {
      res.send("not an objectID");
    }
  } catch {
    console.log(err.message);
  }
};

const deleteUser = async (req, res) => {
  try {
    const decodedUser = await verifyToken(req);
    if (!decodedUser) {
      return res.status(401).json({ message: "Unauthorized user" });
    }
    const user = await User.findById(decodedUser.id);
    if (user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized role" });
    }

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
  } catch {
    console.log(err.message);
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