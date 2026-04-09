const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  nom: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['medical', 'administratif', 'facture', 'autre'],
    default: 'medical',
  },
  extension: String,
  taille: Number,
  tailleFormatted: String,
  url: String,
  cloudinaryId: String,
  statut: {
    type: String,
    enum: ['En attente', 'Validé', 'Rejeté'],
    default: 'En attente',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  validatedAt: Date,
});

module.exports = mongoose.model('Document', documentSchema);