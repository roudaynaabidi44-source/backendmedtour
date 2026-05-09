const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['transfert', 'hebergement'], required: true },
  itemId: { type: Number, required: true },
  dateDebut: { type: Date, required: true },
  dateFin: { type: Date },
  quantite: { type: Number, default: 1 },
  options: { type: Object, default: {} },
  statut: { type: String, default: 'Confirmée' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reservation', reservationSchema);