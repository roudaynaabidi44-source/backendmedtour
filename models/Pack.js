const mongoose = require('mongoose');

const packSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reference: {
    type: String,
    unique: true,
  },
  nom: {
    type: String,
    required: true,
  },
  destination: String,
  dateDepart: Date,
  dateRetour: Date,
  statut: {
    type: String,
    enum: ['En préparation', 'Confirmé', 'En cours', 'Terminé', 'Annulé'],
    default: 'En préparation',
  },
  etapes: [{
    nom: String,
    date: Date,
    statut: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
    },
  }],
  details: [{
    icone: String,
    titre: String,
    valeur: String,
    sousTitre: String,
  }],
  itineraire: [{
    date: String,
    activite: String,
    details: String,
  }],
  montant: Number,
  paiement: {
    statut: {
      type: String,
      enum: ['En attente', 'Partiel', 'Complet'],
      default: 'En attente',
    },
    montantPaye: { type: Number, default: 0 },
    datePaiement: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Générer référence unique avant sauvegarde
packSchema.pre('save', async function(next) {
  if (!this.reference) {
    const count = await this.constructor.countDocuments();
    this.reference = `PACK-${new Date().getFullYear()}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model('Pack', packSchema);