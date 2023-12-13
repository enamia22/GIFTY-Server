const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const { adminOrManager, adminOnly } = require("../middleware/authMiddleware");
const Revenue = require("../models/Revenue");
const GiftCard = require("../models/GiftCard");
var fs = require('fs');
const nodemailer = require("nodemailer");
const path = require('path');


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
async function main(to, fullName, receiver, address, orderLink) {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Hi, its me  👻" Mustapha', // sender address
    to: to, // list of receivers
    subject: "Hello ✔", // Subject line
    text: `Hello  ${fullName}`, // plain text body
    html: `<body class="" style="background-color: #f6f6f6; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
    <span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">Hello, ${fullName}</span>
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
                        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Hello, ${fullName},</p>
                        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">You are successfully created an order for ${receiver !== '' ? receiver : 'guest'}</p>
                        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Shipping Address : ${address}</p>
                        <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">We will call you soon to confirm your order</p>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; box-sizing: border-box; width: 100%;" width="100%">
                          <tbody>
                            <tr>
                              <td align="left" style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;" valign="top">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;">
                                  <tbody>
                                    <tr>
                                      <td style="font-family: sans-serif; font-size: 14px; vertical-align: top; border-radius: 5px; text-align: center; background-color: #3498db;" valign="top" align="center" bgcolor="#3498db"> <a href= ${orderLink} target="_blank" style="border: solid 1px #3498db; border-radius: 5px; box-sizing: border-box; cursor: pointer; display: inline-block; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-decoration: none; text-transform: capitalize; background-color: #3498db; border-color: #3498db; color: #ffffff;">Check Order</a> </td>
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



const addOrder = async (req, res) => {
  try {
    let { customer_id, order_items, cart_total_price, receiver, receiverAddress, phoneNumber, cardMessage, customDelivery } = req.body;
    order_items = order_items.split(',');
    async function getPrice(id) {
      const product = await Product.findById(id);
      const productPrice = product.price;
      return productPrice;
    }
    async function pricesArray(order_items) {
      const promises = order_items.map(async (item) => getPrice(item));

      return Promise.all(promises);
    }

    pricesArray(order_items)
      .then(async (allPrices) => {
        const total = allPrices.reduce(
          (accumulator, item) => accumulator + item,
          0
        );
        const newOrder = new Order({
          customer_id,
          order_items,
          receiver,
          receiverAddress,
          phoneNumber,
          orderDate: new Date(),
          cart_total_price,
          cardMessage,
          customDelivery
        });
        const createdOrder = await newOrder.save();
        const customer = await Customer.findById(customer_id);
        const customerFullName = customer.firstName + " " + customer.lastName;
        main(customer.email, customerFullName, receiver, receiverAddress, 'http://localhost:5173/').catch(console.error);
        return res.status(201).json({ message: "Order created successfully", order: createdOrder });
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (e) {
    console.log(e.message);
    return res.status(500).json({ message: "Internal server error " });
  }
};

const getAllOrders = async (req, res) => {
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
      };

      const result = await Order.paginate({}, options);

      async function getCustomerFullName(item) {
        const customer = await Customer.findById(item);
        const fullName = customer.firstName + " " + customer.lastName;
        return fullName;
      }

      async function updatedOrdersArray(array) {
        const promises = array.map(async (item) => {
          const numberOfItems = item.order_items.length;

          const updatedItem = {
            ...item._doc,
            customerFullName: await getCustomerFullName(item._doc.customer_id),
            numberOfItems: numberOfItems,
          };

          return updatedItem;
        });

        return Promise.all(promises);
      }

      updatedOrdersArray(result.docs)
        .then((updatedArray) => {
          result.docs = updatedArray;
          return res.status(201).json(result);
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      return res.status(500).json({ error: "Error retrieving data  from order" });
    }
  } catch (error) {
    console.log("Error retrieving data from order: " + error);
  }
};


const getCustomerOrders = async (req, res) => {
    
  try {
    if (!req.validateToken) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const customerId = new mongoose.Types.ObjectId(req.validateToken.userId);


    const { page = 1, sort = "ASC" } = req.query;
    const limit = 4;
    const sortOption = sort === "DESC" ? "-_id" : "_id";

    try {
      const options = {
        page: page,
        // limit: limit,
        sort: sortOption,
      };

      const result = await Order.paginate({ customer_id: customerId }, options);

      async function getCustomerFullName(item) {
        const customer = await Customer.findById(item);
        const fullName = customer.firstName + " " + customer.lastName;
        return fullName;
      }

      async function updatedOrdersArray(array) {
        const promises = array.map(async (item) => {
          const numberOfItems = item.order_items.length;

          const updatedItem = {
            ...item._doc,
            customerFullName: await getCustomerFullName(item._doc.customer_id),
            numberOfItems: numberOfItems,
          };

          return updatedItem;
        });

        return Promise.all(promises);
      }

      updatedOrdersArray(result.docs)
        .then((updatedArray) => {
          result.docs = updatedArray;
          return res.status(201).json(result);
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      return res.status(500).json({ error: "Error retrieving data  from order" });
    }
  } catch (error) {
    console.log("Error retrieving data from order: " + error);
  }
};


const getOrderById = async (req, res) => {
  try {
    let authorized = await adminOrManager(req.validateToken);
    const orderId = req.params.id;
    const customerOrder = await Order.findById(orderId);
    const customerOrderId = customerOrder.customer_id;
    const customerId = new mongoose.Types.ObjectId(req.validateToken.userId);

    if (authorized || customerId.equals(customerOrderId)) {
      async function getCustomerInfo(customerId) {
        const customer = await Customer.findById(customerId);
        if (customer) {
          return {
            customerId: customer._id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
          };
        }
        return "Customer not found";
      }

      async function getProductDetails(id) {
        const product = await Product.findById(id);
        const details = {
          productId: product._id,
          productName: product.productName,
          productImage: product.productImage,
          productPrice: product.price,
        };
        return details;
      }

      async function getProductInfo(array) {
        const promises = array.map(async (id) => await getProductDetails(id));
        return Promise.all(promises);
      }

      const check = mongoose.Types.ObjectId.isValid(orderId);
      if (check) {
        const order = await Order.findById(orderId);
        if (order) {
          const customerInfo = await getCustomerInfo(order.customer_id);
          const productInfo = await getProductInfo(order.order_items);

          const { customer_id, order_items, ...orderData } = order.toObject();

          const orderWithCustomerInfo = {
            ...orderData,
            customerInfo: customerInfo,
            productDetails: productInfo,
          };

          return res.json(orderWithCustomerInfo);
        } else {
          return res.send("Order not found");
        }
      } else {
        return res.send("not a valid objectID");
      }
    } else {
      return res.status(403).json({ message: "Not authorized" });
    }
  } catch (error) {
    console.log("Error retrieving data  from order: " + error);
  }
};

const updateOrder = async (req, res) => {
  try {
    let authorized = await adminOrManager(req.validateToken);
    if (!authorized) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const orderId = req.params.id;
    const { status } = req.body;

    const check = mongoose.Types.ObjectId.isValid(orderId);
    if (check) {
      const order = await Order.findById(orderId);
      if (order) {
        order.status = status;

        order.lastUpdate = new Date();

        await order.save();
        if (status === 'Closed') {
          const revenue = await Revenue.findOne(); // Get the current revenue document
      
          revenue.total += order.cart_total_price; // Update the total revenue
      
          await revenue.save(); // Save the updated total revenue
        }

        return res.json({
          message: "Order status updated successfully",
          order,
        });
      } else {
        return res.status(404).json({ message: "Order not found" });
      }
    } else {
      return res.status(400).json({ message: "Invalid ObjectID" });
    }
  } catch (error) {
    console.log("Error while updating the order: " + error);
    return res.status(500).json({ error: error.message });
  }
};
const orderCount = async (req, res) => {

  try {
    let authorized = await adminOnly(req.validateToken);
    if (!authorized) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const orderCount = await Order.countDocuments();

    res.json({ count: orderCount });
  } catch (error) {
    console.error('Error while getting order count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
const totalRevenueCount = async (req, res) => {

  try {
    let authorized = await adminOnly(req.validateToken);
    if (!authorized) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const revenue = await Revenue.findOne();

    res.json({ revenue: revenue.total });
  } catch (error) {
    console.error('Error while getting total revenue:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const uploadGiftCard = async (req, res) => {

  try {
    if (!req.validateToken) {
      return res.status(403).json({ message: "Not authorized" });
    }
    let {
      customerId,
    } = req.body;

    // Validation: Check if required fields are missing
    if (
      !customerId 
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const img = req.body.giftCard;
      var regex = /^data:.+\/(.+);base64,(.*)$/;
 
      var matches = img.match(regex);
      var ext = matches[1];
      var data = matches[2];
      var buffer = Buffer.from(data, 'base64'); //file buffer
      var imageName = new Date().getTime(); //file name
 
      fs.writeFileSync(`uploads/giftCards/${imageName}.` + ext, buffer);

    const currentDate = new Date();

    const newGiftCard = new GiftCard({
      customerId: customerId,
      giftCard: `${imageName}.${ext}`,
      creationDate: currentDate,
    });
    const createdGiftCard = await newGiftCard.save();
    return res.status(201).json({ message: "GiftCard added successfully", createdGiftCard});
    
  } catch (error) {
    console.error('Error while uploading GiftCard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCustomerCard = (req, res) => {
  const imagePath = path.join(__dirname, '../uploads/giftCards/', req.params.imageName);
  res.sendFile(imagePath);
};


const getCustomerCards = async (req, res) => {
    
  try {
    if (!req.validateToken) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const customerId = new mongoose.Types.ObjectId(req.validateToken.userId);


    const { page = 1, sort = "ASC" } = req.query;
    const limit = 4;
    const sortOption = sort === "DESC" ? "-_id" : "_id";

    try {
      const options = {
        page: page,
        // limit: limit,
        sort: sortOption,
      };

      const result = await GiftCard.paginate({ customerId: customerId }, options);
      return res.status(201).json(result);

    } catch (error) {
      return res.status(500).json({ error: "Error retrieving data  from order" });
    }
  } catch (error) {
    console.log("Error retrieving data from order: " + error);
  }
};

module.exports = {
  addOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  orderCount,
  totalRevenueCount,
  getCustomerOrders,
  uploadGiftCard,
  getCustomerCards,
  getCustomerCard
};