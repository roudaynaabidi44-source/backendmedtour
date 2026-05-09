const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  clinique: { type: String },
  montant: { type: Number },
  details: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('History', historySchema);