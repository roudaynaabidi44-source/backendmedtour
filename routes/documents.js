const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Document = require('../models/Document');

const router = express.Router();

// LISTE DES DOCUMENTS
router.get('/documents', authMiddleware, async (req, res) => {
    try {
        const documents = await Document.find({ patientId: req.user._id });
        res.json({ success: true, data: documents });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// SUPPRIMER DOCUMENT
router.delete('/documents/:id', authMiddleware, async (req, res) => {
    try {
        await Document.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Document supprimé' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;