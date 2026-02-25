// controllers/userController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Middleware asyncHandler pour éviter les try/catch répétitifs
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// --------- AUTH ---------

// Inscription
exports.register = asyncHandler(async (req, res) => {
  const { nom, prenom, email, mdp } = req.body;

  if (!nom || !prenom || !email || !mdp) {
    return res.status(400).json({ message: "Tous les champs sont obligatoires" });
  }

  const userExiste = await User.findOne({ email });
  if (userExiste) {
    return res.status(400).json({ message: "Email déjà utilisé" });
  }

  const salt = await bcrypt.genSalt(10);
  const mdpHash = await bcrypt.hash(mdp, salt);

  const user = await User.create({
    nom,
    prenom,
    email,
    mdp: mdpHash,
    role: req.body.role || "medecin",
    image: req.file ? req.file.filename : null
  });

  res.status(201).json({
    _id: user._id,
    nom: user.nom,
    email: user.email,
    image: user.image
  });
});

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