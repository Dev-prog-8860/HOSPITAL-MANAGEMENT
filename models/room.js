const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  type: { type: String, required: true }, // e.g., 'General', 'ICU', 'Private'
  capacity: { type: Number, required: true },
  occupied: { type: Number, default: 0 },
  patients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }]
});

module.exports = mongoose.model('Room', roomSchema);
