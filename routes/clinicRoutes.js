const express = require('express');
const { authMiddleware, clinicMiddleware } = require('../middleware/auth');
const Devis = require('../models/Devis');
const User = require('../models/User');
const Clinique = require('../models/Clinique');
const Message = require('../models/Message');
const DoctorPatient = require('../models/DoctorPatient');

const router = express.Router();

// ========== ROUTES PUBLIQUES (sans authentification) ==========

// Lister toutes les cliniques (publique)
router.get('/cliniques', async (req, res) => {
    try {
        const cliniques = await Clinique.find();
        console.log(`📦 ${cliniques.length} cliniques trouvées`);
        res.json({ success: true, data: cliniques });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Détail d'une clinique (publique)
router.get('/cliniques/:id', async (req, res) => {
    try {
        const clinique = await Clinique.findById(req.params.id);
        if (!clinique) {
            return res.status(404).json({ success: false, message: 'Clinique non trouvée' });
        }
        res.json({ success: true, data: clinique });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Cliniques par ville
router.get('/cliniques/ville/:ville', async (req, res) => {
    try {
        const cliniques = await Clinique.find({ ville: req.params.ville });
        res.json({ success: true, data: cliniques });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Cliniques par spécialité
router.get('/cliniques/specialite/:specialite', async (req, res) => {
    try {
        const cliniques = await Clinique.find({ specialites: req.params.specialite });
        res.json({ success: true, data: cliniques });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== ROUTES PROTÉGÉES (nécessitent authentification clinique) ==========

// Récupérer les demandes de devis pour une clinique
router.get('/devis-requests', authMiddleware, clinicMiddleware, async (req, res) => {
    try {
        const clinicName = req.user.name;
        const clinicDevis = await Devis.find({ clinique: clinicName }).populate('patientId', 'name email phone');
        
        const formatted = clinicDevis.map(d => ({
            id: d._id,
            patientRef: `#PAT-${d.patientId._id}`,
            patientName: d.patientId?.name || 'Inconnu',
            patientEmail: d.patientId?.email || 'Inconnu',
            patientPhone: d.patientId?.phone || 'Non renseigné',
            specialite: d.specialite,
            date: new Date(d.date).toLocaleDateString('fr-FR'),
            statut: d.statut,
            dossierComplet: d.dossier === 'Complet',
            devisId: d._id,
            montant: d.montant,
            dateDepart: d.dateDepart,
            dateRetour: d.dateRetour,
            reponseClinique: d.reponseClinique || null
        }));
        
        res.json({ success: true, data: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Répondre à une demande de devis
router.post('/devis-respond/:id', authMiddleware, clinicMiddleware, async (req, res) => {
    try {
        const { statut, message, prixPropose, dateProposee } = req.body;
        
        const devis = await Devis.findById(req.params.id);
        if (!devis) return res.status(404).json({ success: false, message: 'Devis non trouvé' });
        if (devis.clinique !== req.user.name) return res.status(403).json({ success: false, message: 'Non autorisé' });
        
        devis.statut = statut;
        if (prixPropose) {
            devis.montantNumerique = prixPropose;
            devis.montant = `${prixPropose} €`;
        }
        devis.reponseClinique = {
            message: message,
            prixPropose: prixPropose,
            dateProposee: dateProposee,
            reponduLe: new Date()
        };
        
        await devis.save();
        
        // Envoyer un message au patient
        const newMessage = new Message({
            from: req.user._id,
            fromName: req.user.name,
            to: devis.patientId,
            message: `📋 Réponse à votre devis #${devis._id}\n\n${message}\n\n💰 Prix proposé: ${prixPropose || devis.montant}\n📅 Date proposée: ${dateProposee || 'À convenir'}`,
            subject: `Réponse à votre devis - ${devis.specialite}`
        });
        await newMessage.save();
        
        res.json({ success: true, data: devis, message: 'Réponse envoyée au patient' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Accepter l'offre de la clinique (patient)
router.post('/patient/accept-devis/:id', authMiddleware, async (req, res) => {
    try {
        const devis = await Devis.findById(req.params.id);
        if (!devis) return res.status(404).json({ success: false, message: 'Devis non trouvé' });
        if (devis.patientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }
        
        devis.statut = 'Accepté par patient';
        await devis.save();
        
        // Envoyer un message à la clinique
        const clinic = await User.findOne({ name: devis.clinique });
        if (clinic) {
            const message = new Message({
                from: req.user._id,
                fromName: req.user.name,
                to: clinic._id,
                message: `✅ Le patient ${req.user.name} a accepté votre offre pour le devis #${devis._id} (${devis.specialite}).\n\n💰 Montant: ${devis.montant}`,
                subject: `Offre acceptée - Devis #${devis._id}`
            });
            await message.save();
        }
        
        res.json({ success: true, data: devis });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Statistiques clinique
router.get('/stats', authMiddleware, clinicMiddleware, async (req, res) => {
    try {
        const clinicName = req.user.name;
        const clinique = await Clinique.findOne({ nom: clinicName });
        
        const clinicDevis = await Devis.find({ clinique: clinicName });
        const totalDevis = clinicDevis.length;
        const totalGains = clinicDevis.reduce((sum, d) => sum + (d.montantNumerique || 0), 0);
        
        const clinicPatients = await DoctorPatient.find({ doctorId: clinique?._id });
        const uniquePatients = [...new Map(clinicPatients.map(p => [p.patientId.toString(), p])).values()];
        const totalPatients = uniquePatients.length;
        
        res.json({
            success: true,
            data: { totalDevis, totalPatients, totalGains }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Rendez-vous planning
router.get('/appointments', authMiddleware, clinicMiddleware, (req, res) => {
    const planning = [
        { id: 1, patient: 'Marie Lambert', chirurgie: 'Liposuccion', date: '2024-05-20', status: 'Confirmé' },
        { id: 2, patient: 'Sophie Dubois', chirurgie: 'Lifting visage', date: '2024-05-22', status: 'En attente' },
        { id: 3, patient: 'Jean Dupont', chirurgie: 'Rhinoplastie', date: '2024-05-25', status: 'Confirmé' }
    ];
    res.json({ success: true, data: planning });
});

// Packs catalogue
router.get('/packs', authMiddleware, clinicMiddleware, (req, res) => {
    const catalog = [
        { id: 1, nom: 'Pack Sérénité', type: 'Chirurgie Esthétique', prix: 3200, duree: '7 jours' },
        { id: 2, nom: 'Pack Bien-Être', type: 'Dentaire', prix: 1500, duree: '5 jours' },
        { id: 3, nom: 'Pack Vitalité', type: 'Bilan complet', prix: 800, duree: '2 jours' }
    ];
    res.json({ success: true, data: catalog });
});

// Récupérer les patients d'une clinique
router.get('/patients', authMiddleware, clinicMiddleware, async (req, res) => {
    try {
        const clinique = await Clinique.findOne({ nom: req.user.name });
        if (!clinique) {
            return res.json({ success: true, data: [] });
        }
        
        const clinicPatients = await DoctorPatient.find({ doctorId: clinique._id }).populate('patientId', 'name email phone');
        const uniquePatients = [...new Map(clinicPatients.map(p => [p.patientId._id.toString(), p.patientId])).values()];
        
        res.json({ success: true, data: uniquePatients });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Patients avec messages
router.get('/patients-with-messages', authMiddleware, clinicMiddleware, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { from: req.user._id, toType: 'patient' },
                { to: req.user._id, fromType: 'patient' }
            ]
        }).sort({ createdAt: -1 });
        
        const patientIds = new Set();
        messages.forEach(msg => {
            if (msg.from.toString() === req.user._id.toString()) patientIds.add(msg.to.toString());
            if (msg.to.toString() === req.user._id.toString()) patientIds.add(msg.from.toString());
        });
        
        const patients = await User.find({ _id: { $in: Array.from(patientIds) } }).select('name email phone');
        
        const patientsList = patients.map(patient => {
            const lastMessage = messages.find(m => 
                m.from.toString() === patient._id.toString() || m.to.toString() === patient._id.toString()
            );
            const unreadCount = messages.filter(m => 
                m.to.toString() === req.user._id.toString() && !m.lu
            ).length;
            
            return {
                id: patient._id,
                nom: patient.name,
                email: patient.email,
                phone: patient.phone,
                lastMessage: lastMessage?.message || null,
                lastMessageDate: lastMessage?.createdAt || null,
                unreadCount
            };
        });
        
        res.json({ success: true, data: patientsList });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;