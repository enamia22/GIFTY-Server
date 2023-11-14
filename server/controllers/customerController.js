const Customer = require("../models/Customer");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const crypto = require("crypto");
const { adminOrManager, adminOnly } = require("../middleware/authMiddleware");
const {
  createRefreshToken,
  generateAccessToken,
} = require("../controllers/refreshTokenController");
const Product = require("../models/Product");
const Order = require("../models/Order");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "mustaphaettanti@gmail.com", // Your Gmail email address
    pass: "cupq xvyy tglk guqd", // Your Gmail password or App Password if 2FA is enabled
  },
});

// async..await is not allowed in global scope, must use a wrapper
async function main(to, username, confirmationLink) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Hi, its me  👻" Mustapha', // sender address
    to: to, // list of receivers
    subject: "Hello ✔", // Subject line
    text: `Hello  ${username}`, // plain text body
    html: `<body class="" style="background-color: #f6f6f6; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
    <span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">Hello, ${username}</span>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f6f6; width: 100%;" width="100%" bgcolor="#f6f6f6">
      <tr>
        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
        <td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;" width="580" valign="top">
          <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">

            <!-- START CENTERED WHITE CONTAINER -->
            <table role="presentation" class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border-radius: 3px; width: 100%;" width="100%">

              <!-- START MAIN CONTENT AREA -->
              <tr>
                <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;" valign="top">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                    <tr>
                      <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Hello, ${username},</p>
                        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">You are successfully created an account in <strong>GIFTY</strong></p>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 100%;" width="100%">
                          <tbody>
                            <tr>
                              <td align="left" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;" valign="top">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">
                                  <tbody>
                                    <tr>
                                      <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; border-radius: 5px; text-align: center; background-color: #3498db;" valign="top" align="center" bgcolor="#3498db"> <a href= ${confirmationLink} target="_blank" style="border: solid 1px #3498db; border-radius: 5px; box-sizing: border-box; cursor: pointer; display: inline-block; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-decoration: none; text-transform: capitalize; background-color: #3498db; border-color: #3498db; color: #ffffff;">Confirmation link</a> </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Enjoy Shopping</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            <!-- END MAIN CONTENT AREA -->
            </table>
            <!-- END CENTERED WHITE CONTAINER -->

            <!-- START FOOTER -->
            <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" width="100%">
                <tr>
                  <td class="content-block" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #999999; font-size: 12px; text-align: center;" valign="top" align="center">
                    <span class="apple-link" style="color: #999999; font-size: 12px; text-align: center;">Casablanca, Morocco</span>
                    <br> Don't like these emails? <a href="#" style="text-decoration: underline; color: #999999; font-size: 12px; text-align: center;">Unsubscribe</a>.
                  </td>
                </tr>
              </table>
            </div>
            <!-- END FOOTER -->

          </div>
        </td>
        <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
      </tr>
    </table>
  </body>`, // html body
  });

  console.log("Message sent: %s", info.messageId);
}

//Add Customer
const addCustomer = async (req, res) => {
  try {
    let { firstName, lastName, email, password, active ,address, phone } = req.body;
    if (!firstName || !lastName || !email || !password || !address || !phone) {
      return res.status(200).send({ message: "missing field" });
    }

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer)
      return res.status(400).json({ error: "Customer already exits" });
    const confirmationToken = crypto.randomBytes(20).toString("hex");

    const currentDate = new Date();

    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    const newCustomer = new Customer({
      firstName,
      lastName,
      email,
      address,
      password,
      phone,
      active,
      creationDate: currentDate, 
    });

    newCustomer.confirmationToken = confirmationToken;
    const createdCustomer = await newCustomer.save();
    const token = await generateAccessToken(
      createdCustomer._id,
      createdCustomer.email,
      createdCustomer.role
    );
    const refreshToken = await createRefreshToken(
      createdCustomer._id,
      createdCustomer.email,
      createdCustomer.role,
      "MustaphaIpAddress"
    );
    const username = firstName + " " + lastName;
    // User registration
    // (in a real application, you'd send an actual email)
    const confirmationLink = `http://localhost:3001/v1/customers/validate/${createdCustomer._id}/${confirmationToken}`;
    main(email, username, confirmationLink).catch(console.error);
    res.cookie("token", token);
    res.cookie("refreshToken", refreshToken.value);
    return res.status(201).json({
      message: "Customer created successfully",
      token: token,
      status: 201,
      refreshToken: refreshToken.value,
    });
  } catch (error) {
    console.log("Error in registration: " + error);
    return res.status(500).send(error);
  }
};

//Login
const loginCustomer = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Customer.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Customer doesn't exist" });
    const status = user.active;
    if (!status)
      return res.status(404).json({ message: "Customer not active" });

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res
        .status(401)
        .json({ message: "Invalid Credentials", status: 401 });
    } else {
      const token = await generateAccessToken(user._id, user.email, user.role);
      const refreshToken = await createRefreshToken(
        user._id,
        user.email,
        user.role,
        "MustaphaIpAddress"
      );
      res.cookie("token", token);
      res.cookie("refreshToken", refreshToken.value);
      return res
        .status(200)
        .json({ token: token, refreshToken: refreshToken.value, status: 200 });
    }
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

//get Customers
const getAllCustomers = async (req, res) => {
  try {
    let authorized = await adminOrManager(req.validateToken);
    if (!authorized) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const { page = 1, sort = "ASC" } = req.query;
    const limit = 4;
    const sortOption = sort === "DESC" ? "-_id" : "_id";
    
    try {
      const options = {
        page: page,
        limit: limit,
        sort: sortOption,
        select: "-password -confirmationToken -role -__v",
      };
    
      const result = await Customer.paginate({}, options);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: "Error retrieving data" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//search for a Customer By query
const findCustomerByQuery = async (req, res) => {
  try {
    let authorized = adminOrManager(req.validateToken);
    if (!authorized) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const query = req.query.query;

    const results = await Customer.find(
      {
        firstName: { $regex: `^${query}`, $options: "i" },
      },
      "-password"
    );
    return res.json(results);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
};
//search for a Customer By Id

const findCustomerById = async (req, res) => {
  try {
    let authorized = await adminOrManager(req.validateToken);
    const customerId = req.params.id;
    const customerTokenId = req.validateToken.userId;

    if (authorized || customerId === customerTokenId) {
      const check = mongoose.Types.ObjectId.isValid(customerId);
      if (check) {
        const customer = await Customer.findById(customerId).select(
          "-password"
        );
        if (customer) {
          return res.json(customer);
        } else {
          return res.send("Customer not found");
        }
      } else {
        return res.send("not an objectID");
      }
    } else {
      return res.status(403).json({ message: "Not authorized" });
    }
  } catch (err) {
    console.log(err.message);
  }
};

//update a Customer By Id

const updateCustomer = async (req, res) => {
  try {
    let authorized = await adminOnly(req.validateToken);
    const customerId = req.params.id;
    const customerTokenId = req.validateToken.userId;

    if (!authorized && customerTokenId !== customerId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const customerUpdated = req.body;
    const check = mongoose.Types.ObjectId.isValid(customerId);

    if (check) {
      let query = { _id: customerId };
      const options = {};
      if (authorized) {
        options.select = "-password";
      }

      const existed = await Customer.findOne(query, options);
      if (existed) {
        const existingCustomer = await Customer.findOne({
          $and: [
            {
              $or: [
                { email: customerUpdated.email },
              ],
            },
            { _id: { $ne: customerId } }, // search in all users except the current one
          ],
        });
        if (existingCustomer)
          return res.status(400).json({ error: "Customer already exits" });
        const customer = await Customer.findByIdAndUpdate(
          customerId,
          customerUpdated,
          {
            new: true,
          }
        );
        return res.json(customer);
      } else {
        return res.send("not found");
      }
    } else {
      return res.send("not an objectID");
    }
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: "Internal Server Error" }); // Send an error response to the client
  }
};

//delete costumers
const deleteCustomer = async (req, res) => {
  try {
    let authorized = await adminOnly(req.validateToken);
    if (!authorized) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const customerId = req.params.id;

    const check = mongoose.Types.ObjectId.isValid(customerId);
    if (check) {
      const existed = await Customer.findByIdAndDelete(customerId);
      if (existed) {
        return res.send("Customer deleted successfully");
      } else {
        return res.send("not found");
      }
    } else {
      return res.send("not an objectID");
    }
  } catch {
    console.log(err.message);
  }
};

const validateProfile = async (req, res) => {
  // Confirming the email
  const id = req.params.id;
  const token = req.params.token;
  const customer = await Customer.findById(id);
  if (customer) {
    if (customer.confirmed) {
      // Email is already confirmed
      return res.json({
        message: "Email is already confirmed. You can log in.",
      });
    } else if (customer.confirmationToken === token) {
      const customerUpdated = { confirmed: true };
      const updatedCustomer = await Customer.findByIdAndUpdate(
        id,
        customerUpdated,
        {
          new: true,
        }
      );
      if (updatedCustomer)
        return res.json({ message: "Email confirmed. You can now log in." });
    } else {
      return res.json("Invalid Token");
    }
  } else {
    return res
      .status(400)
      .json({ message: "Invalid or expired confirmation link." });
  }
};
const customerCount = async (req, res) => {

  try {
    let authorized = await adminOnly(req.validateToken);
    if (!authorized) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const customerCount = await Customer.countDocuments();
    const customerMonthsCount = await Customer.aggregate([
      {
        $project: {
          month: { $month: '$creationDate' }, // Extract the month from the 'creationDate' field
        },
      },
      {
        $group: {
          _id: '$month',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by month
      },
    ])
    const productMonthsCount = await Product.aggregate([
      {
        $project: {
          month: { $month: '$creationDate' }, // Extract the month from the 'creationDate' field
        },
      },
      {
        $group: {
          _id: '$month',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by month
      },
    ])
    const orderMonthsCount = await Order.aggregate([
      {
        $project: {
          month: { $month: '$orderDate' }, // Extract the month from the 'creationDate' field
        },
      },
      {
        $group: {
          _id: '$month',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by month
      },
    ])
    res.json({ count: customerCount, customerMonthsCount, productMonthsCount, orderMonthsCount, orderMonthsCount });
  } catch (error) {
    console.error('Error while getting customer count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
module.exports = {
  addCustomer,
  loginCustomer,
  getAllCustomers,
  findCustomerByQuery,
  findCustomerById,
  updateCustomer,
  deleteCustomer,
  validateProfile,
  customerCount
};
