const Activity = require("../models/Activity");

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
};
