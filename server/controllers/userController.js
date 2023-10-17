const User = require("../models/User");
const bcrypt = require("bcrypt");

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

// Login Controller
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
  module.exports = {
    addUser,
    loginUser
  };