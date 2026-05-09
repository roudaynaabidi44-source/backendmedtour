const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    cliniqueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinique'
    },
    specialite: {
      type: String,
      default: ''
    },
    date: {
      type: Date,        // ou String selon votre choix
      required: true
    },
    heure: {
      type: String,
      required: true
    },
    motif: {
      type: String,
      default: ''
    },
    statut: {
      type: String,
      enum: ['En attente', 'Confirmé', 'rejected', 'Annulé', 'Effectué'],
      default: 'En attente'
    },
    // autres champs éventuels (type, lieu, notes...)
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);