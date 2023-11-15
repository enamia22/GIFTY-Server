const Category = require("../models/Category");
const mongoose = require("mongoose");
const { adminOrManager, adminOnly } = require("../middleware/authMiddleware");
const { trackActivity } = require("../middleware/activityMiddleware");

const addCategory = async (req, res) => {
  try {
    let authorized = await adminOrManager(req.validateToken);
    if (!authorized) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const { categoryName, active } = req.body;

    if (!categoryName) {
      return res.send({ message: "missing name" });
    }

    const existingCategory = await Category.findOne({ categoryName });

    if (existingCategory) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const currentDate = new Date();

    const newCategory = new Category({
      categoryName: categoryName,
      active: active,
      creationDate: currentDate,
    });
    const createdCategory = await newCategory.save();
    if (!createdCategory) {
      return res.json({ message: "Category was not created" });
    } else {
      const addActivity = await trackActivity(
        req.validateToken.userId,
        "add category",
        createdCategory._id,
        categoryName
      );
      if (!addActivity) {
        console.log("activity not added: ");
      }
      return res.json({ message: "Category created successfully" });
    }
  } catch (e) {
    console.log(e.message);
  }
};

const getAllCategories = async (req, res) => {
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

      const result = await Category.paginate(query, options);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: "Error retrieving data from category" });
    }
  } catch (error) {
    console.log("Error retrieving data from category: " + error);
  }
};

const findCategoryByQuery = async (req, res) => {
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
    const limit = 10;
    const sortOption = sort === "DESC" ? "-_id" : "_id";

    const options = {
      page: page,
      limit: limit,
      sort: sortOption,
    };

    // Define the query to filter categories based on the categoryName using regex
    const queryRegex = { categoryName: { $regex: query, $options: "i" } };

    if (!authorized) {
      // For not authorized users, filter by status true
      queryRegex.active = true;
    }

    const results = await Category.paginate(queryRegex, options);

    return res.json(results);
  } catch (error) {
    console.log("Error with query: " + error);
    return res.status(500).json({ error: error.message });
  }
};

const findCategoryById = async (req, res) => {
  try {
    let authorized = false;

    if (req.validateToken) {
      const checkIfAuthorized = await adminOrManager(req.validateToken);
      if (checkIfAuthorized) {
        authorized = true;
      }
    }
    const categoryId = req.params.id;
    const check = mongoose.Types.ObjectId.isValid(categoryId);
    if (check) {
      let query = { _id: categoryId };

      if (!authorized) {
        // For not authorized users, filter by status true
        query.active = true;
      }

      const category = await Category.findOne(query);
      if (category) {
        return res.json(category);
      } else {
        return res.send("not found");
      }
    } else {
      return res.send("not an objectID");
    }
  } catch (error) {
    console.log("Error while looking for the category by id: " + error);
    return res.status(500).json({ error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    let authorized = await adminOrManager(req.validateToken);
    if (!authorized) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const categoryId = req.params.id;
    const categoryUpdated = req.body;

    categoryUpdated.lastUpdate = new Date();

    const check = mongoose.Types.ObjectId.isValid(categoryId);
    if (check) {
      const category = await Category.findById(categoryId);
      if (category) {
        const existingCategory = await Category.findOne({
          $and: [
            { $or: [{ categoryName: categoryUpdated.categoryName }] },
            { _id: { $ne: categoryId } },
          ],
        });

        if (existingCategory)
          return res.status(400).json({ error: "category already exits" });
        const category = await Category.findByIdAndUpdate(
          categoryId,
          categoryUpdated,
          {
            new: true,
          }
        );
        if (category) {
          const addActivity = await trackActivity(
            req.validateToken.userId,
            "update category",
            category._id,
            category.categoryName
          );
          if (!addActivity) {
            console.log("activity not added: ");
          }
          return res.json({ "category updated successfully": category });
        } else {
          return res.status(400).json({ error: "category not updated" });
        }
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

const deleteCategory = async (req, res) => {
  try {
    let authorized = await adminOnly(req.validateToken);
    if (!authorized) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const categoryId = req.params.id;

    const check = mongoose.Types.ObjectId.isValid(categoryId);
    if (check) {
      const category = await Category.findByIdAndDelete(categoryId);
      if (category) {
        const addActivity = await trackActivity(
          req.validateToken.userId,
          "delete category",
          categoryId,
          category.categoryName
        );
        if (!addActivity) {
          console.log("activity not added: ");
        }
        return res.send("category deleted successfully");
      } else {
        return res.send("not found");
      }
    } else {
      return res.send("not an objectID");
    }
  } catch (error) {
    console.log("Error while deleting the subcategory: " + error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addCategory,
  getAllCategories,
  findCategoryByQuery,
  findCategoryById,
  updateCategory,
  deleteCategory,
};
