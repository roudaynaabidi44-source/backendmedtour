// models/Specialite.js (si vous passez à MongoDB)
const mongoose = require('mongoose');

const specialiteSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    description: { type: String, required: true },
    icone: { type: String },
    offre: { type: String },
    medecins: { type: Number, default: 0 },
    couleur: { type: String },
    pays: [{ type: String }],
    prixMin: { type: Number },
    prixMax: { type: Number }
});

module.exports = mongoose.model('Specialite', specialiteSchema);