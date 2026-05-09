const express = require('express');
const multer = require('multer');
const path = require('path');
const { authMiddleware } = require('../middleware/auth');
const Document = require('../models/Document');

const router = express.Router();

// Configuration multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

// UPLOAD DOCUMENT
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        const document = new Document({
            patientId: req.user._id,
            nom: req.file.originalname,
            url: `/uploads/${req.file.filename}`,
            taille: req.file.size
        });
        await document.save();
        
        res.json({ success: true, data: document });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;