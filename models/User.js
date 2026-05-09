const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    accountType: { 
        type: String, 
        enum: ['patient', 'medecin', 'clinique', 'hotel', 'admin'],
        default: 'patient' 
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    membership: { type: String, default: 'Standard' },
    isActive: { type: Boolean, default: true },
    verified: { type: Boolean, default: false },
    country: { type: String, default: 'Non renseigné' },
    certification: { type: String, default: 'En attente' },
    specialite: { type: String, default: null },
    diplome: { type: String, default: null },
    experience: { type: Number, default: 0 },
    note: { type: Number, default: 0 },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    carriere: { type: String, default: '' },
    approved: { type: Boolean, default: false }, // en attente de validation
    adresse: { type: String, default: '' },      // pour clinique/hotel
    address: { type: String, default: '' },      // alias pour hotel (frontend)
    fax: { type: String, default: '' },          // pour hotel
    cv: { type: String, default: '' },
    refusMessage: { type: String, default: '' }
});

userSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);