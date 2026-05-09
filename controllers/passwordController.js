const crypto = require("crypto");
const User = require("../models/User");
const nodemailer = require("nodemailer"); // Ajoute cette librairie

// Configuration pour envoyer des emails
const transporter = nodemailer.createTransport({
  service: "gmail", // ou autre service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Fonction pour envoyer l'email
const sendEmail = async (email, resetUrl) => {
  const message = `
    <h1>Réinitialisation de mot de passe</h1>
    <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
    <a href="${resetUrl}" target="_blank">${resetUrl}</a>
    <p>Ce lien expire dans 15 minutes.</p>
  `;

  await transporter.sendMail({
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Réinitialisation de mot de passe",
    html: message
  });
};

// 1. Mot de passe oublié - Envoyer email
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    // Ne pas révéler si l'utilisateur existe (sécurité)
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
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();

    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    // Envoyer email
    await sendEmail(user.email, resetUrl);

    res.json({ message: "Email envoyé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 2. Réinitialiser le mot de passe
exports.resetPassword = async (req, res) => {
  try {
    // Hasher le token reçu dans l'URL
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // Chercher l'utilisateur avec ce token et non expiré
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Token invalide ou expiré" });
    }

    // Mettre à jour le mot de passe
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};