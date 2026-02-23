const mongoose = require("mongoose");

const devisSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },
  medecin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medecin",
    required: true
  },
  description: {
    type: String,
    required: true
  },
  montant: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["en attente", "accepté", "refusé"],
    default: "en attente"
  }
}, { timestamps: true });

module.exports = mongoose.model("Devis", devisSchema);
