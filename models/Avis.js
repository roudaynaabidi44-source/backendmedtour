const mongoose = require("mongoose");

const avisSchema = new mongoose.Schema({
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
  note: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  commentaire: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("Avis", avisSchema);
