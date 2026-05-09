const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({

  nom: {
    type: String,
    required: true
  },

  adresse: String,

  ville: String,

  pays: String,

  nombreEtoiles: {
    type: Number,
    default: 3
  },

  description: String,

  images: [String],

  telephone: String,

  email: String,

  services: [String],

  // ===== CHAMBRES =====
  rooms: [
    {
      nom: {
        type: String,
        required: true
      },

      description: String,

      prix: {
        type: Number,
        required: true
      },

      vue: {
        type: String,
        enum: ['jardin', 'mer', 'ville', 'piscine'],
        default: 'jardin'
      },

      disponible: {
        type: Boolean,
        default: true
      },

      capacite: {
        type: Number,
        default: 2
      },

      image: String,

      services: [String]
    }
  ],

  // ===== AVIS =====
  reviews: [
    {
      patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
       required: false
      },

      patientName: {
        type: String,
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
        required: true
      },

      date: {
        type: Date,
        default: Date.now
      },

      reponse: String
    }
  ],

  ratingMoyen: {
    type: Number,
    default: 0
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Hotel', hotelSchema);