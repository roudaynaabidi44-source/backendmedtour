const mongoose = require("mongoose");

const rendezVousSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient", // ou "User" si collection unique
    required: true
  },
  medecin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medecin",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["en attente", "confirmé", "annulé"],
    default: "en attente"
  },
  remarque: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("RendezVous", rendezVousSchema);