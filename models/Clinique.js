const mongoose = require('mongoose');

const cliniqueSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  ville: { type: String, required: true },
  adresse: { type: String, required: true },
  telephone: { type: String, required: true },
  email: { type: String, required: true },
  description: { type: String },
  specialites: [{ type: String }],
  note: { type: Number, default: 0 },
  nombreAvis: { type: Number, default: 0 },
  image: { type: String },
  prixConsultationMoyen: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Clinique', cliniqueSchema);