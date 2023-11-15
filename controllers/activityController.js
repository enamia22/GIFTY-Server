const { adminOnly } = require("../middleware/authMiddleware");
const Activity = require("../models/Activity");
const getAllUsersActivities = async (req, res) => {
  try {
    let authorized = await adminOnly(req.validateToken);
    if (!authorized) {
      return res.status(403).json({ message: "Not authorized" });
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

      const result = await Activity.paginate({}, options);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: "Error retrieving data from activities" });
    }
  } catch (error) {
    console.log("Error retrieving data: " + error);
    return res.status(500).json({ error: error.message });
  }
}
const addActivity = async (userId, text, itemId, itemName) => {
  try {
    let createdActivity;
    if (!userId || !text || !itemId || !itemName) {
      return "missing information to add activity";
    }

    const existingUserActivities = await Activity.findOne({ userId: userId });
    const currentDate = new Date();
    if (existingUserActivities) {
      existingUserActivities.activities.push({
        text: text,
        itemId: itemId,
        itemName: itemName,
        creationDate: currentDate,
      });
      createdActivity = await existingUserActivities.save();
    } else {
      const newActivity = new Activity({
        userId: userId,
        activities: [
          {
            text: text,
            itemId: itemId,
            itemName: itemName,
            creationDate: currentDate,
          },
        ],
      });
      createdActivity = await newActivity.save();
    }

    if (!createdActivity) {
      return false;
    } else {
      return true;
    }
  } catch (e) {
    console.log(e.message);
  }
};

module.exports = {
  addActivity,
  getAllUsersActivities
};
