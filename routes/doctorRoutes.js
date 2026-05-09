const express = require('express');
const { authMiddleware, doctorMiddleware } = require('../middleware/auth');

const router = express.Router();

// ========== STATISTIQUES ==========
router.get('/stats', authMiddleware, doctorMiddleware, (req, res) => {
    res.json({
        success: true,
        data: {
            totalPatients: 0,
            totalConsultations: 0,
            totalPaid: 0,
            totalPending: 0,
            weeklyStats: [
                { label: 'Sem 10', count: 8 },
                { label: 'Sem 11', count: 11 },
                { label: 'Sem 12', count: 9 },
                { label: 'Sem 13', count: 14 }
            ],
            recentEarnings: []
        }
    });
});

// ========== PATIENTS ==========
router.get('/patients', authMiddleware, doctorMiddleware, (req, res) => {
    res.json({ success: true, data: [] });
});

// ========== AVIS ==========
router.get('/reviews', authMiddleware, doctorMiddleware, (req, res) => {
    res.json({ success: true, data: [] });
});

// ========== RÉPONDRE À UN AVIS ==========
router.post('/reviews/:id/respond', authMiddleware, doctorMiddleware, (req, res) => {
    res.json({ success: true, message: 'Réponse ajoutée' });
});

// ========== RENDEZ-VOUS DU JOUR ==========
router.get('/appointments/today', authMiddleware, doctorMiddleware, (req, res) => {
    res.json({ success: true, data: [] });
});

// ========== VALIDER RENDEZ-VOUS ==========
router.patch('/appointments/:id/validate', authMiddleware, doctorMiddleware, (req, res) => {
    res.json({ success: true, message: 'Rendez-vous validé' });
});

// ========== ANNULER RENDEZ-VOUS ==========
router.delete('/appointments/:id', authMiddleware, doctorMiddleware, (req, res) => {
    res.json({ success: true, message: 'Rendez-vous annulé' });
});

module.exports = router;