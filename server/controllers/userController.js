const User = require("../models/User");
const {generateAuthToken} = require("../models/User");
const bcrypt = require("bcrypt");

const addUser = async (req, res) => {
    try {
      let { firstName, lastName, email, password, role, id } = req.body;
      if (!firstName || !lastName || !email || !password || role || !id) {
        res.status(200).send({ message: "missing field" });
      }
 
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
      const token = await generateAuthToken(id, email);

      res.json({ message: "success", token: token });
    } catch (error) {
      console.log("Error in registration: " + error);
      res.status(500).send(error);
    }
  };

  module.exports = {
    addUser
  };