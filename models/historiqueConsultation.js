const mongoose = require('mongoose');

const historiqueSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  packId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pack', required: true },
  dateConsultation: { type: Date, default: Date.now }
});

// Un patient ne peut avoir qu'une entrée par pack (on mettra à jour la date)
historiqueSchema.index({ patientId: 1, packId: 1 }, { unique: true });

module.exports = mongoose.model('HistoriqueConsultation', historiqueSchema);