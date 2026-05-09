const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nom: { type: String, required: true },
  url: { type: String, required: true },
  taille: { type: Number },
  type: { type: String },
  date: { type: Date, default: Date.now },
  statut: { type: String, default: 'En attente' } // 'Validé', 'En attente'
});

module.exports = mongoose.model('Document', DocumentSchema);