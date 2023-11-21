const Product = require("../models/Product");
const SubCategory = require("../models/SubCategory");
const { adminOrManager, adminOnly } = require("../middleware/authMiddleware");
const { trackActivity } = require("../middleware/activityMiddleware");
const mongoose = require("mongoose");
var uniqid = require("uniqid");
const { validationResult } = require("express-validator");
const { sanitizeRequestBody } = require("../middleware/dataValidation");
const path = require('path');

//Add Subcategory
const addProduct = async (req, res) => {
  try {
    let authorized = await adminOrManager(req.validateToken);

    if (!authorized) {
      return res.status(403).json({ message: "Not authorized" });
    }

    let imageProduct;

    if (req.file) {
      imageProduct = req.file.filename;
    }

    let {
      productName,
      shortDescription,
      longDescription,
      subcategoryId,
      price,
      discountPrice,
      options,
      pack,
    } = req.body;

    // Validation: Check if required fields are missing
    if (
      !productName ||
      !shortDescription ||
      !longDescription ||
      !subcategoryId ||
      !price ||
      !discountPrice ||
      !options
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const createProduct = sanitizeRequestBody(req);
    // If there are validation errors, return a response with the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const existingProduct = await Product.findOne({ productName });

    if (existingProduct) {
      return res.status(400).json({ error: "Product already exists" });
    }

    const currentDate = new Date();

    const newProduct = new Product({
      sku: uniqid(),
      productName: createProduct.productName,
      productImage: imageProduct,
      shortDescription: createProduct.shortDescription,
      longDescription: createProduct.shortDescription,
      subcategoryId: createProduct.subcategoryId,
      price: createProduct.price,
      discountPrice: createProduct.discountPrice,
      options: createProduct.options,
      pack: createProduct.pack,
      creationDate: currentDate,
    });

    const createdProduct = await newProduct.save();

    if (!createdProduct) {
      return res.status(500).json({ message: "Product not created" });
    }
    const addActivity = await trackActivity(
      req.validateToken.userId,
      "add Product",
      createdProduct._id,
      createProduct.productName
    );
    if (!addActivity) {
      console.log("activity not added: ");
    }
    return res.status(201).json({ message: "Product created with success" });
  } catch (error) {
    console.log("Error while adding new Product: " + error);
    return res.status(500).json({ error: error.message });
  }
};


// Function to serve product images
const getProductImage = (req, res) => {
  // Assuming product images are stored in the 'uploads/product-images' folder
  const imagePath = path.join(__dirname, '../uploads/', req.params.imageName);
  // Send the image file
  res.sendFile(imagePath);
};

//get all Products
const getAllProducts = async (req, res) => {
  try {
    let authorized = false;

    if (req.validateToken) {
      const checkIfAuthorized = await adminOrManager(req.validateToken);
      if (checkIfAuthorized) {
        authorized = true;
      }
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

      let query = {};

      if (!authorized) {
        // For not authorized users, filter by status true
        query.active = true;
      }

      const result = await Product.paginate(query, options);
      async function getSubCatName(item) {
        try {
          const check = mongoose.Types.ObjectId.isValid(item);
          if (check) {
            const subcategory = await SubCategory.findById(item);
            if (subcategory) {
              const subcategoryName = subcategory.subcategoryName;
              return subcategoryName;
            } else {
              return null; // Handle the case where the document is not found
            }
          } else {
            return null;
          }
        } catch (error) {
          console.error("Error while retrieving subcategory:", error);
          return null; // Handle the error
        }
      }

      async function updateArray(array) {
        const promises = array.docs.map(async (item) => ({
          ...item._doc,
          subcategoryName: await getSubCatName(item.subcategoryId),
        }));

        return Promise.all(promises);
      }

      updateArray(result)
        .then((updatedArray) => {
           result.docs = updatedArray
          return res.status(201).json(result);
        })
        .catch((error) => {
          console.error(error);
        });
    } catch (error) {
      return res.status(500).json({ error: "Error retrieving data from product" });
    }
  } catch (error) {
    console.log("Error retrieving data from product: " + error);
    return res.status(500).json({ error: error.message });
  }
};

const findProductById = async (req, res) => {
  try {
    let authorized = false;

    if (req.validateToken) {
      const checkIfAuthorized = await adminOrManager(req.validateToken);
      if (checkIfAuthorized) {
        authorized = true;
      }
    }
    const productId = req.params.id;
    const check = mongoose.Types.ObjectId.isValid(productId);
    if (check) {
      let query = { _id: productId };

      if (!authorized) {
        // For not authorized users, filter by status true
        query.active = true;
      }

      const product = await Product.findOne(query);

      if (product) {
        async function getSubCatName(item) {
          const subcategory = await SubCategory.findById(item);
          const subcategoryName = subcategory.subcategoryName;
          return subcategoryName;
        }

        // Update the product object with the subcategoryName property
        const updatedProduct = {
          ...product._doc,
          subcategoryName: await getSubCatName(product.subcategoryId),
        };

        return res.status(200).json(updatedProduct);

        // res.status(201).json(product);
      } else {
        return res.status(404).send("not found");
      }
    } else {
      return res.status(404).send("not an objectID");
    }
  } catch (error) {
    console.log("Error while looking for the product by id: " + error);
    return res.status(500).json({ error: error.message });
  }
};

const findProductByQuery = async (req, res) => {
  try {
    let authorized = false;

    if (req.validateToken) {
      const checkIfAuthorized = await adminOrManager(req.validateToken);
      if (checkIfAuthorized) {
        authorized = true;
      }
    }

    const query = req.query.query;
    const { page = 1, sort = "ASC" } = req.query;
    const limit = 4;
    const sortOption = sort === "DESC" ? "-_id" : "_id";

    const options = {
      page: page,
      limit: limit,
      sort: sortOption,
    };

    let result = await Product.paginate({ productName: { $regex: query, $options: 'i' } }, options);

    if (!authorized) { 
      result = result.docs.filter((element) => element.active);
    }

    if (result.length <= 0) {
      return res.status(204).json({ message: "No product found"});
    }

    async function getSubCatName(item) {
      const subcategory = await SubCategory.findById(item);
      const subcategoryName = subcategory.subcategoryName;
      return subcategoryName;
    }
    async function updateArray(array) {
      const promises = array.map(async (item) => ({
        ...item._doc,
        subcategoryName: await getSubCatName(item._doc.subcategoryId),
      }));

      return Promise.all(promises);
    }

    updateArray(result.docs)
      .then((updatedArray) => {
        return res.status(201).json(updatedArray);
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
    console.log("Error with query: " + error);
    return res.status(500).json({ error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    let authorized = await adminOrManager(req.validateToken);
    if (!authorized) {
      return res.status(403).json({ message: "Not authorized" });
    }
    let imageProduct;

    if (req.file) {
      imageProduct = req.file.path;
    }
    const productId = req.params.id;

    const productUpdated = sanitizeRequestBody(req);
    // If there are validation errors, return a response with the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    productUpdated.productImage = imageProduct;

    productUpdated.lastUpdate = new Date();

    const check = mongoose.Types.ObjectId.isValid(productId);
    if (check) {
      const product = await Product.findById(productId).select("-password");
      if (product) {
        const existingProduct = await Product.findOne({
          $and: [
            { $or: [{ productName: productUpdated.productName }] },
            { _id: { $ne: productId } }, // search in all users except the current one
          ],
        });

        if (existingProduct)
          return res.status(400).json({ error: "product already exits" });

        const updated = await Product.findByIdAndUpdate(
          productId,
          productUpdated,
          {
            new: true,
          }
        );
        if (updated) {
          const addActivity = await trackActivity(
            req.validateToken.userId,
            "update Product",
            productId,
            productUpdated.productName
          );
          if (!addActivity) {
            console.log("activity not added: ");
          }

          return res
            .status(200)
            .json({ "product updated successfuly": updated });
        } else {
          console.log("Error while updating the product");
          return res
            .status(500)
            .json({ error: "Error while updating the product" });
        }
      } else {
        return res.status(404).send("not found");
      }
    } else {
      return res.status(404).send("not an objectID");
    }
  } catch (error) {
    console.log("Error while updating the product: " + error);
    return res.status(500).json({ error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    let authorized = await adminOnly(req.validateToken);
    if (!authorized) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const productId = req.params.id;

    const check = mongoose.Types.ObjectId.isValid(productId);
    if (check) {
      const product = await Product.findByIdAndDelete(productId);
      if (product) {
        const addActivity = await trackActivity(
          req.validateToken.userId,
          "delete Product",
          productId,
          product.productName
        );
        if (!addActivity) {
          console.log("activity not added: ");
        }
        return res.status(200).send("product deleted successfully");
      } else {
        return res.status(404).send("not found");
      }
    } else {
      return res.status(404).send("not an objectID");
    }
  } catch (error) {
    console.log("Error while deleting the product: " + error);
    return res.status(500).json({ error: error.message });
  }
};
const productCount = async (req, res) => {

  try {
    let authorized = await adminOnly(req.validateToken);
    if (!authorized) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const productCount = await Product.countDocuments();

    res.json({ count: productCount });
  } catch (error) {
    console.error('Error while getting Product count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
module.exports = {
  addProduct,
  getAllProducts,
  findProductById,
  findProductByQuery,
  updateProduct,
  deleteProduct,
  productCount,
  getProductImage
};