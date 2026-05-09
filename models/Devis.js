const mongoose = require('mongoose');

const DevisSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cliniqueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinique', required: true },
  cliniqueNom: { type: String }, // dénormalisé pour affichage rapide
  specialite: { type: String, required: true },
  medecinId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  medecinNom: { type: String },
  montantEstimeParPatient: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['en_attente', 'accepte', 'refuse', 'en_cours', 'termine'],
    default: 'en_attente'
  },
  reponse: {
    montantPropose: { type: Number },
    message: { type: String },
    dateReponse: { type: Date }
  },
  montant: { type: String },
  montantNumerique: { type: Number, default: 0 },
  dossier: { type: String, default: 'En cours' },
  details: { type: mongoose.Schema.Types.Mixed },
  dateDemande: { type: Date, default: Date.now },
  dateReponse: { type: Date },
  messageReponse: { type: String }
});

module.exports = mongoose.models.Devis || mongoose.model('Devis', DevisSchema);