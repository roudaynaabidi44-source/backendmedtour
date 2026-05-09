const nodemailer = require("nodemailer");

const sendEmail = async (email, url) => {
  // Configuration du transporteur
  const transporter = nodemailer.createTransport({
    service: "gmail", // ou "outlook", "yahoo"
    auth: {
      user: process.env.EMAIL_USER,     // Ton email (dans .env)
      pass: process.env.EMAIL_PASS,     // Mot de passe d'application (dans .env)
    },
  });

  // Contenu de l'email
  await transporter.sendMail({
    to: email,
    subject: "Réinitialisation de votre mot de passe - MedTour",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px;">
        <h2 style="color: #4F46E5;">MedTour</h2>
        <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
        <p>Cliquez sur le bouton ci-dessous :</p>
        <a href="${url}" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Réinitialiser</a>
        <p>Ce lien expire dans 15 minutes.</p>
        <hr>
        <small>Si vous n'avez pas fait cette demande, ignorez cet email.</small>
      </div>
    `,
  });
};

module.exports = sendEmail;