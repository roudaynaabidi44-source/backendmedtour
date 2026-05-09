const mongoose = require('mongoose');

const doctorEarningSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientName: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['payé', 'en_attente'], default: 'payé' },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DoctorEarning', doctorEarningSchema);