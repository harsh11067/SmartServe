const mongoose = require('mongoose');

const FoodStallSchema = new mongoose.Schema({
  stall_name: {
    type: String,
    required: true
  },
  cuisine_type: String,
  location: String,
  owner_name: String,
  is_active: {
    type: Boolean,
    default: true
  },
  managed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FoodStall', FoodStallSchema);
