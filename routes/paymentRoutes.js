const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Stripe désactivé temporairement
console.log('⚠️ Stripe désactivé (clé API manquante)');

// CRÉER UN PAIEMENT (version sans Stripe)
router.post('/create-payment-intent', authMiddleware, async (req, res) => {
    try {
        const { amount, description } = req.body;
        
        // Simulation d'un paiement
        const fakePaymentIntent = {
            id: 'fake_' + Date.now(),
            client_secret: 'fake_secret_' + Date.now()
        };
        
        res.json({ 
            success: true, 
            clientSecret: fakePaymentIntent.client_secret,
            message: 'Mode test - Pas de Stripe'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// CONFIRMER PAIEMENT
router.post('/confirm-payment/:id', authMiddleware, async (req, res) => {
    res.json({ success: true, message: 'Paiement confirmé (test)' });
});

// HISTORIQUE DES PAIEMENTS
router.get('/payments', authMiddleware, async (req, res) => {
    res.json({ success: true, data: [] });
});

module.exports = router;