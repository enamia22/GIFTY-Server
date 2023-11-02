const SubCategory = require("../models/SubCategory");
const { adminOrManager, adminOnly } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");
const { trackActivity } = require("../middleware/activityMiddleware");

//Add Subcategory
const addSubcategory = async (req, res) => {
  try {
    let authorized = await adminOrManager(req.validateToken);
    console.log(authorized);
    if (!authorized) {
      return res.status(403).json({ message: "Not authorized" });
    }
    let { subcategoryName, categoryId, active } = req.body;

    if (!subcategoryName || !categoryId) {
      return res.status(200).send({ message: "missing field" });
    }

    const existingCategory = await SubCategory.findOne({ subcategoryName });
    if (existingCategory) {
      return res.status(400).json({ error: "subcategory already exits" });
    }
    const currentDate = new Date();

    const newCategory = new SubCategory({
      subcategoryName,
      categoryId,
      active,
      creationDate: currentDate, // Set the creationDate field to the current timestamp
    });

    const createdCategory = await newCategory.save();
    if (!createdCategory)
      return res.json({ message: "subcategory not created" });

    const addActivity = await trackActivity(
      req.validateToken.userId,
      "add subcategory",
      createdCategory._id,
      subcategoryName
    );
    if (!addActivity) {
      console.log("activity not added: ");
    }
    return res.json({ message: "subcategory created with success" });
  } catch (error) {
    console.log("Error while adding new subcategory: " + error);
    return res.status(500).send(error.message);
  }
};

//get subcategories
const getAllSubcategories = async (req, res) => {
  try {
    let authorized = false;

    if (req.validateToken) {
      const checkIfAuthorized = await adminOrManager(req.validateToken);
      if (checkIfAuthorized) {
        authorized = true;
      }
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

      let query = {};

      if (!authorized) {
        // For not authorized users, filter by status true
        query.active = true;
      }

      const result = await SubCategory.paginate(query, options);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: "Error retrieving data" });
    }
  } catch (error) {
    console.log("Error retrieving data: " + error);
    return res.status(500).json({ error: error.message });
  }
};

const findSubcategoryById = async (req, res) => {
  try {
    let authorized = false;

    if (req.validateToken) {
      const checkIfAuthorized = await adminOrManager(req.validateToken);
      if (checkIfAuthorized) {
        authorized = true;
      }
    }

    const subcategoryId = req.params.id;
    const check = mongoose.Types.ObjectId.isValid(subcategoryId);
    if (check) {
      let query = { _id: subcategoryId };

      if (!authorized) {
        // For not authorized users, filter by status true
        query.active = true;
      }
      const subcategory = await SubCategory.findOne(query);

      if (subcategory) {
        return res.json(subcategory);
      } else {
        return res.send("not found");
      }
    } else {
      return res.send("not an objectID");
    }
  } catch (error) {
    console.log("Error while looking for the subcategory by id: " + error);
    return res.status(500).json({ error: error.message });
  }
};

const findSubcategoryByQuery = async (req, res) => {
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

    // Define the query to filter subcategories based on the subcategoryName using regex
    const queryRegex = { subcategoryName: { $regex: query, $options: "i" } };

    if (!authorized) {
      // For not authorized users, filter by status true
      queryRegex.active = true;
    }

    const results = await SubCategory.paginate(queryRegex, options);

    return res.json(results);
  } catch (error) {
    console.log("Error with query: " + error);
    return res.status(500).json({ error: error.message });
  }
};

const updateSubcategory = async (req, res) => {
  try {
    let authorized = await adminOrManager(req.validateToken);
    console.log(authorized);
    if (!authorized) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const subcategoryId = req.params.id;
    const subcategoryUpdated = req.body;

    subcategoryUpdated.lastUpdate = new Date();

    const check = mongoose.Types.ObjectId.isValid(subcategoryId);
    if (check) {
      const subCategory = await SubCategory.findById(subcategoryId);
      if (subCategory) {
        const existingCategory = await SubCategory.findOne({
          $and: [
            { $or: [{ subcategoryName: subcategoryUpdated.subcategoryName }] },
            { _id: { $ne: subcategoryId } }, // search in all users except the current one
          ],
        });

        if (existingCategory)
          return res.status(400).json({ error: "subcategory already exits" });
        const subcategory = await SubCategory.findByIdAndUpdate(
          subcategoryId,
          subcategoryUpdated,
          {
            new: true,
          }
        );
        if (subcategory) {
          console.log(
            req.validateToken.userId,
            "update subcategory",
            subcategoryId,
            subCategory.subcategoryName
          );
          const addActivity = await trackActivity(
            req.validateToken.userId,
            "update subcategory",
            subcategoryId,
            subCategory.subcategoryName
          );
          if (!addActivity) {
            console.log("activity not added: ");
          }
          return res.json({ "subcategory updated successfuly": subcategory });
        } else {
          return res.send("subcategory not updated");
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

const deleteSubcategory = async (req, res) => {
  try {
    let authorized = await adminOrManager(req.validateToken);
    console.log(authorized);
    if (!authorized) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const subcategoryId = req.params.id;

    const check = mongoose.Types.ObjectId.isValid(subcategoryId);
    if (check) {
      const subcategory = await SubCategory.findByIdAndDelete(subcategoryId);
      if (subcategory) {
        const addActivity = await trackActivity(
          req.validateToken.userId,
          "delete subcategory",
          subcategoryId,
          subcategory.subcategoryName
        );
        if (!addActivity) {
          console.log("activity not added: ");
        }
        return res.send("subcategory deleted successfully");
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
  addSubcategory,
  getAllSubcategories,
  findSubcategoryById,
  findSubcategoryByQuery,
  updateSubcategory,
  deleteSubcategory,
};
