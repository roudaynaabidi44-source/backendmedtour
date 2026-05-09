const nodemailer = require("nodemailer");

const sendEmail = async (email, url) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,     // ton email Gmail
      pass: process.env.EMAIL_PASS,     // mot de passe d'application Gmail
    },
  });

  await transporter.sendMail({
    to: email,
    subject: "Réinitialisation du mot de passe",
    html: `<p>Cliquez ici pour réinitialiser votre mot de passe :</p>
           <a href="${url}">${url}</a>
           <p>Ce lien expire dans 15 minutes.</p>`,
  });
};

module.exports = sendEmail;