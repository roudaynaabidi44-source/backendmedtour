const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    courseId: { type: String, required: true },
    courseTitle: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'usd' },
    stripeSessionId: { type: String, unique: true },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
    purchasedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Purchase', purchaseSchema);