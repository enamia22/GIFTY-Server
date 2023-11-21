const { addActivity } = require('../controllers/activityController');

const trackActivity = async (userId, text, itemId, itemName) => {
    if (userId && text && itemId && itemName) {
      const addedActivity = await addActivity(userId, text, itemId, itemName);
      if(addedActivity){
          return true;
      }else{
        return false;
      }
    }else{
      console.log("not enough information")
      return false;
    }
  };

module.exports = {
    trackActivity
  };