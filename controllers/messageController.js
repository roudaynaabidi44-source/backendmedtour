const Message = require('../models/Message');
const User = require('../models/User');

// Récupérer les messages
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { from: req.user.id },
        { to: req.user.id }
      ]
    })
    .populate('from', 'prenom nom')
    .populate('to', 'prenom nom')
    .sort({ createdAt: -1 })
    .limit(50);

    // Formater les messages
    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      from: msg.from.prenom + ' ' + msg.from.nom,
      to: msg.to.prenom + ' ' + msg.to.nom,
      message: msg.message,
      subject: msg.subject,
      lu: msg.lu,
      date: msg.createdAt,
    }));

    res.json({
      success: true,
      data: formattedMessages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Envoyer un message
exports.sendMessage = async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    // Vérifier que le destinataire existe
    const recipient = await User.findById(to);
    if (!recipient) {
      return res.status(404).json({ message: 'Destinataire non trouvé' });
    }

    const newMessage = await Message.create({
      from: req.user.id,
      to,
      subject,
      message,
      conversationId: generateConversationId(req.user.id, to),
    });

    await newMessage.populate('from', 'prenom nom');
    await newMessage.populate('to', 'prenom nom');

    res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Marquer un message comme lu
exports.markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    if (message.to.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    message.lu = true;
    message.luAt = Date.now();
    await message.save();

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Fonction utilitaire pour générer un ID de conversation
function generateConversationId(user1, user2) {
  return [user1, user2].sort().join('_');
}