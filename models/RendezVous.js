const mongoose = require('mongoose');

const RendezVousSchema = new mongoose.Schema({
patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cliniqueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinique' },
  specialite: { type: String },
  dateRendezVous: { type: String, required: true },
  heureRendezVous: { type: String, required: true },
  motif: { type: String },
  status: { 
    type: String, 
    enum: ['En attente', 'Confirmé', 'Annulé', 'Terminé'],
    default: 'En attente'
  },
  createdAt: { type: Date, default: Date.now }
  
});

module.exports = mongoose.model('RendezVous', RendezVousSchema);