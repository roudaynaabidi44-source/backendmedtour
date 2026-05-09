const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'mon_secret_super_securise_2024';

// ========== INSCRIPTION ==========
router.post('/register', async (req, res) => {
    try {
        // 🔥 Accepter les deux formats : name OU (prenom + nom)
        let { accountType, name, prenom, nom, email, password, phone, specialite } = req.body;
        
        // Si name n'est pas fourni mais prenom et nom sont fournis, les combiner
        if (!name && (prenom || nom)) {
            name = `${prenom || ''} ${nom || ''}`.trim();
        }
        
        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Nom, email et mot de passe requis' 
            });
        }
        
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email déjà utilisé' 
            });
        }
        
        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Créer l'utilisateur
        const user = new User({
            accountType: accountType || 'patient',
            name: name,
            email,
            password: hashedPassword,
            phone: phone || '',
            specialite: accountType === 'medecin' ? specialite : null
        });
        
        await user.save();
        
        // Générer le token
        const token = jwt.sign(
            { id: user._id, email: user.email }, 
            JWT_SECRET, 
            { expiresIn: '7d' }
        );
        
        // Réponse
        res.status(201).json({
            success: true,
            message: 'Inscription réussie',
            token,
            user: {
                id: user._id,
                accountType: user.accountType,
                name: user.name,
                email: user.email,
                phone: user.phone,
                membership: user.membership
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur inscription:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ========== CONNEXION ==========
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email et mot de passe requis' 
            });
        }
        
        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email ou mot de passe incorrect' 
            });
        }
        
        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Email ou mot de passe incorrect' 
            });
        }
        
        // Vérifier si le compte est actif
        if (!user.isActive) {
            return res.status(401).json({ 
                success: false, 
                message: 'Compte désactivé. Contactez l\'administrateur.' 
            });
        }
        
        // Générer le token
        const token = jwt.sign(
            { id: user._id, email: user.email }, 
            JWT_SECRET, 
            { expiresIn: '7d' }
        );
        
        // Réponse
        res.json({
            success: true,
            message: 'Connexion réussie',
            token,
            user: {
                id: user._id,
                accountType: user.accountType,
                name: user.name,
                email: user.email,
                phone: user.phone,
                membership: user.membership,
                specialite: user.specialite
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur connexion:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ========== MOT DE PASSE OUBLIÉ ==========
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email requis' 
            });
        }
        
        const user = await User.findOne({ email });
        
        // Sécurité : ne pas révéler si l'email existe
        if (!user) {
            return res.json({ 
                success: true, 
                message: 'Si cet email existe, un lien de réinitialisation a été envoyé' 
            });
        }
        
        // Générer le token de réinitialisation
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
        
        await user.save();
        
        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
        console.log('🔗 Lien de réinitialisation:', resetUrl);
        
        res.json({ 
            success: true, 
            message: 'Si cet email existe, un lien de réinitialisation a été envoyé' 
        });
        
    } catch (error) {
        console.error('❌ Erreur forgot password:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ========== RÉINITIALISER MOT DE PASSE ==========
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        
        if (!password || password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Le mot de passe doit contenir au moins 6 caractères' 
            });
        }
        
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
        
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: 'Token invalide ou expiré' 
            });
        }
        
        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Mettre à jour le mot de passe
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        
        await user.save();
        
        res.json({ 
            success: true, 
            message: 'Mot de passe réinitialisé avec succès' 
        });
        
    } catch (error) {
        console.error('❌ Erreur reset password:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ========== OBTENIR LE PROFIL UTILISATEUR ==========
router.get('/me', authMiddleware, async (req, res) => {
    try {
        res.json({ 
            success: true, 
            user: {
                id: req.user._id,
                accountType: req.user.accountType,
                name: req.user.name,
                email: req.user.email,
                phone: req.user.phone,
                membership: req.user.membership,
                specialite: req.user.specialite
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

module.exports = router;