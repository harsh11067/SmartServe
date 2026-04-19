const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  stall_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodStall',
    required: true
  },
  item_name: {
    type: String,
    required: true
  },
  description: String,
  category: String,
  price: {
    type: Number,
    required: true
  },
  prep_time: Number,
  is_available: {
    type: Boolean,
    default: true
  },
  image_url: String,
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
