const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, mdp, role, image } = req.body;

    // Le rôle doit être 'patient', 'medecin' ou 'admin'
    const validRoles = ['patient', 'medecin', 'admin'];
    const userRole = validRoles.includes(role) ? role : 'patient';

    const user = new User({
      nom,
      prenom,
      email,
      mdp,
      role: userRole,
      image
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: `${user.prenom} ${user.nom}`,
        email: user.email,
        accountType: user.role   // ← 'patient', 'medecin' ou 'admin'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, mdp } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(mdp))) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: `${user.prenom} ${user.nom}`,
        email: user.email,
        accountType: user.role   // ← directement le rôle stocké
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-mdp');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
    res.json({
      success: true,
      user: {
        id: user._id,
        name: `${user.prenom} ${user.nom}`,
        email: user.email,
        accountType: user.role,
        image: user.image
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};