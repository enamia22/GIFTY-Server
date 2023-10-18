const Category = require("../models/Category");
const { adminOrManager, adminOnly } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");


//Add Subcategory
const addSubcategory = async (req, res) => {
    try {
      adminOrManager(req, res);
      let { 
        subcategoryName, 
        categoryId, 
        active 
      } = req.body;

      if (!subcategoryName || !categoryId ) {
        res.status(400).send({ message: "missing field" });
      }
 
      const existingCategory = await Category.findOne({ subcategoryName });
      if (existingCategory){
        return res.status(400).json({ error: "subcategory already exits" });
      }
      const currentDate = new Date();

      const newCategory = new Category({
        subcategoryName, 
        categoryId, 
        active,
        creationDate: currentDate, // Set the creationDate field to the current timestamp
      });

      const createdCategory =  await newCategory.save();
      if(!createdCategory) return res.json({ message: "subcategory not created" });
      res.status(200).json({ message: "subcategory created with success" });

    } catch (error) {
      console.log("Error while adding new subcategory: " + error);
      res.status(500).send(error.message);
    }
  };


//get subcategories 
const getAllSubcategories = async (req, res) => {
  try {

    adminOrManager(req, res);
    
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
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: 'Error retrieving data' });
    }
  } catch (error) {
    console.log("Error retrieving data: " + error);
    res.status(500).json({ error: error.message });
  }
}

const findSubcategoryById = async (req, res) => {
  try {
    adminOrManager(req, res);

    const subcategoryId = req.params.id;
    const check = mongoose.Types.ObjectId.isValid(subcategoryId);
    if (check) {
      const subcategory = await Category.findById(subcategoryId);
      if (subcategory) {
        res.status(200).json(subcategory);
      } else {
        res.status(404).send("not found");
      }
    } else {
      res.status(404).send("not an objectID");
    }
  } catch (error) {
    console.log("Error while looking for the subcategory by id: " + error);
    res.status(500).json({ error: error.message });
  }
};

const findSubcategoryByQuery = async (req, res) => {
  try {
    adminOrManager(req, res);

    const query = req.query.query; 

    const results = await Category.find({ subcategoryName: { $regex: query, $options: 'i' } });

    res.status(200).json(results);
  } catch (error) {
    console.log("Error with query: " + error);
    res.status(500).json({ error: error.message });
  }
};

const updateSubcategory = async (req, res) => {
  try {
    adminOnly(req, res);

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
            { _id: { $ne: subcategoryId } } // search in all users except the current one
          ]
        });
        
        if (existingCategory)
        return res.status(400).json({ error: "subcategory already exits" });
        const subcategory = await Category.findByIdAndUpdate(subcategoryId, subcategoryUpdated, {
          new: true,
        });
        res.status(200).json({"subcategory updated successfuly": subcategory});
      } else {
        res.status(404).send("not found");
      }
    } else {
      res.status(404).send("not an objectID");
    }

  } catch (error){
    console.log("Error while updating the user: " + error);
    res.status(500).json({ error: error.message });
  }
};

const deleteSubcategory = async (req, res) => {
  try {
    adminOnly(req, res);
    
    const subcategoryId = req.params.id;

    const check = mongoose.Types.ObjectId.isValid(subcategoryId);
    if (check) {
      const subcategory = await Category.findByIdAndDelete(subcategoryId);
      if (subcategory) {
        res.status(200).send("subcategory deleted successfully");
      } else {
        res.status(404).send("not found");
      }
    } else {
      res.status(404).send("not an objectID");
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
    deleteSubcategory
  };