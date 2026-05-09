const mongoose = require('mongoose');

const contratSchema = new mongoose.Schema({
  medecinId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cliniqueId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, default: '' },
  conditions: { type: String, default: '' },
  honoraires: { type: Number, default: 0 },
  statut: { type: String, enum: ['en_attente', 'accepté', 'refusé', 'annulé'], default: 'en_attente' },
  dateProposition: { type: Date, default: Date.now },
  dateReponse: { type: Date }
});

module.exports = mongoose.model('Contrat', contratSchema);