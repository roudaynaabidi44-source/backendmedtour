const express = require('express');
const router = express.Router();

// Données temporaires (si t'as pas encore MongoDB)
const specialites = [
    { id: 1, nom: "Cardiologie", medecins: 150, pays: ["Tunisie", "France", "Canada"] },
    { id: 2, nom: "Dermatologie", medecins: 120, pays: ["Tunisie", "France"] },
    { id: 3, nom: "Neurologie", medecins: 80, pays: ["Tunisie", "Canada"] },
    { id: 4, nom: "Pédiatrie", medecins: 200, pays: ["France", "Canada"] },
    { id: 5, nom: "Psychiatrie", medecins: 90, pays: ["Tunisie"] }
];

// ========== ROUTES ==========

// GET toutes les spécialités
router.get('/specialites', (req, res) => {
    res.json({
        success: true,
        data: specialites,
        total: specialites.length
    });
});

// GET spécialité par ID
router.get('/specialites/:id', (req, res) => {
    const specialite = specialites.find(s => s.id === parseInt(req.params.id));
    if (!specialite) {
        return res.status(404).json({ success: false, message: 'Spécialité non trouvée' });
    }
    res.json({ success: true, data: specialite });
});

// GET spécialités par pays
router.get('/specialites/pays/:pays', (req, res) => {
    const resultats = specialites.filter(s => s.pays && s.pays.includes(req.params.pays));
    res.json({ success: true, data: resultats, total: resultats.length });
});

// GET spécialités populaires
router.get('/specialites/populaires', (req, res) => {
    const populaires = [...specialites].sort((a, b) => b.medecins - a.medecins).slice(0, 5);
    res.json({ success: true, data: populaires });
});

// GET statistiques
router.get('/specialites/stats', (req, res) => {
    const totalMedecins = specialites.reduce((total, spec) => total + spec.medecins, 0);
    const paysUniques = [...new Set(specialites.flatMap(s => s.pays || []))];
    res.json({
        success: true,
        data: {
            totalSpecialites: specialites.length,
            totalMedecins: totalMedecins,
            paysDisponibles: paysUniques
        }
    });
});

module.exports = router;