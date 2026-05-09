const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'eur'
  },
  status: {
    type: String,
    enum: ['en_attente', 'en_attente_validation', 'payé', 'échoué', 'remboursé', 'annulé'],
    default: 'en_attente'
  },
  description: {
    type: String,
    required: true
  },
  paymentType: {
    type: String,
    enum: ['service', 'acompte', 'solde', 'devis', 'pack'],
    default: 'service'
  },
  itemId: {
    type: String,
    default: null
  },
  stripePaymentIntentId: {
    type: String,
    unique: true,
    sparse: true
  },
  stripeChargeId: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['carte', 'virement', 'paypal'],
    default: 'carte'
  },
  paidAt: {
    type: Date
  },
  refundedAt: {
    type: Date
  },
  refundId: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware pour mettre à jour paidAt automatiquement
paymentSchema.pre('save', function(next) {
  if (this.status === 'payé' && !this.paidAt) {
    this.paidAt = new Date();
  }
  if (this.status === 'remboursé' && !this.refundedAt) {
    this.refundedAt = new Date();
  }
  next();
});

// Index
paymentSchema.index({ patientId: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);