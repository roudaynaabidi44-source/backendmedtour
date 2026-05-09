const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Devis = require('../models/Devis');
const Document = require('../models/Document');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const Message = require('../models/Message');

const router = express.Router();

// PROFIL PATIENT
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true });
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// STATISTIQUES PATIENT
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const documents = await Document.countDocuments({ patientId: req.user._id });
        const reservations = 0;
        const completion = documents > 0 ? 50 : 0;
        
        res.json({
            success: true,
            data: {
                dossierComplet: documents >= 5,
                completion,
                validation: completion,
                reservationsCount: reservations,
                documentsCount: documents
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DEVIS
router.get('/devis', authMiddleware, async (req, res) => {
    try {
        const devis = await Devis.find({ patientId: req.user._id });
        res.json({ success: true, data: devis });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/devis', authMiddleware, async (req, res) => {
    try {
        const devis = new Devis({ ...req.body, patientId: req.user._id });
        await devis.save();
        res.status(201).json({ success: true, data: devis });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DOCUMENTS
router.get('/documents', authMiddleware, async (req, res) => {
    try {
        const documents = await Document.find({ patientId: req.user._id });
        res.json({ success: true, data: documents });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// RENDEZ-VOUS
router.get('/appointments', authMiddleware, async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientId: req.user._id });
        res.json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/appointments', authMiddleware, async (req, res) => {
    try {
        const appointment = new Appointment({ ...req.body, patientId: req.user._id });
        await appointment.save();
        res.status(201).json({ success: true, data: appointment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// MESSAGES
router.get('/messages', authMiddleware, async (req, res) => {
    try {
        const messages = await Message.find({ to: req.user._id });
        res.json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PAIEMENTS
router.get('/payments', authMiddleware, async (req, res) => {
    try {
        const payments = await Payment.find({ patientId: req.user._id });
        res.json({ success: true, data: payments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;