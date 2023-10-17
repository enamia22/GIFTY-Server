const User = require("../models/User");
const bcrypt = require("bcrypt");

const addUser = async (req, res) => {
    try {
      let { firstName, lastName, email, password, role } = req.body;
      if (!firstName || !lastName || !email || !password || role ) {
        res.status(200).send({ message: "missing field" });
      }
 
      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json({ error: "User already exits" });
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
      const newUser = new User({ firstName, lastName, email, password, role });
      const token = await newUser.generateAuthToken();
      await newUser.save();
      res.json({ message: "success", token: token });

    } catch (error) {
      console.log("Error in registration: " + error);
      res.status(500).send(error);
    }
  };

  module.exports = {
    addUser
  };