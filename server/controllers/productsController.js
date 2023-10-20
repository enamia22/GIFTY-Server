const Product = require("../models/Product");
const Category = require("../models/Category");
const { adminOrManager } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");
var uniqid = require("uniqid");

//Add Subcategory
const addProduct = async (req, res) => {
  try {
    let authorized = await adminOrManager(req.validateToken);
    console.log(authorized);
    if (!authorized) {
      res.status(403).json({ message: "Not authorized" });
    }
    let imageProduct;

    if (req.file) {
      imageProduct = req.file.path;
    }
    let {
      productName,
      shortDescription,
      longDescription,
      subcategoryId,
      price,
      discountPrice,
      options,
    } = req.body;

    if (
      !productName ||
      !shortDescription ||
      !longDescription ||
      !subcategoryId ||
      !price ||
      !discountPrice ||
      !options
    ) {
      res.status(200).send({ message: "missing field" });
    }

    const existingProduct = await Product.findOne({ productName });
    if (existingProduct) {
      return res.status(400).json({ error: "Product already exits" });
    }
    const currentDate = new Date();

    const newProduct = new Product({
      sku: uniqid(),
      productName,
      productImage: imageProduct,
      shortDescription,
      longDescription,
      subcategoryId,
      price,
      discountPrice,
      options,
      creationDate: currentDate, // Set the creationDate field to the current timestamp
    });

    const createdProduct = await newProduct.save();
    if (!createdProduct) return res.json({ message: "Product not created" });
    res.status(201).json({ message: "Product created with success" });
  } catch (error) {
    console.log("Error while adding new Product: " + error);
    res.status(500).send(error.message);
  }
};

//get all Products
const getAllProducts = async (req, res) => {
  try {
    let authorized = await adminOrManager(req.validateToken);
    console.log(authorized);
    if (!authorized) {
      res.status(403).json({ message: "Not authorized" });
    }

    const { page = 1, sort = "ASC" } = req.query;
    const limit = 10;
    const sortOption = sort === "DESC" ? "-_id" : "_id";
    // Define the fields you want to retrieve (projection)
    const fieldsToRetrieve =
      "subcategoryId sku productName productImage shortDescription";

    try {
      const options = {
        page: page,
        limit: limit,
        sort: sortOption,
        select: fieldsToRetrieve,
      };
      const result = await Product.paginate({}, options);

      async function getSubCatName(item) {
        const subcategory = await Category.findById(item);
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
      return res.status(500).json({ error: "Error retrieving data" });
    }
  } catch (error) {
    console.log("Error retrieving data: " + error);
    res.status(500).json({ error: error.message });
  }
};

const findProductById = async (req, res) => {
  try {
    let authorized = await adminOrManager(req.validateToken);
    console.log(authorized);
    if (!authorized) {
      res.status(403).json({ message: "Not authorized" });
    }

    const productId = req.params.id;
    const check = mongoose.Types.ObjectId.isValid(productId);
    if (check) {
      const product = await Product.findById(productId);
      if (product) {
        async function getSubCatName(item) {
          const subcategory = await Category.findById(item);
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
        res.status(404).send("not found");
      }
    } else {
      res.status(404).send("not an objectID");
    }
  } catch (error) {
    console.log("Error while looking for the product by id: " + error);
    res.status(500).json({ error: error.message });
  }
};

const findProductByQuery = async (req, res) => {
  try {
    let authorized = await adminOrManager(req.validateToken);
    console.log(authorized);
    if (!authorized) {
      res.status(403).json({ message: "Not authorized" });
    }

    const query = req.query.query;
    const { page = 1, sort = "ASC" } = req.query;
    const limit = 10;
    const sortOption = sort === "DESC" ? "-_id" : "_id";

    // Define the fields you want to retrieve (projection)
    const fieldsToRetrieve =
      "subcategoryId sku productName productImage shortDescription";

    const options = {
      page: page,
      limit: limit,
      sort: sortOption,
      select: fieldsToRetrieve,
    };

    // Define the query to filter products based on the productName using regex
    const queryRegex = { productName: { $regex: query, $options: "i" } };

    // Use Product.paginate to retrieve paginated data with projection
    const result = await Product.paginate(queryRegex, options);

    // const results = await Product.find({ productName: { $regex: query, $options: 'i' } });

    async function getSubCatName(item) {
      const subcategory = await Category.findById(item);
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
    res.status(500).json({ error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    let authorized = await adminOrManager(req.validateToken);
    console.log(authorized);
    if (!authorized) {
      res.status(403).json({ message: "Not authorized" });
    }
    let imageProduct;

    if (req.file) {
      imageProduct = req.file.path;
    }
    const productId = req.params.id;
    const productUpdated = req.body;
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
        res.status(200).json({ "product updated successfuly": updated });
      } else {
        res.status(404).send("not found");
      }
    } else {
      res.status(404).send("not an objectID");
    }
  } catch (error) {
    console.log("Error while updating the product: " + error);
    res.status(500).json({ error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    let authorized = await adminOrManager(req.validateToken);
    console.log(authorized);
    if (!authorized) {
      res.status(403).json({ message: "Not authorized" });
    }

    const productId = req.params.id;

    const check = mongoose.Types.ObjectId.isValid(productId);
    if (check) {
      const product = await Product.findByIdAndDelete(productId);
      if (product) {
        res.status(200).send("product deleted successfully");
      } else {
        res.status(404).send("not found");
      }
    } else {
      res.status(404).send("not an objectID");
    }
  } catch (error) {
    console.log("Error while deleting the product: " + error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  findProductById,
  findProductByQuery,
  updateProduct,
  deleteProduct,
};
