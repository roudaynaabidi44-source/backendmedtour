const mongoose = require("mongoose");

const medecinSchema = new mongoose.Schema({
  nom: String,
  prenom: String,
  specialite: String,
  email: { type: String, unique: true },
  mdp: String
});

module.exports = mongoose.model("Medecin", medecinSchema);
