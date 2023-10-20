const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  value: String,
  userId: String,
  email: String,
  role: String,
  expires: Date,
  createdByIp: String,
  createdAt: Date,
  replacedBy: String,
  revokedByIp: String,
  revokedBy: Date,
});

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
module.exports = RefreshToken;