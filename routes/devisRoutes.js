const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Devis = require('../models/Devis');

const router = express.Router();

// LISTE DES DEVIS
router.get('/devis', authMiddleware, async (req, res) => {
    try {
        const devis = await Devis.find({ patientId: req.user._id });
        res.json({ success: true, data: devis });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// CRÉER UN DEVIS
router.post('/devis', authMiddleware, async (req, res) => {
    try {
        const devis = new Devis({
            ...req.body,
            patientId: req.user._id
        });
        await devis.save();
        res.status(201).json({ success: true, data: devis });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;