const mongoose = require("mongoose");
const customerModel = require("./Customer.js");
const mongoosePaginate = require("mongoose-paginate-v2");

const giftCardSchema = new mongoose.Schema({
  giftCard: {
    type: String,
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: customerModel,
  },
  lastUpdate: {
    type: Date, // Set the default value to the current timestamp
  },
  creationDate: {
    type: Date, // Set the default value to the current timestamp
  },
});

giftCardSchema.plugin(mongoosePaginate);

const GiftCard = mongoose.model("giftCards", giftCardSchema);

module.exports = GiftCard;
