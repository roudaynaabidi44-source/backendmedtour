const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  lu: {
    type: Boolean,
    default: false,
  },
  luAt: Date,
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  }],
  conversationId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index pour les conversations
messageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);