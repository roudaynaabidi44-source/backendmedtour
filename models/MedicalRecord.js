const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  consultations: [{
    date: Date,
    type: String,
    docteur: String,
    statut: String,
    notes: String,
  }],
  indicateurs: [{
    label: String,
    valeur: String,
    statut: {
      type: String,
      enum: ['good', 'warning', 'danger'],
    },
    date: Date,
  }],
  antecedents: {
    medicaux: [String],
    chirurgicaux: [String],
    allergiques: [String],
  },
  traitements: [{
    nom: String,
    posologie: String,
    debut: Date,
    fin: Date,
    actif: Boolean,
  }],
  interventions: [{
    type: String,
    date: Date,
    clinique: String,
    chirurgien: String,
    resultats: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);