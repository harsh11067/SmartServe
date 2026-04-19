const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  menu_item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  stall_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodStall',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  unit_price: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('OrderItem', OrderItemSchema);
