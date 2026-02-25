const mongoose = require("mongoose");

const devisSchema = new mongoose.Schema({
  client: {
    type: String,
    required: true
  },
  emailClient: {
    type: String,
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