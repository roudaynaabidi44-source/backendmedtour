const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

const router = express.Router();

// ENVOYER UN MESSAGE
router.post('/messages/send', authMiddleware, async (req, res) => {
    try {
        const { to, message, subject } = req.body;
        if (!to || !message) {
            return res.status(400).json({ success: false, message: "Destinataire et message requis" });
        }
        const receiver = await User.findById(to);
        if (!receiver) {
            return res.status(404).json({ success: false, message: "Destinataire introuvable" });
        }
        const newMessage = new Message({
            from: req.user._id,
            fromName: req.user.name,
            to: receiver._id,
            toName: receiver.name,
            message,
            subject: subject || '',
        });
        await newMessage.save();
        res.json({ success: true, data: newMessage });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// CONVERSATIONS
router.get('/messages/conversations', authMiddleware, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [{ from: req.user._id }, { to: req.user._id }]
        }).sort({ createdAt: -1 });
        res.json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// MESSAGES NON LUS
router.get('/messages/unread/count', authMiddleware, async (req, res) => {
    try {
        const count = await Message.countDocuments({ to: req.user._id, lu: false });
        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// MARQUER COMME LU
router.patch('/messages/:id/read', authMiddleware, async (req, res) => {
    try {
        await Message.findByIdAndUpdate(req.params.id, { lu: true, luAt: new Date() });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;