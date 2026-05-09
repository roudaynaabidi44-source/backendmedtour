const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const MedicalRecord = require('../models/MedicalRecord');

const router = express.Router();

// SUIVI MÉDICAL
router.get('/medical/follow-up', authMiddleware, async (req, res) => {
    try {
        const record = await MedicalRecord.findOne({ patientId: req.user._id });
        res.json({ success: true, data: record || {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// INDICATEURS
router.put('/medical/indicators', authMiddleware, async (req, res) => {
    try {
        let record = await MedicalRecord.findOne({ patientId: req.user._id });
        if (!record) {
            record = new MedicalRecord({ patientId: req.user._id });
        }
        record.indicateurs = req.body.indicateurs;
        await record.save();
        res.json({ success: true, data: record });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;