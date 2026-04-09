const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    enum: ['Devis demandé', 'Document ajouté', 'Réservation pack', 'Message envoyé', 'Devis approuvé', 'Paiement effectué'],
    required: true,
  },
  clinique: String,
  montant: Number,
  details: String,
  reference: String,
  metadata: mongoose.Schema.Types.Mixed,
  date: {
    type: Date,
    default: Date.now,
  },
});

// Index pour les requêtes rapides
historySchema.index({ patient: 1, date: -1 });

module.exports = mongoose.model('History', historySchema);