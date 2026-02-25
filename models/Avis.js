const mongoose = require("mongoose");

const avisSchema = new mongoose.Schema({
  note: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  commentaire: {
    type: String,
    required: true,
    trim: true
  },
  utilisateur: {
    type: String, // nom ou ID de l'utilisateur
    required: true
  },
  typeElement: {
    type: String, // exemple: "hotel", "circuit"
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Avis", avisSchema);