const mongoose = require('mongoose');

const doctorPatientSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nom: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  location: { type: String },
  lastVisit: { type: Date },
  nextAppointment: { type: Date },
  medicalHistory: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DoctorPatient', doctorPatientSchema);