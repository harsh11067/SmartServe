const mongoose = require('mongoose');

const SeatingTableSchema = new mongoose.Schema({
  table_number: {
    type: String,
    required: true,
    unique: true
  },
  capacity: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['free', 'occupied', 'maintenance'],
    default: 'free'
  },
  location: String,
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SeatingTable', SeatingTableSchema);
