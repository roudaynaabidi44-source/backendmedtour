const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Reservation = require('../models/Reservation');
const History = require('../models/History');

const router = express.Router();

// Données logistiques (statiques - peuvent rester comme ça)
let logistiqueData = {
    transferts: [
        { id: 1, type: "Transfert Aéroport ↔ Hôtel", description: "Prise en charge à votre arrivée", prix: 50, devise: "€", duree: "30-45 min", inclus: ["Eau fraîche", "WiFi"] },
        { id: 2, type: "Transfert Hôtel ↔ Clinique", description: "Navette quotidienne", prix: 30, devise: "€", duree: "15-20 min", inclus: ["Accompagnement"] },
        { id: 3, type: "Transfert VIP (Berline)", description: "Véhicule de luxe", prix: 120, devise: "€", duree: "Variable", inclus: ["Boissons", "Conciergerie"] }
    ],
    hebergements: [
        { id: 1, nom: "The Pearl Resort 5*", ville: "Tunis", description: "Hôtel de luxe", prixNuit: 120, devise: "€", note: 4.8, equipements: ["Piscine", "Spa"] },
        { id: 2, nom: "Hammamet Beach Resort", ville: "Hammamet", description: "Complexe balnéaire", prixNuit: 90, devise: "€", note: 4.6, equipements: ["Plage privée"] }
    ],
    conseils: ["Prévoyez une tenue confortable", "N'oubliez pas vos ordonnances"],
    formalites: [{ titre: "Visa", description: "Non requis pour UE (séjour < 90j)" }]
};

// GET - Récupérer les données logistiques
router.get('/logistique', (req, res) => {
    res.json({ success: true, data: logistiqueData });
});

// POST - Réserver un service logistique
router.post('/logistique/reserver', authMiddleware, async (req, res) => {
    try {
        const { type, itemId, dateDebut, dateFin, quantite } = req.body;
        
        if (!type || !itemId) {
            return res.status(400).json({ success: false, message: 'Type et ID requis' });
        }
        
        let item = null, nomService = '', prixTotal = 0;
        
        if (type === 'transfert') {
            item = logistiqueData.transferts.find(t => t.id === parseInt(itemId));
            if (!item) return res.status(404).json({ success: false, message: 'Transfert non trouvé' });
            nomService = `Transfert: ${item.type}`;
            prixTotal = item.prix * (quantite || 1);
        } 
        else if (type === 'hebergement') {
            item = logistiqueData.hebergements.find(h => h.id === parseInt(itemId));
            if (!item) return res.status(404).json({ success: false, message: 'Hébergement non trouvé' });
            nomService = `Hébergement: ${item.nom}`;
            
            if (dateDebut && dateFin) {
                const nuits = Math.ceil((new Date(dateFin) - new Date(dateDebut)) / (1000 * 60 * 60 * 24));
                prixTotal = item.prixNuit * nuits;
            } else {
                prixTotal = item.prixNuit * (quantite || 1);
            }
        } 
        else {
            return res.status(400).json({ success: false, message: 'Type invalide' });
        }
        
        // Créer la réservation dans MongoDB
        const newReservation = new Reservation({
            patientId: req.user._id,
            type: 'logistique',
            serviceType: type,
            serviceId: itemId,
            nomService: nomService,
            prix: prixTotal,
            devise: '€',
            dateDebut: dateDebut || new Date(),
            dateFin: dateFin || null,
            quantite: quantite || 1,
            statut: 'Confirmée',
            dateReservation: new Date()
        });
        
        await newReservation.save();
        
        // Ajouter à l'historique
        const newHistory = new History({
            patientId: req.user._id,
            action: 'Réservation logistique',
            clinique: nomService,
            montant: prixTotal,
            details: `Réservation de ${nomService}`,
            date: new Date()
        });
        
        await newHistory.save();
        
        res.status(201).json({ 
            success: true, 
            data: newReservation, 
            message: `✅ ${nomService} réservé` 
        });
        
    } catch (error) {
        console.error('Erreur réservation logistique:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET - Récupérer les réservations logistiques du patient
router.get('/reservations/logistique', authMiddleware, async (req, res) => {
    try {
        const reservations = await Reservation.find({ 
            patientId: req.user._id, 
            type: 'logistique' 
        }).sort({ dateReservation: -1 });
        
        res.json({ success: true, data: reservations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;