// controllers/userController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Middleware asyncHandler pour éviter les try/catch répétitifs
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// --------- AUTH ---------

// Inscription
exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, mdp } = req.body;

    const userExiste = await User.findOne({ email });
    if (userExiste) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    const user = await User.create({
      nom,
      prenom,
      email,
      mdp,
      image: req.file ? req.file.filename : null
    });

    res.status(201).json({
      _id: user._id,
      nom: user.nom,
      email: user.email,
      image: user.image,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Connexion
exports.login = asyncHandler(async (req, res) => {
  const { email, mdp } = req.body;

  if (!email || !mdp) {
    return res.status(400).json({ message: "Email et mot de passe requis" });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Identifiants invalides" });

  const isMatch = await bcrypt.compare(mdp, user.mdp);
  if (!isMatch) return res.status(400).json({ message: "Identifiants invalides" });

  const token = jwt.sign(
    { id: user._id, role: user.role, nom: user.nom },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    token,
    user: {
      id: user._id,
      nom: user.nom,
      email: user.email,
      role: user.role
    }
  });
});

// --------- CRUD UTILISATEUR ---------

// Ajouter un utilisateur (admin uniquement)
exports.ajouterUtilisateur = asyncHandler(async (req, res) => {
  // Assurer que le mot de passe est hashé si fourni
  if (req.body.mdp) {
    const salt = await bcrypt.genSalt(10);
    req.body.mdp = await bcrypt.hash(req.body.mdp, salt);
  }

  const nouvelUser = await User.create(req.body);
  const { mdp, ...userSansMdp } = nouvelUser.toObject();
  res.status(201).json(userSansMdp);
});

// Lister tous les utilisateurs (exclure mdp)
exports.listerUtilisateurs = asyncHandler(async (req, res) => {
  const users = await User.find().select("-mdp");
  res.json(users);
});

// Récupérer un utilisateur par ID (exclure mdp)
exports.getUtilisateurById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-mdp");
  if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
  res.json(user);
});

// Mettre à jour un utilisateur
exports.updateUtilisateur = asyncHandler(async (req, res) => {
  // Hash du mot de passe si modifié
  if (req.body.mdp) {
    const salt = await bcrypt.genSalt(10);
    req.body.mdp = await bcrypt.hash(req.body.mdp, salt);
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).select("-mdp");

  if (!updatedUser) return res.status(404).json({ message: "Utilisateur non trouvé" });
  res.json(updatedUser);
});

// Supprimer un utilisateur
exports.deleteUtilisateur = asyncHandler(async (req, res) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);
  if (!deletedUser) return res.status(404).json({ message: "Utilisateur non trouvé" });
  res.json({ message: "Utilisateur supprimé avec succès" });
});
const crypto = require("crypto");
const User = require("../models/User");

exports.forgotPassword = async (req, res) => {
 const user = await User.findOne({ email: req.body.email });

 // Ne pas révéler si l'utilisateur existe
 if (!user) {
   return res.json({ message: "Si cet email existe, un lien a été envoyé" });
 }

 // Générer token
 const resetToken = crypto.randomBytes(32).toString("hex");

 // Hasher le token
 const hashedToken = crypto
   .createHash("sha256")
   .update(resetToken)
   .digest("hex");

 user.resetPasswordToken = hashedToken;
 user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min

 await user.save();

 const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

 // Envoyer email
 await sendEmail(user.email, resetUrl);

 res.json({ message: "Email envoyé" });
};
exports.resetPassword = async (req, res) => {
 const crypto = require("crypto");
 const bcrypt = require("bcryptjs");

 const hashedToken = crypto
   .createHash("sha256")
   .update(req.params.token)
   .digest("hex");

 const user = await User.findOne({
   resetPasswordToken: hashedToken,
   resetPasswordExpire: { $gt: Date.now() },
 });

 if (!user) {
   return res.status(400).json({ message: "Token invalide ou expiré" });
 }

 user.password = await bcrypt.hash(req.body.password, 10);

 user.resetPasswordToken = undefined;
 user.resetPasswordExpire = undefined;

 await user.save();

 res.json({ message: "Mot de passe mis à jour" });
};

