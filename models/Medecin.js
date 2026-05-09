const mongoose = require('mongoose');

const medecinSchema = new mongoose.Schema({
  specialiteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialite', required: true },
  nom: { type: String, required: true },
  titre: { type: String },
  hopital: { type: String },
  ville: { type: String },
  pays: { type: String, default: 'Tunisie' },
  prixConsultation: { type: Number },
  note: { type: Number, default: 0 },
  experience: { type: Number, default: 0 },
  disponible: { type: Boolean, default: true },
  disponibilites: [{
    jour: String,
    heures: [String]
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Medecin', medecinSchema);