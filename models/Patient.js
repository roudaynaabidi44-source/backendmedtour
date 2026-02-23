const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  dateNaissance: {
    type: Date,
    required: true
  },
  dossierMedical: {
    type: String
  },

  rendezVous: [
    {
      date: Date,
      service: String,
      statut: {
        type: String,
        enum: ["en attente", "confirmé", "annulé"],
        default: "en attente"
      }
    }
  ],

  avis: [
    {
      commentaire: String,
      note: Number,
      date: { type: Date, default: Date.now }
    }
  ],

  consultations: [
    {
      date: Date,
      medecin: String,
      compteRendu: String
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model("Patient", patientSchema);
