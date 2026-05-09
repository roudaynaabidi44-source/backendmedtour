const express = require('express');
const Pack = require('../models/Pack');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// LISTE DES PACKS
router.get('/packs', async (req, res) => {
    try {
        const packs = await Pack.find();
        res.json({ success: true, data: packs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DÉTAIL D'UN PACK
router.get('/packs/:id', async (req, res) => {
    try {
        const pack = await Pack.findById(req.params.id);
        res.json({ success: true, data: pack });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// AJOUTER UN AVIS SUR UN PACK
router.post('/packs/:id/avis', authMiddleware, async (req, res) => {
    try {
        const pack = await Pack.findById(req.params.id);
        if (!pack) return res.status(404).json({ success: false, message: 'Pack non trouvé' });
        
        const avis = {
            patient: req.user.name,
            patientId: req.user._id,
            note: req.body.note,
            commentaire: req.body.commentaire,
            date: new Date()
        };
        
        pack.avis.push(avis);
        await pack.save();
        
        res.json({ success: true, data: avis });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;