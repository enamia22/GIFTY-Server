const User = require("../models/User");
const bcrypt = require("bcrypt");
const { adminOnly, adminOrManager } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");
const {
  createRefreshToken,
  generateAccessToken,
} = require("../controllers/refreshTokenController");
const { trackActivity } = require("../middleware/activityMiddleware");

//Add User
const addUser = async (req, res) => {
  try {
    let authorized = await adminOnly(req.validateToken);
    if (!authorized) {
      return res.status(403).json({ message: "Not authorized" });
    }
    let { firstName, lastName, username, email, password, role, active } =
      req.body;

    if (!firstName || !lastName || !email || !password || !role || !username) {
      return res.status(403).send({ message: "missing field" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
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

    // const token = await newUser.generateAuthToken();
    const createdUser = await newUser.save();

    if (createdUser) {
      const addActivity = await trackActivity(
        req.validateToken.userId,
        "add user",
        createdUser._id,
        username
      );
      if (!addActivity) {
        console.log("activity not added: ");
      }
      return res.status(200).json({ message: "User created successfully" });
    } else {
      return res.status(403).json({ message: "Failed to create User" });
    }
  } catch (error) {
    console.log("Error in registration: " + error);
    return res.status(500).send(error.message);
  }
};

//Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Invalid Credentials" });

    const status = user.active;
    if (!status) return res.status(404).json({ message: "User not active" });

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Invalid Credentials" });
    } else {
      const currentDate = new Date();
      await User.findByIdAndUpdate(
        user._id,
        { lastLogin: currentDate },
        {
          new: false,
        }
      );

      const token = generateAccessToken(
        user._id,
        user.email,
        user.username,
        user.role
      );
      const refreshToken = await createRefreshToken(
        user._id,
        user.email,
        user.username,
        user.role,
        "MustaphaIpAddress"
      );
      res.cookie("token", token, { httpOnly: true });
      res.cookie("refreshToken", refreshToken.value, { httpOnly: true });
      return res
        .status(200)
        .json({ token: token, refreshToken: refreshToken.value, status: 200 });
    }
  } catch (error) {
    console.log("Error with login: " + error);
    return res.status(500).json({ error: error.message });
  }
};

//get users
const getAllUsers = async (req, res) => {
  try {
    let authorized = await adminOnly(req.validateToken);
    if (!authorized) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { page = 1, sort = "ASC" } = req.query;
    const limit = 4;
    const sortOption = sort === "DESC" ? "-_id" : "_id";
    const fieldsToRetrieve = "firstName lastName username email role active";

    try {
      const options = {
        page: page,
        limit: limit,
        sort: sortOption,
        select: fieldsToRetrieve,
      };

      const result = await User.paginate({ role: { $ne: "admin" } }, options);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: "Error retrieving data from product" });
    }
  } catch (error) {
    console.log("Error retrieving data: " + error);
    return res.status(500).json({ error: error.message });
  }
};

const findUserById = async (req, res) => {
  try {
    let authorized = await adminOnly(req.validateToken);
    if (!authorized) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const userId = req.params.id;
    const check = mongoose.Types.ObjectId.isValid(userId);
    if (check) {
      const user = await User.findById(userId).select("-password");
      if (user) {
        return res.json(user);
      } else {
        return res.send("not found");
      }
    } else {
      return res.send("not an objectID");
    }
  } catch (error) {
    console.log("Error while looking for the user by id: " + error);
    return res.status(500).json({ error: error.message });
  }
};

const findUserByQuery = async (req, res) => {
  try {
    let authorized = adminOnly(req.validateToken);
    if (!authorized) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const query = req.query.query;

    const results = await User.find({
      username: { $regex: `^${query}`, $options: "i" },
    });
    return res.json(results);
  } catch (error) {
    console.log("Error with query: " + error);
    return res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    let authorized = await adminOnly(req.validateToken);
    if (!authorized) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const userId = req.params.id;
    const userUpdated = req.body;
    if (userUpdated.password) {
      const salt = await bcrypt.genSalt(10);
      userUpdated.password = await bcrypt.hash(userUpdated.password, salt);
    }

    userUpdated.lastUpdate = new Date();

    const check = mongoose.Types.ObjectId.isValid(userId);
    if (check) {
      const user = await User.findById(userId).select("-password");
      if (user) {
        const existingUser = await User.findOne({
          $and: [
            {
              $or: [
                { email: userUpdated.email },
                { username: userUpdated.username },
              ],
            },
            { _id: { $ne: userId } }, // search in all users except the current one
          ],
        });

        if (existingUser)
          return res.status(400).json({ error: "User already exits" });

        const user = await User.findByIdAndUpdate(userId, userUpdated, {
          new: true,
        }).select("-password");;

        const addActivity = await trackActivity(
          req.validateToken.userId,
          "update user",
          userId,
          user.username
        );
        if (!addActivity) {
          console.log("activity not added: ");
        }

        return res.json({ user });
      } else {
        return res.send("not found");
      }
    } else {
      return res.send("not an objectID");
    }
  } catch (error) {
    console.log("Error while updating the user: " + error);
    return res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    let authorized = await adminOnly(req.validateToken);
    if (!authorized) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const userId = req.params.id;

    const check = mongoose.Types.ObjectId.isValid(userId);
    if (check) {
      const user = await User.findByIdAndDelete(userId);
      if (user) {
        const addActivity = await trackActivity(
          req.validateToken.userId,
          "delete user",
          userId,
          user.username
        );
        if (!addActivity) {
          console.log("activity not added: ");
        }
        return res.send("user deleted successfully");
      } else {
        return res.send("not found");
      }
    } else {
      return res.send("not an objectID");
    }
  } catch (error) {
    console.log("Error while deleting the user: " + error);
    return res.status(500).json({ error: error.message });
  }
};
const checkAuth = async (req, res) => {
  try {
    if (!req.validateToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized from check-auth API request" });
    }

    let authorized = await adminOrManager(req.validateToken);

    if (!authorized) {
      return res
        .status(401)
        .json({ message: "Unauthorized from check-auth API request" });
    }

    return res.status(200).json({ user: req.validateToken });
  } catch (error) {
    console.log("Error while checking authorization: " + error);
    return res
      .status(500)
      .json({ error: "An error occurred while checking authorization" });
  }
};

const logout = async (req, res) => {
  // Set token to none and expire after 5 seconds
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.cookie("refreshToken", "none", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  return res
    .status(200)
    .json({ success: true, message: "User logged out successfully" });
};

const userCount = async (req, res) => {

  try {
    let authorized = await adminOnly(req.validateToken);
    if (!authorized) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const userCount = await User.countDocuments();

    res.json({ count: userCount });
  } catch (error) {
    console.error('Error while getting User count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  addUser,
  loginUser,
  getAllUsers,
  findUserById,
  findUserByQuery,
  updateUser,
  deleteUser,
  checkAuth,
  logout,
  userCount
};
