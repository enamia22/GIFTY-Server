const Category = require("../models/SubCategory");
const { adminOrManager, adminOnly } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

//Add Subcategory
const addSubcategory = async (req, res) => {
  try {
    let authorized = await adminOrManager(req.validateToken);
    console.log(authorized);
    if (!authorized) {
      res.status(403).json({ message: "Not authorized" });
    }
    let { subcategoryName, categoryId, active } = req.body;

    if (!subcategoryName || !categoryId) {
      res.status(200).send({ message: "missing field" });
    }

    const existingCategory = await Category.findOne({ subcategoryName });
    if (existingCategory) {
      return res.status(400).json({ error: "subcategory already exits" });
    }
    const currentDate = new Date();

    const newCategory = new Category({
      subcategoryName,
      categoryId,
      active,
      creationDate: currentDate, // Set the creationDate field to the current timestamp
    });

    const createdCategory = await newCategory.save();
    if (!createdCategory)
      return res.json({ message: "subcategory not created" });
    res.json({ message: "subcategory created with success" });
  } catch (error) {
    console.log("Error while adding new subcategory: " + error);
    res.status(500).send(error.message);
  }
};

//get subcategories
const getAllSubcategories = async (req, res) => {
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

      const result = await Category.paginate({}, options);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: "Error retrieving data" });
    }
  } catch (error) {
    console.log("Error retrieving data: " + error);
    res.status(500).json({ error: error.message });
  }
};

const findSubcategoryById = async (req, res) => {
  try {
    let authorized = await adminOrManager(req.validateToken);
    console.log(authorized);
    if (!authorized) {
      res.status(403).json({ message: "Not authorized" });
    }

    const subcategoryId = req.params.id;
    const check = mongoose.Types.ObjectId.isValid(subcategoryId);
    if (check) {
      const subcategory = await Category.findById(subcategoryId);
      if (subcategory) {
        res.json(subcategory);
      } else {
        res.send("not found");
      }
    } else {
      res.send("not an objectID");
    }
  } catch (error) {
    console.log("Error while looking for the subcategory by id: " + error);
    res.status(500).json({ error: error.message });
  }
};

const findSubcategoryByQuery = async (req, res) => {
  try {
    let authorized = await adminOrManager(req.validateToken);
    console.log(authorized);
    if (!authorized) {
      res.status(403).json({ message: "Not authorized" });
    }

    const query = req.query.query;

    const results = await Category.find({
      subcategoryName: { $regex: query, $options: "i" },
    });

    res.json(results);
  } catch (error) {
    console.log("Error with query: " + error);
    res.status(500).json({ error: error.message });
  }
};

const updateSubcategory = async (req, res) => {
  try {
    let authorized = await adminOnly(req.validateToken);
    console.log(authorized);
    if (!authorized) {
      res.status(403).json({ message: "Not authorized" });
    }

    const subcategoryId = req.params.id;
    const subcategoryUpdated = req.body;

    subcategoryUpdated.lastUpdate = new Date();

    const check = mongoose.Types.ObjectId.isValid(subcategoryId);
    if (check) {
      const user = await Category.findById(subcategoryId).select("-password");
      if (user) {
        const existingCategory = await Category.findOne({
          $and: [
            { $or: [{ subcategoryName: subcategoryUpdated.subcategoryName }] },
            { _id: { $ne: subcategoryId } }, // search in all users except the current one
          ],
        });

        if (existingCategory)
          return res.status(400).json({ error: "subcategory already exits" });
        const subcategory = await Category.findByIdAndUpdate(
          subcategoryId,
          subcategoryUpdated,
          {
            new: true,
          }
        );
        res.json({ "subcategory updated successfuly": subcategory });
      } else {
        res.send("not found");
      }
    } else {
      res.send("not an objectID");
    }
  } catch (error) {
    console.log("Error while updating the user: " + error);
    res.status(500).json({ error: error.message });
  }
};

const deleteSubcategory = async (req, res) => {
  try {
    let authorized = await adminOnly(req.validateToken);
    console.log(authorized);
    if (!authorized) {
      res.status(403).json({ message: "Not authorized" });
    }

    const subcategoryId = req.params.id;

    const check = mongoose.Types.ObjectId.isValid(subcategoryId);
    if (check) {
      const subcategory = await Category.findByIdAndDelete(subcategoryId);
      if (subcategory) {
        res.send("subcategory deleted successfully");
      } else {
        res.send("not found");
      }
    } else {
      res.send("not an objectID");
    }
  } catch (error) {
    console.log("Error while deleting the subcategory: " + error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addSubcategory,
  getAllSubcategories,
  findSubcategoryById,
  findSubcategoryByQuery,
  updateSubcategory,
  deleteSubcategory,
};
