const mongoose = require('mongoose');

const packSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reference: { type: String, unique: true },
  nom: { type: String, required: true },
  type: { type: String, required: true },
  image: { type: String },
  clinique: { type: String },
  pays: { type: String },
  ville: { type: String },
  note: { type: Number, default: 0 },
  duree: { type: String },
  prix: { type: Number, required: true },
  prixDevise: { type: String, default: '€' },
  description: { type: String },
  soins: [{ type: String }],
  hotel: {
    nom: String,
    type: String,
    inclusion: String
  },
  transferts: [{ type: String }],
  inclus: [{ type: String }],
  nonInclus: [{ type: String }],
  badge: { type: String },                           // ✅ existant : badge (Populaire, Nouveau, Promo, etc.)
  promo: { type: String, default: null },            // ✅ Ajouté : réduction (ex: "-15%", "-20€")
  dateDebutPromo: { type: Date },                    // ✅ Ajouté : début de l'offre promotionnelle
  dateFinPromo: { type: Date },                      // ✅ Ajouté : fin de l'offre promotionnelle
  popularite: { type: Number, default: 0 },
  dateDepart: { type: Date },
  dateRetour: { type: Date },
  statut: { type: String, default: 'Disponible' },
  inclusDetails: [{
    icone: String,
    titre: String,
    description: String,
    details: String
  }],
  itineraire: [{
    jour: Number,
    date: String,
    activite: String,
    details: String,
    horaire: String
  }],
  avis: [{
    patient: String,
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: Date,
    note: Number,
    titre: String,
    commentaire: String
  }],
  medecinsAssocies: [{
    id: Number,
    nom: String,
    specialite: String,
    experience: Number,
    bio: String,
    note: Number
  }],
  images: [{ type: String }]
}, { timestamps: true }); // Optionnel : ajoute createdAt et updatedAt

module.exports = mongoose.model('Pack', packSchema);