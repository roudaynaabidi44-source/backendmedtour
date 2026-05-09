const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const Devis = require('../models/Devis');
const Clinique = require('../models/Clinique');
const Specialite = require('../models/Specialite');
const Message = require('../models/Message');

const router = express.Router();

// ========== STATISTIQUES GLOBALES ==========
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalPatients = await User.countDocuments({ accountType: 'patient' });
        const totalMedecins = await User.countDocuments({ accountType: 'medecin' });
        const totalCliniques = await User.countDocuments({ accountType: 'clinique' });
        const totalAppointments = await Appointment.countDocuments();
        const payments = await Payment.find({ status: 'payé' });
        const totalGains = payments.reduce((sum, p) => sum + p.amount, 0);
        
        res.json({
            success: true,
            data: { totalUsers, totalPatients, totalMedecins, totalCliniques, totalAppointments, totalGains }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== LISTE DES UTILISATEURS ==========
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== MODIFIER UN UTILISATEUR ==========
router.put('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== SUPPRIMER UN UTILISATEUR ==========
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Utilisateur supprimé' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== LISTE DES RENDEZ-VOUS ==========
router.get('/appointments', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const appointments = await Appointment.find().populate('patientId', 'name');
        res.json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== MODIFIER UN RENDEZ-VOUS ==========
router.put('/appointments/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: appointment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== SUPPRIMER UN RENDEZ-VOUS ==========
router.delete('/appointments/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await Appointment.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Rendez-vous supprimé' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== LISTE DES PAIEMENTS ==========
router.get('/payments', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const payments = await Payment.find().populate('patientId', 'name');
        res.json({ success: true, data: payments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== LISTE DES DEVIS ==========
router.get('/devis', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const devis = await Devis.find().populate('patientId', 'name');
        res.json({ success: true, data: devis });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== CLINIQUES EN ATTENTE (Nouveau) ==========
router.get('/cliniques-en-attente', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const cliniques = await User.find({ accountType: 'clinique', verified: false }).select('-password');
        res.json({ success: true, data: cliniques });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== VALIDER UNE CLINIQUE ==========
router.put('/cliniques/:id/valider', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const clinique = await User.findByIdAndUpdate(
            req.params.id,
            { verified: true, certification: 'Validée' },
            { new: true }
        ).select('-password');
        res.json({ success: true, data: clinique });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== ACTIVITÉ RÉCENTE ==========
router.get('/activite-recente', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const recentPatients = await User.find({ accountType: 'patient' })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name country createdAt');
        
        const recentDevis = await Devis.find()
            .sort({ date: -1 })
            .limit(5)
            .populate('patientId', 'name')
            .select('specialite montant date');
        
        const activities = [
            ...recentPatients.map(p => ({
                type: 'patient',
                title: 'Nouveau Patient inscrit',
                details: p.country || 'France',
                date: p.createdAt,
                icon: '👤'
            })),
            ...recentDevis.map(d => ({
                type: 'devis',
                title: 'Réservation Payée',
                details: d.specialite,
                date: d.date,
                montant: d.montant,
                icon: '💳'
            }))
        ];
        
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        res.json({ success: true, data: activities.slice(0, 10) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== PARAMÈTRES PLATEFORME ==========
let platformSettings = {
    siteName: 'MedTour',
    supportEmail: 'support@medtour.com',
    supportPhone: '+216 71 123 456',
    defaultCommission: 10
};

router.get('/settings', authMiddleware, adminMiddleware, (req, res) => {
    res.json({ success: true, data: platformSettings });
});

router.put('/settings', authMiddleware, adminMiddleware, (req, res) => {
    platformSettings = { ...platformSettings, ...req.body };
    res.json({ success: true, data: platformSettings });
});

module.exports = router;