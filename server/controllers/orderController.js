const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const { adminOrManager } = require("../middleware/authMiddleware");

const addOrder = async (req, res) => {
  try {
    let { customer_id, order_items } = req.body;
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
          orderDate: new Date(),
          cart_total_price: total,
        });
        await newOrder.save();
        return res.status(201).json({ message: "Order created successfully" });
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
    console.log(authorized);
    if (!authorized) {
      res.status(403).json({ message: "Not authorized" });
    }

    const { page = 1, sort = "ASC" } = req.query;
    const limit = 10;
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
          return res.status(201).json(updatedArray);
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      return res.status(500).json({ error: "Error retrieving data" });
    }
  } catch (error) {
    console.log("Error retrieving data: " + error);
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

          res.json(orderWithCustomerInfo);
        } else {
          res.send("Order not found");
        }
      } else {
        res.send("not a valid objectID");
      }
    } else {
      res.status(403).json({ message: "Not authorized" });
    }
  } catch (error) {
    console.log("Error retrieving data: " + error);
  }
};

const updateOrder = async (req, res) => {
  try {
    let authorized = await adminOrManager(req.validateToken);
    if (!authorized) {
      res.status(403).json({ message: "Not authorized" });
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

        res.json({ message: "Order status updated successfully", order });
      } else {
        res.status(404).json({ message: "Order not found" });
      }
    } else {
      res.status(400).json({ message: "Invalid ObjectID" });
    }
  } catch (error) {
    console.log("Error while updating the order: " + error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
};
