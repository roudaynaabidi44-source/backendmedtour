const mongoose = require('mongoose');

const avisSchema = new mongoose.Schema({
  targetType: { 
    type: String, 
    enum: ['medecin', 'clinique', 'hebergement', 'transport', 'hotel'],  // 👍 'hotel' ajouté
    required: true 
  },
  targetId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    refPath: 'targetModel' 
  },
  targetModel: { 
    type: String, 
    required: true 
  },
  note: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  commentaire: { 
    type: String, 
    required: true 
  },
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  verified: { 
    type: Boolean, 
    default: false 
  },
  response: {                      // ✅ Ajout pour permettre à l'hôtel/médecin/clinique de répondre
    type: String,
    default: null
  }
});

module.exports = mongoose.model('Avis', avisSchema);