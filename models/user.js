const mongoose = require('./index');

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  recipeStore: {
    type: Array,
    required: false,
    default: [],
  },
});

module.exports = mongoose.model('User', userSchema);
