const mongoose = require('mongoose');

const devisSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  clinique: {
    type: String,
    required: true,
  },
  pays: {
    type: String,
    required: true,
  },
  specialite: {
    type: String,
    required: true,
  },
  statut: {
    type: String,
    enum: ['En attente', 'En analyse médicale', 'Approuvé', 'Rejeté', 'Expiré'],
    default: 'En attente',
  },
  montant: {
    type: Number,
  },
  montantDevise: {
    type: String,
    default: '€',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  dossier: {
    type: String,
    enum: ['En cours', 'Complet', 'Incomplet'],
    default: 'En cours',
  },
  details: {
    traitement: String,
    duree: String,
    recommandations: String,
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  }],
  validUntil: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Devis', devisSchema);