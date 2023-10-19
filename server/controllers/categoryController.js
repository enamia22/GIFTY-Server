const Category = require("../models/Category");
const User = require("../models/User");
const verifyToken = require("../middleware/authMiddleware");
const mongoose = require('mongoose');

const addCategory = async (req, res) => {
  try {
      const decodedUser = await verifyToken(req);
      if (!decodedUser) {
        return res.status(401).json({ message: "Unauthorized user" });
      }
      const user = await User.findById(decodedUser.id);
      if (user.role !== "admin" && user.role !== "manager") {
        return res.status(401).json({ message: "Unauthorized role" });
      }

      const {categoryName} = req.body;

      if (!categoryName) {
          res.send({message: "missing name"})
      } 

      const existingCategory = await Category.findOne({ categoryName });

      if (existingCategory) {
          return res.status(409).json({ message: "Category already exists"});
      }

      const currentDate = new Date();

      const newCategory = new Category({
          categoryName: categoryName,
          creationDate: currentDate
      });
      const createdCategory = await newCategory.save();
      if (!createdCategory) {
          return res.json({ message: "Category was not created"});
      } else {
          res.json({ message: "Category created successfully"});
      }

  } catch(e) {
      console.log(e.message);
  }
};

const getAllCategories = async (req, res) => {
try {
  const decodedUser = await verifyToken(req);
  if (!decodedUser) {
      return res.status(401).json({ message: "Unauthorized user" });
  }
  const user = await User.findById(decodedUser.id);
  if (user.role !== "admin" && user.role !== "manager") {
      return res.status(401).json({ message: "Unauthorized role" });
  }
    
  const { page = 1, sort = 'ASC' } = req.query;
  const limit = 10;
  const sortOption = sort === 'DESC' ? '-_id' : '_id';

  try {
      const options = {
      page: page,
      limit: limit,
      sort: sortOption,
      };

      const result = await Category.paginate({}, options);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: 'Error retrieving data' });
    }
  } catch (error) {
    console.log("Error retrieving data: " + error);
  }
};

const findCategoryByQuery = async (req, res) => {
  try {
      const decodedUser = await verifyToken(req);
      if (!decodedUser) {
          return res.status(401).json({ message: "Unauthorized user" });
      }
      const user = await User.findById(decodedUser.id);
      if (user.role !== "admin" && user.role !== "manager") {
          return res.status(401).json({ message: "Unauthorized role" });
      }

    const query = req.query.query; 

    const results = await Category.find({ categoryName: { $regex: query, $options: 'i' } });

    res.json(results);
  } catch (error) {
    console.log("Error with query: " + error);
    res.status(500).json({ error: error.message });
  }
};

const findCategoryById = async (req, res) => {
  try {
      const decodedUser = await verifyToken(req);
      if (!decodedUser) {
          return res.status(401).json({ message: "Unauthorized user" });
      }
      const user = await User.findById(decodedUser.id);
      if (user.role !== "admin" && user.role !== "manager") {
          return res.status(401).json({ message: "Unauthorized role" });
      }

    const categoryId = req.params.id;
    const check = mongoose.Types.ObjectId.isValid(categoryId);
    if (check) {
      const category = await Category.findById(categoryId);
      if (category) {
        res.json(category);
      } else {
        res.send("not found");
      }
    } else {
      res.send("not an objectID");
    }
  } catch (error) {
    console.log("Error while looking for the category by id: " + error);
    res.status(500).json({ error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const decodedUser = await verifyToken(req);
    if (!decodedUser) {
        return res.status(401).json({ message: "Unauthorized user" });
    }
    const user = await User.findById(decodedUser.id);
    if (user.role !== "admin" && user.role !== "manager") {
        return res.status(401).json({ message: "Unauthorized role" });
    }

    const categoryId = req.params.id;
    const categoryUpdated = req.body;

    categoryUpdated.lastUpdate = new Date();

    const check = mongoose.Types.ObjectId.isValid(categoryId);
    if (check) {
      const user = await Category.findById(categoryId).select("-password");
      if (user) {
        const existingCategory = await Category.findOne({
          $and: [
            { $or: [{ categoryName: categoryUpdated.categoryName }] },
            { _id: { $ne: categoryId } } 
          ]
        });
        
        if (existingCategory)
        return res.status(400).json({ error: "category already exits" });
        const category = await Category.findByIdAndUpdate(categoryId, categoryUpdated, {
          new: true,
        });
        res.json({"category updated successfully": category});
      } else {
        res.send("not found");
      }
    } else {
      res.send("not an objectID");
    }

  } catch (error){
    console.log("Error while updating the user: " + error);
    res.status(500).json({ error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const decodedUser = await verifyToken(req);
    if (!decodedUser) {
    return res.status(401).json({ message: "Unauthorized user" });
    }
    const user = await User.findById(decodedUser.id);
    if (user.role !== "admin" && user.role !== "manager") {
    return res.status(401).json({ message: "Unauthorized role" });
    }
    
    const categoryId = req.params.id;

    const check = mongoose.Types.ObjectId.isValid(categoryId);
    if (check) {
      const category = await Category.findByIdAndDelete(categoryId);
      if (category) {
        res.send("category deleted successfully");
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
  addCategory,
  getAllCategories,
  findCategoryByQuery,
  findCategoryById,
  updateCategory,
  deleteCategory
};
