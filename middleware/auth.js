// middleware/auth.js
const User = require('../models/User');

// Middleware d'authentification avec token base64 (compatible backend actuel)
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token d\'authentification manquant' 
            });
        }
        
        const token = authHeader.split(' ')[1];
        let userId;
        
        try {
            // Décoder le token base64 (format: "userId:timestamp")
            const decoded = Buffer.from(token, 'base64').toString();
            userId = decoded.split(':')[0];
            
            // Vérifier que l'ID est un ObjectId MongoDB valide
            if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
                throw new Error('ID invalide');
            }
        } catch (err) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token invalide' 
            });
        }
        
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Utilisateur non trouvé' 
            });
        }
        
        // Vérification optionnelle de compte actif (si tu as ce champ)
        if (user.isActive === false) {
            return res.status(401).json({ 
                success: false, 
                message: 'Compte désactivé' 
            });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({ 
            success: false, 
            message: 'Erreur d\'authentification' 
        });
    }
};

// Middleware pour les rôles
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.accountType)) {
            return res.status(403).json({
                success: false,
                message: `Accès refusé. Rôle requis: ${roles.join(', ')}`
            });
        }
        next();
    };
};

// Middleware Admin
const adminMiddleware = (req, res, next) => {
    if (req.user.accountType !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Accès réservé aux administrateurs'
        });
    }
    next();
};

// Middleware Médecin
const doctorMiddleware = (req, res, next) => {
    if (req.user.accountType !== 'medecin') {
        return res.status(403).json({
            success: false,
            message: 'Accès réservé aux médecins'
        });
    }
    next();
};

// Middleware Clinique
const clinicMiddleware = (req, res, next) => {
    if (req.user.accountType !== 'clinique') {
        return res.status(403).json({
            success: false,
            message: 'Accès réservé aux cliniques'
        });
    }
    next();
};

module.exports = {
    authMiddleware,
    authorizeRoles,
    adminMiddleware,
    doctorMiddleware,
    clinicMiddleware
};