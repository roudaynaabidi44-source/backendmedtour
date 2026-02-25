const mongoose = require("mongoose");

const rendezVousSchema = new mongoose.Schema({
  nomClient: { type: String, required: true },
  emailClient: { type: String, required: true },
  date: { type: Date, required: true },
  heure: { type: String, required: true },
  service: { type: String, required: true }, // exemple: "consultation", "massage", etc.
  status: { type: String, enum: ["en attente", "confirmé", "annulé"], default: "en attente" },
}, { timestamps: true });

module.exports = mongoose.model("RendezVous", rendezVousSchema);