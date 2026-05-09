const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    fax: { type: String, default: '' },
    // Gestion des disponibilités
    disponibilites: {
        chambresStandard: { type: Number, default: 10 },
        chambresSupérieure: { type: Number, default: 5 },
        suites: { type: Number, default: 3 },
        dateMiseÀJour: { type: Date, default: Date.now }
    },
    reservations: [{
        patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        patientNom: String,
        patientEmail: String,
        patientPhone: String,
        typeChambre: String,
        checkin: Date,
        checkout: Date,
        statut: { type: String, enum: ['en attente', 'confirmée', 'annulée'], default: 'en attente' },
        montant: Number,
        dateReservation: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hotel', hotelSchema);