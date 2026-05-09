const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');                  // ← AJOUTÉ pour générer token
const nodemailer = require('nodemailer');        // ← À installer si pas déjà fait

const router = express.Router();

// ========== INSCRIPTION ==========
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, accountType } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
        }
        
        const user = new User({
            name,
            email,
            password,
            accountType: accountType || 'patient'
        });
        
        await user.save();
        
        res.status(201).json({ 
            success: true, 
            message: 'Utilisateur créé avec succès',
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== CONNEXION ==========
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
        }
        
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
        }
        
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { id: user._id, email: user.email }, 
            process.env.JWT_SECRET || 'mon_secret_super_securise_2024',
            { expiresIn: '7d' }
        );
        
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                accountType: user.accountType
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== PROFIL ==========
router.get('/profile', authMiddleware, async (req, res) => {
    res.json({ success: true, user: req.user });
});

// ========== LISTE DES UTILISATEURS (ADMIN) ==========
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
});

// ========== OBTENIR UN UTILISATEUR ==========
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== MODIFIER UN UTILISATEUR ==========
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== SUPPRIMER UN UTILISATEUR ==========
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Utilisateur supprimé' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== MOT DE PASSE OUBLIÉ ==========
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            // Sécurité : on renvoie le même message même si l'email n'existe pas
            return res.json({ success: true, message: "Si cet email existe, un lien a été envoyé" });
        }

        // Générer un token aléatoire
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save();

        // Construire le lien de réinitialisation (adapter le port frontend)
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        // Configuration de Nodemailer (à adapter avec tes identifiants)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,   // ex: 'tonemail@gmail.com'
                pass: process.env.EMAIL_PASS,   // mot de passe d'application Gmail
            },
        });

        await transporter.sendMail({
            to: email,
            subject: 'Réinitialisation de votre mot de passe',
            html: `<p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                   <p>Cliquez sur le lien ci-dessous (valable 15 minutes) :</p>
                   <a href="${resetUrl}">${resetUrl}</a>
                   <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>`,
        });

        res.json({ success: true, message: "Email envoyé" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
});

// ========== RÉINITIALISATION DU MOT DE PASSE ==========
router.put('/reset-password/:token', async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Lien invalide ou expiré" });
        }

        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "Mot de passe trop court (min 6 caractères)" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ success: true, message: "Mot de passe mis à jour" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
});

module.exports = router;