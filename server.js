const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/hospitalDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const Patient = require('./models/patient');
const Room = require('./models/room');

// Routes

// Get all patients
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await Patient.find().populate('roomId');
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a patient
app.post('/api/patients', async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove a patient
app.delete('/api/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    // Remove from room if assigned
    if (patient.roomId) {
      await Room.findByIdAndUpdate(patient.roomId, { $pull: { patients: patient._id }, $inc: { occupied: -1 } });
    }
    res.json({ message: 'Patient removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all rooms
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await Room.find().populate('patients');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a room
app.post('/api/rooms', async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove a room
app.delete('/api/rooms/:id', async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    // Unassign patients from this room
    await Patient.updateMany({ roomId: room._id }, { roomId: null });
    res.json({ message: 'Room removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign patient to room
app.put('/api/patients/:patientId/assign/:roomId', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.patientId);
    const room = await Room.findById(req.params.roomId);
    if (!patient || !room) return res.status(404).json({ error: 'Patient or Room not found' });
    if (room.occupied >= room.capacity) return res.status(400).json({ error: 'Room is full' });
    // Unassign from previous room if any
    if (patient.roomId) {
      await Room.findByIdAndUpdate(patient.roomId, { $pull: { patients: patient._id }, $inc: { occupied: -1 } });
    }
    // Assign to new room
    patient.roomId = room._id;
    await patient.save();
    await Room.findByIdAndUpdate(room._id, { $push: { patients: patient._id }, $inc: { occupied: 1 } });
    res.json({ message: 'Patient assigned to room' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
