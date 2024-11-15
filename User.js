const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fname: String,
  lname: String,
  email: String,
  username: String,
  password: String,
  role: {
    type: String,
    enum: ['user', 'admin'], // Assuming roles are 'user' and 'admin'
    default: 'user'},
  isBlocked: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('User', userSchema);
