const mongoose = require('mongoose');

const specialiteSchema = new mongoose.Schema({
  nom: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icone: { type: String, default: '❤️' },
  offre: { type: String },
  medecins: { type: Number, default: 0 },
  couleur: { type: String, default: '#ff6b6b' },
  pays: [{ type: String }],
  prixMin: { type: Number, default: 0 },
  prixMax: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Specialite', specialiteSchema);