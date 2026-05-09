const mongoose = require('mongoose');

const patientReviewSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  response: { type: String, default: null },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PatientReview', patientReviewSchema);