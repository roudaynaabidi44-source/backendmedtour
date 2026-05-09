// models/Historique.js
const mongoose = require('mongoose');

const historiqueSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // ex: "Devis demandé", "Document ajouté", "Rendez-vous pris", "Paiement effectué"
  description: { type: String },
  montant: { type: Number },
  refId: { type: mongoose.Schema.Types.ObjectId }, // ID de l'objet concerné (devis, document, etc.)
  typeRef: { type: String }, // 'Devis', 'Document', 'Reservation', 'RendezVous'
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Historique', historiqueSchema);